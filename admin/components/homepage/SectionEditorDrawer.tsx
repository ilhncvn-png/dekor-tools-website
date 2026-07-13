'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Save, Image as ImageIcon, Video, FileText, Trash2, Plus, Eye, EyeOff, Rocket, Archive,
  CalendarClock, History, RotateCcw, Loader2, Link2, ArrowDown, HeartPulse, Check, Undo2, Redo2,
  ChevronUp, ChevronDown, ExternalLink, AlertCircle, Globe2, Copy, UserCircle2, CalendarCheck2,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { Popover } from '@/components/ui/Popover';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { mediaItems, fileDocs, seoRows, type HomepageSection, type RevisionSnapshot, type SectionButton, type SeoRow, type SectionCard } from '@/lib/mock-data';
import {
  publishSection, unpublishSection, scheduleSection, archiveSection, restoreRevision,
  resolvePublishStatus, resolveRevisions, publishStatusLabel, publishStatusTone,
} from '@/lib/publishing-api';
import { computeSectionHealthFlags, computeSectionScore, scoreTone, isValidButtonHref } from '@/lib/section-quality';
import { derivePageNameFromPlacement } from '@/lib/website-graph';
import { cn } from '@/lib/utils';

const CURRENT_ACTOR = 'Selin Arslan';
const SUPPORTED_LANGUAGES = ['TR', 'EN', 'DE'];

type DrawerTab = 'icerik' | 'medya' | 'yayin' | 'saglik' | 'gelismis';
type TextField = 'eyebrow' | 'title' | 'subtitle' | 'description';

interface SectionEditorDrawerProps {
  section: HomepageSection | null;
  onClose: () => void;
  onUpdate?: (updated: HomepageSection) => void;
  /** Public page context — renders "Bu bölüm etkiler: {pageName} → {section.name}" so a section never feels like an abstract record. */
  pageName?: string;
  pagePath?: string;
  /** Page-level SEO audit score (from seoRows), when available — feeds the Sağlık & Skor tab's SEO dimension. */
  pageSeoScore?: number;
  /** Which tab to land on when this section opens — lets a "Medya" or "Yayınla" quick action jump straight to the relevant tab instead of always starting on İçerik. Defaults to 'icerik'. */
  initialTab?: DrawerTab;
  /**
   * Real, optional bridge to the current page's SEO row (title/description/
   * canonical/OG image/robots). When the parent screen has its own seoRows
   * state, wiring this lets edits made here propagate back; when omitted,
   * edits still work and persist for the life of this drawer, they just
   * don't round-trip to the parent's list — same pattern as `onUpdate`.
   */
  onSeoUpdate?: (updated: SeoRow) => void;
  /** Real public URL for this section's page — powers the "Sitede Görüntüle" quick action so a customer can always jump from the editor to what they're actually changing. */
  siteUrl?: string;
  /** Wired to the parent list's real duplicate/delete/visibility handlers so these actions are reachable without ever leaving the editor — a customer should never have to close the drawer to do something they can see on screen. */
  onDuplicate?: (id: string) => void;
  onDelete?: (section: HomepageSection) => void;
  onToggleVisible?: (id: string) => void;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-body-sm font-medium text-near-black dark:text-white/85">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-[11.5px] text-danger">
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </label>
  );
}

function completeLanguage(lang: { title?: string; description?: string }): boolean {
  return Boolean(lang.title?.trim() && lang.description?.trim());
}

/**
 * Full section editing engine — every visible control here loads real
 * state, writes real state on change, validates, autosaves a draft,
 * publishes, and supports undo/redo + revision restore. This is the single
 * shared engine behind every Website Control builder (Home, Manufacturing,
 * About, Export, Yetkili Bayiler, Bayi Ol, Career, Contact, Newsroom, News
 * Detail, Support, Product Detail, Category Template, Products Landing) —
 * fixing a field here upgrades all of them at once.
 */
export function SectionEditorDrawer({ section, onClose, onUpdate, pageName, pagePath, pageSeoScore, initialTab, onSeoUpdate, siteUrl, onDuplicate, onDelete, onToggleVisible }: SectionEditorDrawerProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState(section);
  const [savedSnapshot, setSavedSnapshot] = useState(section);
  const [history, setHistory] = useState<HomepageSection[]>(section ? [section] : []);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState('TR');
  const [pendingAction, setPendingAction] = useState<'publish' | 'unpublish' | 'schedule' | 'archive' | string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab ?? 'icerik');
  const [seoDraft, setSeoDraft] = useState<SeoRow | null>(null);

  useEffect(() => {
    if (section) {
      setDraft(section);
      setSavedSnapshot(section);
      setHistory([section]);
      setHistoryIndex(0);
      setActiveLanguage('TR');
      setScheduleDate(section.scheduledAt ?? '');
      setActiveTab(initialTab ?? 'icerik');
      setSeoDraft(pagePath ? seoRows.find((r) => r.page === pagePath) ?? null : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, initialTab, pagePath]);

  if (!draft) return null;

  const status = resolvePublishStatus(draft);
  const revisions = resolveRevisions(draft);
  const healthFlags = computeSectionHealthFlags(draft, pageSeoScore);
  const score = computeSectionScore(draft, pageSeoScore);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedSnapshot);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const titleError = !draft.title.trim() ? 'Başlık boş olamaz.' : undefined;

  const scoreDimensions: { key: keyof typeof score; label: string }[] = [
    { key: 'visual', label: 'Görsel Bütünlük' },
    { key: 'seo', label: 'SEO' },
    { key: 'translation', label: 'Çeviri' },
    { key: 'media', label: 'Medya' },
    { key: 'accessibility', label: 'Erişilebilirlik' },
    { key: 'publishing', label: 'Yayın' },
  ];

  /** Every field control routes through here — this is the one place `draft` ever changes from a content edit. */
  function updateField(patch: Partial<HomepageSection>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  /** Called on blur (text inputs) or immediately (discrete controls) — pushes the current draft onto the undo stack. */
  function commitHistory(next?: HomepageSection) {
    const snapshot = next ?? draft;
    if (!snapshot) return;
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      if (JSON.stringify(truncated[truncated.length - 1]) === JSON.stringify(snapshot)) return prev;
      const nextHistory = [...truncated, snapshot];
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }

  function updateAndCommit(patch: Partial<HomepageSection>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      commitHistory(next);
      return next;
    });
  }

  function undo() {
    if (!canUndo) return;
    const target = historyIndex - 1;
    setHistoryIndex(target);
    setDraft(history[target]);
  }

  function redo() {
    if (!canRedo) return;
    const target = historyIndex + 1;
    setHistoryIndex(target);
    setDraft(history[target]);
  }

  function saveDraft() {
    if (!draft) return;
    onUpdate?.(draft);
    setSavedSnapshot(draft);
    push({ tone: 'success', title: 'Taslak kaydedildi', description: `${draft.name} güncellendi.` });
  }

  function getText(field: TextField): string {
    if (activeLanguage === 'TR') return draft![field];
    const lang = draft!.languages.find((l) => l.code === activeLanguage);
    return lang?.[field] ?? '';
  }

  function setText(field: TextField, value: string) {
    if (activeLanguage === 'TR') {
      updateField({ [field]: value });
      return;
    }
    const exists = draft!.languages.some((l) => l.code === activeLanguage);
    const nextLanguages = exists
      ? draft!.languages.map((l) => (l.code === activeLanguage ? { ...l, [field]: value } : l))
      : [...draft!.languages, { code: activeLanguage, complete: false, [field]: value }];
    updateField({
      languages: nextLanguages.map((l) => (l.code === activeLanguage ? { ...l, complete: completeLanguage(l as { title?: string; description?: string }) } : l)),
    });
  }

  function commitText() {
    commitHistory(draft ?? undefined);
  }

  function updateButton(index: number, patch: Partial<SectionButton>) {
    updateAndCommit({ buttons: draft!.buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)) });
  }

  function addButton() {
    updateAndCommit({ buttons: [...draft!.buttons, { label: 'Yeni Buton', href: '/', style: 'ikincil', newTab: false, visible: true }] });
  }

  function removeButton(index: number) {
    updateAndCommit({ buttons: draft!.buttons.filter((_, i) => i !== index) });
  }

  function moveButton(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft!.buttons.length) return;
    const next = [...draft!.buttons];
    [next[index], next[target]] = [next[target], next[index]];
    updateAndCommit({ buttons: next });
  }

  function updateCard(index: number, patch: Partial<SectionCard>) {
    const cards = draft!.cards ?? [];
    updateAndCommit({ cards: cards.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  }

  function updateCardSpec(cardIndex: number, specIndex: number, patch: Partial<{ label: string; value: string }>) {
    const cards = draft!.cards ?? [];
    const card = cards[cardIndex];
    const specs = (card.specs ?? []).map((s, i) => (i === specIndex ? { ...s, ...patch } : s));
    updateAndCommit({ cards: cards.map((c, i) => (i === cardIndex ? { ...c, specs } : c)) });
  }

  function addCardSpec(cardIndex: number) {
    const cards = draft!.cards ?? [];
    const card = cards[cardIndex];
    updateAndCommit({ cards: cards.map((c, i) => (i === cardIndex ? { ...c, specs: [...(c.specs ?? []), { label: 'ETİKET', value: 'DEĞER' }] } : c)) });
  }

  function removeCardSpec(cardIndex: number, specIndex: number) {
    const cards = draft!.cards ?? [];
    const card = cards[cardIndex];
    updateAndCommit({ cards: cards.map((c, i) => (i === cardIndex ? { ...c, specs: (c.specs ?? []).filter((_, si) => si !== specIndex) } : c)) });
  }

  function addCard() {
    const cards = draft!.cards ?? [];
    updateAndCommit({ cards: [...cards, { id: `card-${Date.now()}`, title: 'Yeni Kart', description: '', specs: [] }] });
  }

  function removeCard(index: number) {
    const cards = draft!.cards ?? [];
    updateAndCommit({ cards: cards.filter((_, i) => i !== index) });
  }

  function moveCard(index: number, direction: -1 | 1) {
    const cards = draft!.cards ?? [];
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    updateAndCommit({ cards: next });
  }

  function updateStat(index: number, patch: Partial<{ label: string; value: string }>) {
    const stats = draft!.stats ?? [];
    updateAndCommit({ stats: stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  }

  function addStat() {
    const stats = draft!.stats ?? [];
    updateAndCommit({ stats: [...stats, { label: 'Yeni İstatistik', value: '0' }] });
  }

  function removeStat(index: number) {
    const stats = draft!.stats ?? [];
    updateAndCommit({ stats: stats.filter((_, i) => i !== index) });
  }

  function moveStat(index: number, direction: -1 | 1) {
    const stats = draft!.stats ?? [];
    const target = index + direction;
    if (target < 0 || target >= stats.length) return;
    const next = [...stats];
    [next[index], next[target]] = [next[target], next[index]];
    updateAndCommit({ stats: next });
  }

  function selectMedia(name: string) {
    updateAndCommit({ mediaName: name });
  }

  function removeMedia() {
    updateAndCommit({ mediaType: 'yok', mediaName: '', mediaAlt: '', mediaCaption: '' });
  }

  function updateSeoField(patch: Partial<SeoRow>) {
    setSeoDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function saveSeo() {
    if (!seoDraft) return;
    onSeoUpdate?.(seoDraft);
    push({ tone: 'success', title: 'SEO bilgileri kaydedildi', description: seoDraft.page });
  }

  const compareRevisions = compareIds.map((id) => revisions.find((r) => r.id === id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const [revA, revB] = compareRevisions.length === 2 ? compareRevisions : [null, null];
  const compareFields: { key: keyof RevisionSnapshot; label: string }[] = [
    { key: 'eyebrow', label: 'Üst Etiket' },
    { key: 'title', label: 'Başlık' },
    { key: 'subtitle', label: 'Alt Başlık' },
    { key: 'description', label: 'Açıklama' },
  ];

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function runAction<T extends { section: HomepageSection }>(actionKey: string, task: () => Promise<T>) {
    if (!draft) return;
    setPendingAction(actionKey);
    try {
      const { section: updated } = await task();
      setDraft(updated);
      setSavedSnapshot(updated);
      onUpdate?.(updated);
    } finally {
      setPendingAction(null);
    }
  }

  const matchedMedia = draft.mediaType === 'gorsel' || draft.mediaType === 'video'
    ? mediaItems.find((m) => m.name === draft.mediaName || m.title === draft.mediaName)
    : undefined;
  const matchedFile = draft.mediaType === 'belge' ? fileDocs.find((f) => f.name === draft.mediaName) : undefined;
  const mediaLibraryOptions = draft.mediaType === 'video' ? mediaItems.filter((m) => m.type === 'video') : mediaItems.filter((m) => m.type === 'image');

  return (
    <Drawer
      open={Boolean(section)}
      onClose={onClose}
      title={draft.name}
      description={draft.type}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
            {isDirty && <Badge tone="warning">Kaydedilmemiş değişiklik</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={undo} disabled={!canUndo} className="flex h-8 w-8 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/5" aria-label="Geri al" title="Geri al">
              <Undo2 size={14} />
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} className="flex h-8 w-8 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/5" aria-label="Yinele" title="Yinele">
              <Redo2 size={14} />
            </button>
            <Button variant="secondary" icon={<Save size={14} />} onClick={saveDraft}>Taslağı Kaydet</Button>
            {status !== 'yayinda' && (
              <Button
                icon={pendingAction === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                disabled={pendingAction !== null || Boolean(titleError)}
                onClick={() => { onUpdate?.(draft); runAction('publish', () => publishSection({ section: draft, actor: CURRENT_ACTOR })); }}
              >
                Yayınla
              </Button>
            )}
          </div>
        </div>
      }
    >
      {pageName && (
        <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-steel dark:text-white/40">
          <Link2 size={11} className="shrink-0" />
          <span>Şunu düzenliyorsunuz:</span>
          <span className="font-medium text-near-black dark:text-white/70">{pageName}</span>
          {pagePath && <span className="font-mono text-[11px] text-steel/70 dark:text-white/30">({pagePath})</span>}
          <span aria-hidden>→</span>
          <span className="font-medium text-near-black dark:text-white/70">{draft.name}</span>
          <span aria-hidden>→</span>
          <span className="font-medium text-red dark:text-red-eyebrow">
            {activeTab === 'icerik' ? 'İçerik' : activeTab === 'medya' ? 'Medya & Görünüm' : activeTab === 'yayin' ? 'Yayın & Sürüm' : activeTab === 'saglik' ? 'Sağlık & Skor' : 'Gelişmiş'}
          </span>
        </p>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-steel dark:text-white/40">
        <span className="flex items-center gap-1"><UserCircle2 size={12} /> Son düzenleyen: <span className="font-medium text-near-black dark:text-white/70">{draft.modifiedBy}</span></span>
        <span className="flex items-center gap-1"><History size={12} /> Son düzenleme: <span className="font-medium text-near-black dark:text-white/70">{draft.lastEdited}</span></span>
        <span className="flex items-center gap-1"><CalendarCheck2 size={12} /> Son yayın: <span className="font-medium text-near-black dark:text-white/70">{draft.lastPublishedAt ?? 'Hiç yayınlanmadı'}</span></span>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-border pb-3 dark:border-white/10">
        {siteUrl && (
          <button
            type="button"
            onClick={() => window.open(siteUrl, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 rounded-soft border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-near-black transition-colors hover:bg-mist dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
          >
            <ExternalLink size={12} /> Sitede Görüntüle
          </button>
        )}
        {onToggleVisible && (
          <button
            type="button"
            onClick={() => onToggleVisible(draft.id)}
            className="flex items-center gap-1.5 rounded-soft border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-near-black transition-colors hover:bg-mist dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
          >
            {draft.visible ? <EyeOff size={12} /> : <Eye size={12} />} {draft.visible ? 'Gizle' : 'Göster'}
          </button>
        )}
        {onDuplicate && (
          <button
            type="button"
            onClick={() => onDuplicate(draft.id)}
            className="flex items-center gap-1.5 rounded-soft border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-near-black transition-colors hover:bg-mist dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
          >
            <Copy size={12} /> Çoğalt
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(draft)}
            className="flex items-center gap-1.5 rounded-soft border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-danger transition-colors hover:bg-danger/10 dark:border-white/10"
          >
            <Trash2 size={12} /> Sil
          </button>
        )}
      </div>
      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as DrawerTab)}
        items={[
          { value: 'icerik', label: 'İçerik' },
          { value: 'medya', label: 'Medya & Görünüm' },
          { value: 'yayin', label: 'Yayın & Sürüm' },
          { value: 'saglik', label: 'Sağlık & Skor' },
          { value: 'gelismis', label: 'Gelişmiş' },
        ]}
      >
        {(tab) => (
          <>
            {tab === 'icerik' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 rounded-soft border border-border p-1 dark:border-white/10">
                  {SUPPORTED_LANGUAGES.map((code) => {
                    const lang = draft.languages.find((l) => l.code === code);
                    const complete = code === 'TR' ? true : Boolean(lang && completeLanguage(lang));
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setActiveLanguage(code)}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-1 rounded-sharp px-2 py-1.5 text-[12.5px] font-medium transition-colors',
                          activeLanguage === code ? 'bg-red text-white' : 'text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5'
                        )}
                      >
                        {code}
                        {!complete && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-label="eksik" />}
                      </button>
                    );
                  })}
                </div>
                {activeLanguage !== 'TR' && (
                  <p className="text-[11.5px] text-steel dark:text-white/40">
                    {SUPPORTED_LANGUAGES.find((c) => c === activeLanguage)} çevirisini düzenliyorsunuz — boş bırakılan alanlar TR içeriğinin çevrilmediği anlamına gelir.
                  </p>
                )}

                <Field label="Üst Etiket (Eyebrow)">
                  <Input value={getText('eyebrow')} onChange={(e) => setText('eyebrow', e.target.value)} onBlur={() => commitText()} placeholder="ör. SINCE 1964" />
                </Field>
                <Field label="Başlık" error={activeLanguage === 'TR' ? titleError : undefined}>
                  <Input value={getText('title')} onChange={(e) => setText('title', e.target.value)} onBlur={() => commitText()} />
                </Field>
                <Field label="Alt Başlık">
                  <Input value={getText('subtitle')} onChange={(e) => setText('subtitle', e.target.value)} onBlur={() => commitText()} />
                </Field>
                <Field label="Açıklama">
                  <Textarea rows={3} value={getText('description')} onChange={(e) => setText('description', e.target.value)} onBlur={() => commitText()} />
                </Field>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-body-sm font-medium text-near-black dark:text-white/85">Butonlar</span>
                    <button type="button" onClick={addButton} className="flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
                      <Plus size={11} /> Buton Ekle
                    </button>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {draft.buttons.length === 0 && <p className="text-[12px] text-steel dark:text-white/40">Bu bölümde buton yok.</p>}
                    {draft.buttons.map((btn, i) => {
                      const hrefInvalid = btn.href && !isValidButtonHref(btn.href);
                      return (
                        <div key={i} className="rounded-soft border border-border p-3 dark:border-white/[.06]">
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={btn.label} onChange={(e) => updateButton(i, { label: e.target.value })} onBlur={() => commitHistory()} placeholder="Buton metni" />
                            <Input value={btn.href} onChange={(e) => updateButton(i, { href: e.target.value })} onBlur={() => commitHistory()} placeholder="/bağlantı" />
                          </div>
                          {hrefInvalid && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-danger"><AlertCircle size={10} /> Bağlantı &quot;/&quot;, &quot;http&quot;, &quot;#&quot;, &quot;tel:&quot; veya &quot;mailto:&quot; ile başlamalı.</p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <Select value={btn.style} onChange={(e) => updateButton(i, { style: e.target.value as SectionButton['style'] })} className="w-32">
                              <option value="birincil">Birincil</option>
                              <option value="ikincil">İkincil</option>
                              <option value="metin">Metin</option>
                            </Select>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => moveButton(i, -1)} disabled={i === 0} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Yukarı taşı">
                                <ChevronUp size={13} />
                              </button>
                              <button type="button" onClick={() => moveButton(i, 1)} disabled={i === draft.buttons.length - 1} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Aşağı taşı">
                                <ChevronDown size={13} />
                              </button>
                              <button type="button" onClick={() => updateButton(i, { newTab: !btn.newTab })} className={cn('flex items-center gap-1 text-[11px]', btn.newTab ? 'text-red dark:text-red-eyebrow' : 'text-steel dark:text-white/40')} aria-pressed={btn.newTab} title="Yeni sekmede aç">
                                <ExternalLink size={12} /> Yeni sekme
                              </button>
                              <Switch checked={btn.visible !== false} onChange={() => updateButton(i, { visible: btn.visible === false })} label="Buton görünür" />
                              <button type="button" onClick={() => removeButton(i)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Butonu sil">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {draft.cards && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-body-sm font-medium text-near-black dark:text-white/85">Kartlar ({draft.cards.length})</span>
                      <button type="button" onClick={addCard} className="flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
                        <Plus size={11} /> Kart Ekle
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {draft.cards.length === 0 && <p className="text-[12px] text-steel dark:text-white/40">Bu bölümde kart yok.</p>}
                      {draft.cards.map((card, ci) => (
                        <div key={card.id} className="rounded-soft border border-border p-3 dark:border-white/[.06]">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-mono text-[10.5px] text-steel dark:text-white/40">#{ci + 1}</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => moveCard(ci, -1)} disabled={ci === 0} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Yukarı taşı">
                                <ChevronUp size={13} />
                              </button>
                              <button type="button" onClick={() => moveCard(ci, 1)} disabled={ci === draft.cards!.length - 1} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Aşağı taşı">
                                <ChevronDown size={13} />
                              </button>
                              <button type="button" onClick={() => removeCard(ci)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Kartı sil">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Input value={card.eyebrow ?? ''} onChange={(e) => updateCard(ci, { eyebrow: e.target.value })} onBlur={() => commitHistory()} placeholder="Üst etiket (ör. FORGE · 01)" />
                            <Input value={card.title} onChange={(e) => updateCard(ci, { title: e.target.value })} onBlur={() => commitHistory()} placeholder="Kart başlığı" />
                            <Textarea rows={2} value={card.description} onChange={(e) => updateCard(ci, { description: e.target.value })} onBlur={() => commitHistory()} placeholder="Kart açıklaması" />
                            <div>
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Teknik Değerler</span>
                                <button type="button" onClick={() => addCardSpec(ci)} className="flex items-center gap-1 text-[11px] font-medium text-red dark:text-red-eyebrow">
                                  <Plus size={10} /> Ekle
                                </button>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                {(card.specs ?? []).map((spec, si) => (
                                  <div key={si} className="flex items-center gap-1.5">
                                    <Input value={spec.label} onChange={(e) => updateCardSpec(ci, si, { label: e.target.value })} onBlur={() => commitHistory()} placeholder="ETİKET" className="flex-1" />
                                    <Input value={spec.value} onChange={(e) => updateCardSpec(ci, si, { value: e.target.value })} onBlur={() => commitHistory()} placeholder="DEĞER" className="flex-1" />
                                    <button type="button" onClick={() => removeCardSpec(ci, si)} className="shrink-0 text-steel hover:text-danger dark:text-white/40" aria-label="Değeri sil">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {draft.stats && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-body-sm font-medium text-near-black dark:text-white/85">İstatistikler ({draft.stats.length})</span>
                      <button type="button" onClick={addStat} className="flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
                        <Plus size={11} /> İstatistik Ekle
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {draft.stats.length === 0 && <p className="text-[12px] text-steel dark:text-white/40">Bu bölümde istatistik yok.</p>}
                      {draft.stats.map((stat, si) => (
                        <div key={si} className="flex items-center gap-1.5 rounded-soft border border-border p-2.5 dark:border-white/[.06]">
                          <Input value={stat.value} onChange={(e) => updateStat(si, { value: e.target.value })} onBlur={() => commitHistory()} placeholder="1964" className="w-24" />
                          <Input value={stat.label} onChange={(e) => updateStat(si, { label: e.target.value })} onBlur={() => commitHistory()} placeholder="Etiket" className="flex-1" />
                          <button type="button" onClick={() => moveStat(si, -1)} disabled={si === 0} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Yukarı taşı">
                            <ChevronUp size={13} />
                          </button>
                          <button type="button" onClick={() => moveStat(si, 1)} disabled={si === draft.stats!.length - 1} className="text-steel hover:text-near-black disabled:opacity-30 dark:text-white/40 dark:hover:text-white" aria-label="Aşağı taşı">
                            <ChevronDown size={13} />
                          </button>
                          <button type="button" onClick={() => removeStat(si)} className="shrink-0 text-steel hover:text-danger dark:text-white/40" aria-label="İstatistiği sil">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'medya' && (
              <div className="flex flex-col gap-4">
                <Field label="Medya Türü">
                  <Select value={draft.mediaType} onChange={(e) => updateAndCommit({ mediaType: e.target.value as HomepageSection['mediaType'], mediaName: '' })}>
                    <option value="yok">Yok</option>
                    <option value="gorsel">Görsel</option>
                    <option value="video">Video</option>
                    <option value="belge">Belge (PDF/Doküman)</option>
                  </Select>
                </Field>

                {draft.mediaType !== 'yok' && draft.mediaType !== 'belge' && (
                  <div className="flex items-center gap-3 rounded-soft border border-border p-3 dark:border-white/[.06]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.06] dark:text-white/40">
                      {draft.mediaType === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{draft.mediaName || 'Seçilmedi'}</p>
                      <p className="text-[11px] text-steel dark:text-white/40">Medya Kütüphanesi&apos;nden seçildi</p>
                    </div>
                    <Popover
                      align="end"
                      width={280}
                      trigger={({ toggle }) => <Button variant="secondary" size="sm" onClick={toggle}>Değiştir</Button>}
                    >
                      <div className="max-h-72 overflow-y-auto p-1">
                        {mediaLibraryOptions.length === 0 ? (
                          <p className="px-3 py-4 text-center text-[12px] text-steel dark:text-white/40">Bu türde medya bulunamadı.</p>
                        ) : (
                          mediaLibraryOptions.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => selectMedia(m.name)}
                              className="flex w-full items-center gap-2 rounded-soft px-2.5 py-2 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/80 dark:hover:bg-white/5"
                            >
                              {m.type === 'video' ? <Video size={13} className="shrink-0 text-steel dark:text-white/40" /> : <ImageIcon size={13} className="shrink-0 text-steel dark:text-white/40" />}
                              <span className="truncate">{m.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </Popover>
                    <button type="button" onClick={removeMedia} className="text-steel hover:text-danger dark:text-white/40" aria-label="Medyayı kaldır">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {draft.mediaType === 'belge' && (
                  <div className="flex items-center gap-3 rounded-soft border border-border p-3 dark:border-white/[.06]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.06] dark:text-white/40">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{draft.mediaName || 'Seçilmedi'}</p>
                      <p className="text-[11px] text-steel dark:text-white/40">
                        {matchedFile ? `Dosya Merkezi'nden seçildi — ${matchedFile.format} · ${matchedFile.size}` : "Dosya Merkezi'nden seçildi"}
                      </p>
                    </div>
                    <Popover
                      align="end"
                      width={280}
                      trigger={({ toggle }) => <Button variant="secondary" size="sm" onClick={toggle}>Değiştir</Button>}
                    >
                      <div className="max-h-72 overflow-y-auto p-1">
                        {fileDocs.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => selectMedia(f.name)}
                            className="flex w-full items-center gap-2 rounded-soft px-2.5 py-2 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/80 dark:hover:bg-white/5"
                          >
                            <FileText size={13} className="shrink-0 text-steel dark:text-white/40" />
                            <span className="truncate">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </Popover>
                    <button type="button" onClick={removeMedia} className="text-steel hover:text-danger dark:text-white/40" aria-label="Belgeyi kaldır">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {draft.mediaType !== 'yok' && draft.mediaType !== 'belge' && (
                  <>
                    <Field label="Alt Metin (Erişilebilirlik)">
                      <Input
                        value={draft.mediaAlt ?? matchedMedia?.altText ?? ''}
                        onChange={(e) => updateField({ mediaAlt: e.target.value })}
                        onBlur={() => commitHistory()}
                        placeholder="Bu görseli tanımlayan kısa metin"
                      />
                    </Field>
                    <Field label="Alt Yazı (Caption)">
                      <Input
                        value={draft.mediaCaption ?? matchedMedia?.caption ?? ''}
                        onChange={(e) => updateField({ mediaCaption: e.target.value })}
                        onBlur={() => commitHistory()}
                        placeholder="Görselin altında görünen açıklama"
                      />
                    </Field>
                    <Field label="Odak Noktası">
                      <Select value={draft.mediaFocalPoint ?? 'orta'} onChange={(e) => updateAndCommit({ mediaFocalPoint: e.target.value as HomepageSection['mediaFocalPoint'] })}>
                        <option value="ust">Üst</option>
                        <option value="orta">Orta</option>
                        <option value="alt">Alt</option>
                      </Select>
                    </Field>
                  </>
                )}

                {draft.mediaType !== 'yok' && draft.mediaType !== 'belge' && draft.mediaName && matchedMedia && (() => {
                  const otherPlacements = matchedMedia.usedIn.filter((place) => place !== draft.name);
                  const affectedPages = Array.from(new Set([
                    ...(pageName ? [pageName] : []),
                    ...otherPlacements.map(derivePageNameFromPlacement),
                  ]));
                  const chain = [matchedMedia.name, draft.name, ...otherPlacements.map(derivePageNameFromPlacement).filter((p) => p !== pageName)];
                  const uniqueChain = chain.filter((item, i) => chain.indexOf(item) === i);
                  return (
                    <>
                      <div className="rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                          <Link2 size={11} /> Bu medyanın kullanıldığı yer
                        </p>
                        <div className="flex flex-col items-start gap-1">
                          {uniqueChain.map((item, i) => (
                            <div key={item} className="flex flex-col items-start gap-1">
                              {i > 0 && <ArrowDown size={12} className="ml-1 text-steel/60 dark:text-white/25" />}
                              <span
                                className={cn(
                                  'rounded-soft border px-2.5 py-1 text-[12px]',
                                  i === 0
                                    ? 'border-border bg-mist font-mono text-steel dark:border-white/10 dark:bg-white/[.06] dark:text-white/60'
                                    : 'border-border bg-white font-medium text-near-black dark:border-white/10 dark:bg-white/[.03] dark:text-white/80'
                                )}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                          <Link2 size={11} /> Bu değişiklik etkiler
                        </p>
                        {affectedPages.length === 0 ? (
                          <p className="text-[12.5px] text-steel dark:text-white/50">Yalnızca bu bölümde kullanılıyor — başka yeri etkilemez.</p>
                        ) : (
                          <ul className="flex flex-col gap-1">
                            {affectedPages.map((p) => (
                              <li key={p} className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
                                <Check size={12} className="shrink-0 text-success" /> {p}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  );
                })()}

                {draft.mediaType === 'belge' && draft.mediaName && matchedFile?.linkedTo && (
                  <div className="rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                      <Link2 size={11} /> Dosya Merkezi bağlantısı
                    </p>
                    <p className="text-[12.5px] text-near-black dark:text-white/80">{matchedFile.linkedTo}</p>
                  </div>
                )}

                <Field label="Arka Plan Rengi">
                  <div className="flex items-center gap-2">
                    <span className="h-9 w-9 shrink-0 rounded-soft border border-border dark:border-white/10" style={{ backgroundColor: draft.backgroundColor }} />
                    <Input value={draft.backgroundColor} onChange={(e) => updateField({ backgroundColor: e.target.value })} onBlur={() => commitHistory()} />
                  </div>
                </Field>

                <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
                  <span className="text-body-sm text-near-black dark:text-white/85">Karartma Katmanı (Overlay)</span>
                  <Switch checked={draft.overlay} onChange={() => updateAndCommit({ overlay: !draft.overlay })} label="Overlay" />
                </div>
                {draft.overlay && (
                  <Field label={`Overlay Opaklığı — %${draft.overlayOpacity}`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={draft.overlayOpacity}
                      onChange={(e) => updateField({ overlayOpacity: Number(e.target.value) })}
                      onMouseUp={() => commitHistory()}
                      onTouchEnd={() => commitHistory()}
                      className="w-full accent-red"
                    />
                  </Field>
                )}

                <Field label="Giriş Animasyonu">
                  <Select value={draft.animation} onChange={(e) => updateAndCommit({ animation: e.target.value as HomepageSection['animation'] })}>
                    <option value="yok">Yok</option>
                    <option value="solma">Solma (Fade)</option>
                    <option value="kaydirma">Kaydırma (Slide)</option>
                    <option value="buyutme">Büyütme (Scale)</option>
                  </Select>
                </Field>

                <Field label="Metin Hizalaması">
                  <Select value={draft.alignment ?? 'orta'} onChange={(e) => updateAndCommit({ alignment: e.target.value as HomepageSection['alignment'] })}>
                    <option value="sol">Sol</option>
                    <option value="orta">Orta</option>
                    <option value="sag">Sağ</option>
                  </Select>
                </Field>

                <Field label="Dikey Boşluk (Spacing)">
                  <Select value={draft.spacing ?? 'normal'} onChange={(e) => updateAndCommit({ spacing: e.target.value as HomepageSection['spacing'] })}>
                    <option value="dar">Dar</option>
                    <option value="normal">Normal</option>
                    <option value="genis">Geniş</option>
                  </Select>
                </Field>
              </div>
            )}

            {tab === 'yayin' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
                  <span className="text-body-sm text-near-black dark:text-white/85">Yayın Durumu</span>
                  <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                    <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Son Yayınlanma</p>
                    <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{draft.lastPublishedAt ?? 'Hiç yayınlanmadı'}</p>
                  </div>
                  <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                    <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Son Değişiklik</p>
                    <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{draft.lastEdited}</p>
                  </div>
                </div>
                <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                  <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Değiştiren</p>
                  <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{draft.modifiedBy ?? 'Bilinmiyor'}</p>
                </div>

                {status === 'zamanlandi' && (
                  <div className="rounded-soft bg-info-soft px-3 py-2.5 text-[12.5px] text-info">
                    {draft.scheduledAt ?? 'tarih belirtilmedi'} tarihinde otomatik yayınlanacak.
                  </div>
                )}

                <Field label="Zamanlama Tarihi">
                  <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                </Field>

                <div className="flex flex-col gap-2">
                  {status !== 'yayinda' && (
                    <Button
                      icon={pendingAction === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                      disabled={pendingAction !== null || Boolean(titleError)}
                      onClick={() => { onUpdate?.(draft); runAction('publish', () => publishSection({ section: draft, actor: CURRENT_ACTOR })); }}
                    >
                      Yayınla
                    </Button>
                  )}
                  {status === 'yayinda' && (
                    <Button
                      variant="secondary"
                      icon={pendingAction === 'unpublish' ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
                      disabled={pendingAction !== null}
                      onClick={() => runAction('unpublish', () => unpublishSection({ section: draft, actor: CURRENT_ACTOR }))}
                    >
                      Yayından Kaldır
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    icon={pendingAction === 'schedule' ? <Loader2 size={14} className="animate-spin" /> : <CalendarClock size={14} />}
                    disabled={pendingAction !== null || !scheduleDate}
                    onClick={() => { onUpdate?.(draft); runAction('schedule', () => scheduleSection({ section: draft, actor: CURRENT_ACTOR, scheduledAt: scheduleDate })); }}
                  >
                    Zamanla
                  </Button>
                  {status !== 'arsivlendi' && (
                    <Button
                      variant="ghost"
                      icon={pendingAction === 'archive' ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                      disabled={pendingAction !== null}
                      onClick={() => runAction('archive', () => archiveSection({ section: draft, actor: CURRENT_ACTOR }))}
                    >
                      Arşivle
                    </Button>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                      <History size={13} /> Sürüm Geçmişi
                    </p>
                    {compareIds.length > 0 && (
                      <button type="button" onClick={() => setCompareIds([])} className="text-[11px] text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white">
                        Karşılaştırmayı Temizle
                      </button>
                    )}
                  </div>
                  <p className="mb-2 text-[11.5px] text-steel dark:text-white/40">Karşılaştırmak için iki sürüm seçin.</p>
                  <div className="flex flex-col gap-2">
                    {[...revisions].reverse().map((rev) => (
                      <div key={rev.id} className="flex items-center gap-2 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(rev.id)}
                          onChange={() => toggleCompare(rev.id)}
                          aria-label={`${rev.versionLabel} sürümünü karşılaştırmaya ekle`}
                          className="h-3.5 w-3.5 shrink-0 accent-red"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-near-black dark:text-white">{rev.versionLabel}</span>
                            <span className="truncate text-[12px] text-steel dark:text-white/50">{rev.changeSummary}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-steel dark:text-white/40">{rev.author} · {rev.date}</p>
                        </div>
                        <button
                          type="button"
                          disabled={pendingAction !== null}
                          onClick={() => runAction(`restore:${rev.id}`, () => restoreRevision({ section: draft, revisionId: rev.id, actor: CURRENT_ACTOR }))}
                          className="ml-2 flex shrink-0 items-center gap-1 rounded-soft px-2 py-1 text-[11.5px] font-medium text-steel hover:bg-mist disabled:opacity-40 dark:text-white/50 dark:hover:bg-white/5"
                        >
                          {pendingAction === `restore:${rev.id}` ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                          Bu Sürüme Dön
                        </button>
                      </div>
                    ))}
                  </div>

                  {revA && revB && (
                    <div className="mt-3 rounded-soft border border-border dark:border-white/[.06]">
                      <div className="grid grid-cols-2 border-b border-border text-[11px] font-medium text-steel dark:border-white/[.06] dark:text-white/40">
                        <span className="px-3 py-2 font-mono">{revA.versionLabel} · {revA.date}</span>
                        <span className="border-l border-border px-3 py-2 font-mono dark:border-white/[.06]">{revB.versionLabel} · {revB.date}</span>
                      </div>
                      {!revA.snapshot || !revB.snapshot ? (
                        <p className="px-3 py-4 text-center text-[12.5px] text-steel dark:text-white/40">Bu sürümlerden biri için içerik anlık görüntüsü kaydedilmemiş.</p>
                      ) : (
                        compareFields.map((f) => {
                          const valA = revA.snapshot![f.key];
                          const valB = revB.snapshot![f.key];
                          const changed = valA !== valB;
                          return (
                            <div key={f.key} className="grid grid-cols-2 border-b border-border last:border-b-0 text-[12px] dark:border-white/[.06]">
                              <div className="px-3 py-2">
                                <p className="mb-0.5 text-[10px] uppercase tracking-[0.05em] text-steel dark:text-white/40">{f.label}</p>
                                <p className={changed ? 'bg-danger-soft px-1 py-0.5 text-danger' : 'text-near-black dark:text-white/80'}>{valA || '—'}</p>
                              </div>
                              <div className="border-l border-border px-3 py-2 dark:border-white/[.06]">
                                <p className="mb-0.5 text-[10px] uppercase tracking-[0.05em] text-steel dark:text-white/40">{f.label}</p>
                                <p className={changed ? 'bg-success-soft px-1 py-0.5 text-success' : 'text-near-black dark:text-white/80'}>{valB || '—'}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'saglik' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                      <HeartPulse size={14} /> Genel Skor
                    </p>
                    <Badge tone={scoreTone(score.overall)}>%{score.overall}</Badge>
                  </div>
                  <ProgressBar value={score.overall} tone={scoreTone(score.overall)} />
                </div>

                <div className="flex flex-col gap-2.5">
                  {scoreDimensions.map((dim) => (
                    <div key={dim.key} className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                      <div className="mb-1.5 flex items-center justify-between text-[12px]">
                        <span className="text-near-black dark:text-white/80">{dim.label}</span>
                        <span className="font-mono text-steel dark:text-white/40">%{score[dim.key]}</span>
                      </div>
                      <ProgressBar value={score[dim.key]} tone={scoreTone(score[dim.key])} />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-body-sm font-medium text-near-black dark:text-white/85">Sağlık Bulguları</p>
                  {healthFlags.length === 0 ? (
                    <p className="text-[12.5px] text-steel dark:text-white/50">Bu bölümde herhangi bir sağlık uyarısı yok.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {healthFlags.map((flag) => (
                        <Badge key={flag.code} tone={flag.tone}>{flag.label}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'gelismis' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
                  <span className="text-body-sm text-near-black dark:text-white/85">Yayın Durumu</span>
                  <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                    <Globe2 size={14} /> Sayfa SEO {pageName && <span className="font-normal text-steel dark:text-white/40">— {pageName}</span>}
                  </p>
                  {!seoDraft ? (
                    <p className="rounded-soft border border-border px-3 py-2.5 text-[12.5px] text-steel dark:border-white/[.06] dark:text-white/50">
                      Bu sayfa için henüz bir SEO kaydı yok — SEO Yönetimi&apos;nden eklenmesi gerekir.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Field label="Meta Başlık">
                        <Input value={seoDraft.title} onChange={(e) => updateSeoField({ title: e.target.value })} />
                      </Field>
                      <Field label="Meta Açıklama">
                        <Textarea rows={2} value={seoDraft.metaDescription} onChange={(e) => updateSeoField({ metaDescription: e.target.value })} />
                      </Field>
                      <Field label="Canonical URL">
                        <Input value={seoDraft.canonicalUrl} onChange={(e) => updateSeoField({ canonicalUrl: e.target.value })} />
                      </Field>
                      <Field label="OpenGraph Görseli">
                        <div className="flex items-center gap-2">
                          <Popover
                            align="start"
                            width={280}
                            trigger={({ toggle }) => (
                              <Button variant="secondary" size="sm" onClick={toggle}>{seoDraft.ogImage || 'Görsel Seç'}</Button>
                            )}
                          >
                            <div className="max-h-72 overflow-y-auto p-1">
                              {mediaItems.filter((m) => m.type === 'image').map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => updateSeoField({ ogImage: m.name })}
                                  className="flex w-full items-center gap-2 rounded-soft px-2.5 py-2 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/80 dark:hover:bg-white/5"
                                >
                                  <ImageIcon size={13} className="shrink-0 text-steel dark:text-white/40" /> <span className="truncate">{m.title}</span>
                                </button>
                              ))}
                            </div>
                          </Popover>
                          {seoDraft.ogImage && (
                            <button type="button" onClick={() => updateSeoField({ ogImage: null })} className="text-steel hover:text-danger dark:text-white/40" aria-label="OG görselini kaldır">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </Field>
                      <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
                        <span className="text-body-sm text-near-black dark:text-white/85">Arama Motorlarınca İndexlensin (robots)</span>
                        <Switch checked={seoDraft.robotsIndex} onChange={() => updateSeoField({ robotsIndex: !seoDraft.robotsIndex })} label="robots index" />
                      </div>
                      <Button variant="secondary" size="sm" icon={<Save size={13} />} onClick={saveSeo} className="self-start">SEO&apos;yu Kaydet</Button>
                    </div>
                  )}
                </div>

                {draft.seoNote && (
                  <div className="rounded-soft bg-info-soft px-3 py-2.5 text-[12.5px] text-info">{draft.seoNote}</div>
                )}

                <div>
                  <p className="mb-2 text-body-sm font-medium text-near-black dark:text-white/85">Dil Durumu</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUPPORTED_LANGUAGES.map((code) => {
                      const lang = draft.languages.find((l) => l.code === code);
                      const complete = code === 'TR' ? true : Boolean(lang && completeLanguage(lang));
                      return (
                        <Badge key={code} tone={complete ? 'success' : 'warning'}>
                          {code} {complete ? '✓' : '— eksik'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-body-sm font-medium text-near-black dark:text-white/85">Duyarlı (Responsive) Görünürlük</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
                      <span className="text-[12.5px] text-near-black dark:text-white/80">Mobilde Gizle</span>
                      <Switch
                        checked={draft.responsiveHidden.includes('mobil')}
                        onChange={() => updateAndCommit({
                          responsiveHidden: draft.responsiveHidden.includes('mobil')
                            ? draft.responsiveHidden.filter((r) => r !== 'mobil')
                            : [...draft.responsiveHidden, 'mobil'],
                        })}
                        label="Mobilde gizle"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
                      <span className="text-[12.5px] text-near-black dark:text-white/80">Tablette Gizle</span>
                      <Switch
                        checked={draft.responsiveHidden.includes('tablet')}
                        onChange={() => updateAndCommit({
                          responsiveHidden: draft.responsiveHidden.includes('tablet')
                            ? draft.responsiveHidden.filter((r) => r !== 'tablet')
                            : [...draft.responsiveHidden, 'tablet'],
                        })}
                        label="Tablette gizle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Tabs>
    </Drawer>
  );
}
