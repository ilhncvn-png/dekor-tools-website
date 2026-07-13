'use client';

import { useState } from 'react';
import {
  ChevronUp, ChevronDown, Pencil, Plus, Copy, Trash2, Monitor, Tablet, Smartphone,
  ExternalLink, History, Rocket, Loader2, Link2, Sparkles, BarChart3, LayoutGrid, Image as ImageIcon,
  FileText, Video, ArrowUpRight, Search, Eye, TreePine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';
import { SectionEditorDrawer } from '@/components/homepage/SectionEditorDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { seoRows, type HomepageSection, type RevisionEntry, type WebsitePage } from '@/lib/mock-data';
import { publishSection, resolvePublishStatus, resolveRevisions, publishStatusLabel, publishStatusTone } from '@/lib/publishing-api';
import { computeSectionHealthFlags, computeSectionScore, scoreTone } from '@/lib/section-quality';
import { cn } from '@/lib/utils';

const CURRENT_ACTOR = 'Selin Arslan';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const previewWidths: Record<PreviewMode, string> = { desktop: '100%', tablet: '460px', mobile: '280px' };

const iconBtnClass = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist hover:text-near-black disabled:opacity-30 disabled:hover:bg-transparent dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white';

/** The 8 section-map categories the client thinks in terms of — every real section `type` buckets into one of these. */
type SectionMapCategory = 'Hero' | 'İstatistik' | 'Kartlar' | 'Galeri' | 'Belgeler' | 'Videolar' | 'CTA' | 'SEO';

const sectionMapIcons: Record<SectionMapCategory, LucideIcon> = {
  Hero: Sparkles,
  İstatistik: BarChart3,
  Kartlar: LayoutGrid,
  Galeri: ImageIcon,
  Belgeler: FileText,
  Videolar: Video,
  CTA: ArrowUpRight,
  SEO: Search,
};

function categorizeSectionType(type: string): SectionMapCategory {
  const t = type.toLowerCase();
  if (t.includes('hero')) return 'Hero';
  if (t.includes('statistic') || t.includes('numbers')) return 'İstatistik';
  if (t.includes('gallery')) return 'Galeri';
  if (t.includes('download')) return 'Belgeler';
  if (t.includes('video')) return 'Videolar';
  if (t.includes('cta')) return 'CTA';
  return 'Kartlar';
}

const sectionMapOrder: SectionMapCategory[] = ['Hero', 'İstatistik', 'Kartlar', 'Galeri', 'Belgeler', 'Videolar', 'CTA', 'SEO'];

interface SectionListEditorProps {
  initialSections: HomepageSection[];
  addLabel?: string;
  /** Real live URL this page builder controls — powers the "Sitede Görüntüle" link so Publish always ends at the actual public page. */
  sitePath?: string;
  /**
   * The real websitePages registry entry for this exact builder. When
   * provided, renders the page-identity header (public page name, URL,
   * status, last updated) plus page-level "Sayfayı Yayınla" and
   * "Revizyonlar" actions — so every Website Control screen always answers
   * "which public page am I editing, and what's its real state" before the
   * client even opens a section.
   */
  page?: WebsitePage;
}

/**
 * Generates a layout-accurate thumbnail from the section's real fields
 * (eyebrow/title/subtitle bars, a button block, a media badge) instead of a
 * generic icon. There is no screenshot-rendering pipeline in this fixture
 * project, so a fabricated photo would be fake data — this is the honest
 * alternative: a structural preview built only from what the section
 * actually contains.
 */
function SectionThumbnail({ section }: { section: HomepageSection }) {
  const MediaIcon = section.mediaType === 'video' ? Video : section.mediaType === 'belge' ? FileText : ImageIcon;
  return (
    <div
      className="relative flex h-20 w-full shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-soft border border-border dark:border-white/10"
      style={{ backgroundColor: section.backgroundColor }}
    >
      {section.eyebrow && <span className="h-[3px] w-8 rounded-full bg-white/30" />}
      {section.title && <span className="h-[5px] w-16 rounded-full bg-white/70" />}
      {(section.subtitle || section.description) && <span className="h-[3px] w-12 rounded-full bg-white/40" />}
      {section.buttons.length > 0 && <span className="mt-1 h-3 w-9 rounded-sharp bg-red" />}
      {section.mediaType !== 'yok' && (
        <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-soft bg-black/35 text-white">
          <MediaIcon size={11} />
        </span>
      )}
      {!section.visible && (
        <span className="absolute left-1.5 top-1.5 rounded-soft bg-black/40 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.05em] text-white/80">
          Gizli
        </span>
      )}
    </div>
  );
}

/**
 * Reusable page-section editor — the visual operating-system view every
 * Website Control builder shares: page identity header, section-type map,
 * a collapsible structure tree, a mini map/preview that highlights the
 * open section, and a card grid (thumbnail + status + quick actions) in
 * place of an abstract record list. Only the section data differs between
 * Ana Sayfa Oluşturucu, Manufacturing, Export, Career, etc. — the
 * experience itself is never re-implemented per page.
 *
 * Reorder is exposed today via up/down controls bound to `section.order`.
 * That field is already the full ordering model a future drag-and-drop
 * library (e.g. dnd-kit) would need — no schema change required to add
 * real drag reordering later.
 */
export function SectionListEditor({ initialSections, addLabel = 'Bölüm Ekle', sitePath, page }: SectionListEditorProps) {
  const [sections, setSections] = useState<HomepageSection[]>([...initialSections].sort((a, b) => a.order - b.order));
  const [activeSection, setActiveSection] = useState<HomepageSection | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [structureOpen, setStructureOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HomepageSection | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());

  const resolvedSitePath = sitePath ?? page?.path;

  function move(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  function toggleVisible(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  function duplicate(id: string) {
    setSections((prev) => {
      const source = prev.find((s) => s.id === id);
      if (!source) return prev;
      const copy: HomepageSection = { ...source, id: `${source.id}-copy-${Date.now()}`, name: `${source.name} (Kopya)`, lastEdited: 'Şimdi' };
      const index = prev.findIndex((s) => s.id === id);
      const next = [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  function remove(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  }

  function addSection() {
    const newSection: HomepageSection = {
      id: `new-${Date.now()}`,
      name: 'Yeni Bölüm',
      type: 'Custom',
      order: sections.length + 1,
      visible: false,
      lastEdited: 'Şimdi',
      eyebrow: '',
      title: '',
      subtitle: '',
      description: '',
      buttons: [],
      mediaType: 'yok',
      mediaName: '',
      backgroundColor: '#0E0F11',
      overlay: false,
      overlayOpacity: 0,
      animation: 'solma',
      seoNote: '',
      languages: [{ code: 'TR', complete: false }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
      responsiveHidden: [],
      publicationStatus: 'taslak',
      publishStatus: 'taslak',
      scheduledAt: null,
      lastPublishedAt: null,
      modifiedBy: 'Selin Arslan',
      revisions: [{ id: `new-rev1-${Date.now()}`, versionLabel: 'v1', author: 'Selin Arslan', date: 'Şimdi', changeSummary: 'Bölüm oluşturuldu.' }],
    };
    setSections((prev) => [...prev, newSection]);
    setActiveSection(newSection);
  }

  function confirmRemove() {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  }

  function applyUpdate(updated: HomepageSection) {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setActiveSection(updated);
  }

  const draftCount = sections.filter((s) => resolvePublishStatus(s) !== 'yayinda').length;

  async function publishAll() {
    setPublishingAll(true);
    try {
      const updated = await Promise.all(
        sections.map(async (s) => {
          if (resolvePublishStatus(s) === 'yayinda') return s;
          const { section } = await publishSection({ section: s, actor: CURRENT_ACTOR, changeSummary: 'Sayfa genelinde toplu yayınlama.' });
          return section;
        })
      );
      setSections(updated);
    } finally {
      setPublishingAll(false);
    }
  }

  async function publishOne(section: HomepageSection) {
    setPublishingIds((prev) => new Set(prev).add(section.id));
    try {
      const { section: updated } = await publishSection({ section, actor: CURRENT_ACTOR });
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
  }

  const latestRevisions: { section: HomepageSection; latest: RevisionEntry }[] = sections
    .map((s) => ({ section: s, latest: resolveRevisions(s).slice(-1)[0] }))
    .filter((r): r is { section: HomepageSection; latest: RevisionEntry } => Boolean(r.latest))
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date));

  const pageSeoScore = page ? seoRows.find((r) => r.page === page.path)?.score : undefined;
  const hasSeoRow = pageSeoScore !== undefined;
  const sectionMapCounts = sections.reduce<Partial<Record<SectionMapCategory, number>>>((acc, s) => {
    const category = categorizeSectionType(s.type);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
  if (hasSeoRow) sectionMapCounts.SEO = 1;
  const presentSectionMapCategories = sectionMapOrder.filter((c) => (sectionMapCounts[c] ?? 0) > 0);
  const lastEditor = latestRevisions[0]?.latest.author;

  return (
    <>
      {page && (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-heading-sm text-near-black dark:text-white">{page.name}</p>
                <Badge tone={page.status === 'yayinda' ? 'success' : 'neutral'} dot>
                  {page.status === 'yayinda' ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>
              <p className="mt-0.5 font-mono text-[12px] text-steel dark:text-white/40">dekortools.com{page.path}</p>
              <p className="mt-0.5 text-[11.5px] text-steel dark:text-white/40">
                Son yayın: {page.lastPublished}
                {lastEditor && <> · Son düzenleyen: {lastEditor}</>}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink size={13} />}
                onClick={() => window.open(`https://dekortools.com${page.path}`, '_blank', 'noopener,noreferrer')}
              >
                Sitede Görüntüle
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPreviewOpen((v) => !v)}>
                {previewOpen ? 'Önizlemeyi Kapat' : 'Önizle'}
              </Button>
              <Popover
                align="end"
                width={320}
                trigger={({ toggle }) => (
                  <Button variant="ghost" size="sm" icon={<History size={13} />} onClick={toggle}>Revizyonlar</Button>
                )}
              >
                <div className="max-h-80 overflow-y-auto p-1">
                  {latestRevisions.length === 0 && (
                    <p className="px-3 py-4 text-center text-[12px] text-steel dark:text-white/40">Henüz revizyon yok.</p>
                  )}
                  {latestRevisions.map(({ section, latest }) => (
                    <div key={section.id} className="px-2.5 py-2 text-[12px]">
                      <p className="font-medium text-near-black dark:text-white/85">{section.name} <span className="font-mono text-[10.5px] text-steel dark:text-white/40">{latest.versionLabel}</span></p>
                      <p className="text-steel dark:text-white/40">{latest.author} · {latest.date}</p>
                      <p className="mt-0.5 text-steel dark:text-white/50">{latest.changeSummary}</p>
                    </div>
                  ))}
                </div>
              </Popover>
              {draftCount > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  icon={publishingAll ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
                  onClick={publishAll}
                  disabled={publishingAll}
                >
                  Sayfayı Yayınla ({draftCount})
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {page && presentSectionMapCategories.length > 0 && (
        <Card className="mb-4 p-3.5">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Bölüm Haritası</p>
          <div className="flex flex-wrap gap-2">
            {presentSectionMapCategories.map((category) => {
              const Icon = sectionMapIcons[category];
              const count = sectionMapCounts[category] ?? 0;
              return (
                <span
                  key={category}
                  className="flex items-center gap-1.5 rounded-soft border border-border bg-mist/60 px-2.5 py-1.5 text-[12px] font-medium text-near-black dark:border-white/[.08] dark:bg-white/[.03] dark:text-white/80"
                >
                  <Icon size={13} className="text-steel dark:text-white/50" />
                  {category}
                  {category !== 'SEO' && <span className="font-mono text-[10.5px] text-steel dark:text-white/40">×{count}</span>}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {page && (
        <Card className="mb-4 p-0">
          <button
            type="button"
            onClick={() => setStructureOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-body-sm font-medium text-near-black transition-colors hover:bg-mist/50 dark:text-white dark:hover:bg-white/[.03]"
          >
            <span className="flex items-center gap-2">
              <TreePine size={15} className="text-steel dark:text-white/50" /> Yapı Ağacı
            </span>
            <ChevronDown size={14} className={cn('text-steel transition-transform duration-fast dark:text-white/40', structureOpen && 'rotate-180')} />
          </button>
          {structureOpen && (
            <ul className="border-t border-border px-4 py-3 font-mono text-[12.5px] dark:border-white/[.06]">
              <li className="mb-1.5 font-semibold text-near-black dark:text-white">{page.name}</li>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(s)}
                    className="flex w-full items-center gap-1.5 rounded-soft px-1.5 py-1 text-left text-steel transition-colors hover:bg-mist hover:text-near-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <span className="shrink-0 text-steel/50 dark:text-white/25">{i === sections.length - 1 ? '└' : '├'}</span>
                    <span className="truncate">{s.name}</span>
                    {!s.visible && <Badge tone="neutral">Gizli</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="mb-4 flex justify-end gap-2">
        {!page && resolvedSitePath && (
          <Button
            variant="secondary"
            icon={<ExternalLink size={14} />}
            onClick={() => window.open(`https://dekortools.com${resolvedSitePath}`, '_blank', 'noopener,noreferrer')}
          >
            Sitede Görüntüle
          </Button>
        )}
        {!page && (
          <Button variant="secondary" onClick={() => setPreviewOpen((v) => !v)}>
            {previewOpen ? 'Önizlemeyi Kapat' : 'Önizle'}
          </Button>
        )}
        <Button icon={<Plus size={15} />} onClick={addSection}>{addLabel}</Button>
      </div>

      {previewOpen && (
        <Card className="mb-4 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-heading-md text-near-black dark:text-white">Sayfa Önizleme & Mini Harita</h2>
              {activeSection && (
                <p className="mt-0.5 text-[11.5px] text-steel dark:text-white/40">
                  Şu an düzenlenen bölüm vurgulanıyor: <span className="font-medium text-near-black dark:text-white/70">{activeSection.name}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-soft border border-border p-1 dark:border-white/10">
              {(
                [
                  { mode: 'desktop' as const, icon: Monitor },
                  { mode: 'tablet' as const, icon: Tablet },
                  { mode: 'mobile' as const, icon: Smartphone },
                ]
              ).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-sharp transition-colors',
                    previewMode === mode ? 'bg-red text-white' : 'text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5'
                  )}
                  aria-label={mode}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center overflow-x-auto rounded-soft bg-mist py-6 dark:bg-white/[.03]">
            <div
              className="flex flex-col gap-px overflow-hidden rounded-soft border border-border shadow-elevation-floating transition-all duration-slow ease-premium dark:border-white/10"
              style={{ width: previewWidths[previewMode] }}
            >
              {sections.filter((s) => s.visible).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-4 py-6 text-center transition-shadow',
                    activeSection?.id === s.id && 'ring-2 ring-inset ring-red'
                  )}
                  style={{ backgroundColor: s.backgroundColor }}
                >
                  {s.eyebrow && <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-white/50">{s.eyebrow}</span>}
                  <span className="text-[13px] font-semibold text-white">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-3.5 tablet:p-4">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {sections.map((section, index) => {
            const healthFlags = computeSectionHealthFlags(section, pageSeoScore);
            const score = computeSectionScore(section, pageSeoScore);
            const status = resolvePublishStatus(section);
            const revisions = resolveRevisions(section);
            const isPublishing = publishingIds.has(section.id);
            return (
              <div
                key={section.id}
                className={cn(
                  'flex flex-col gap-2.5 rounded-soft border border-border p-3 transition-colors dark:border-white/[.08]',
                  activeSection?.id === section.id && 'border-red/50 dark:border-red-eyebrow/50'
                )}
              >
                <SectionThumbnail section={section} />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-soft bg-mist font-mono text-[10.5px] font-semibold text-steel dark:bg-white/[.06] dark:text-white/60">
                      {section.order}
                    </span>
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{section.name}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <Badge tone="neutral">{section.type}</Badge>
                    <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                    <Badge tone={scoreTone(score.overall)}>%{score.overall}</Badge>
                  </div>
                  {healthFlags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {healthFlags.map((flag) => (
                        <Badge key={flag.code} tone={flag.tone}>{flag.label}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 border-t border-border pt-2 text-[11px] text-steel dark:border-white/[.06] dark:text-white/40">
                  <span className="flex items-center gap-1" title="Görsel"><ImageIcon size={11} /> {section.mediaType === 'gorsel' ? 1 : 0}</span>
                  <span className="flex items-center gap-1" title="Video"><Video size={11} /> {section.mediaType === 'video' ? 1 : 0}</span>
                  <span className="flex items-center gap-1" title="Belge"><FileText size={11} /> {section.mediaType === 'belge' ? 1 : 0}</span>
                  <span className="flex items-center gap-1" title="Buton"><Link2 size={11} /> {section.buttons.length}</span>
                  <span className="font-mono">%{score.overall}</span>
                </div>

                {page && (
                  <p className="flex items-center gap-1 text-[11px] text-steel dark:text-white/40">
                    <Link2 size={10} className="shrink-0" />
                    Bu bölüm etkiler: <span className="truncate font-medium text-near-black dark:text-white/60">{page.name} → {section.name}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-1 border-t border-border pt-2 dark:border-white/[.06]">
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={iconBtnClass} aria-label="Yukarı taşı" title="Sırayı yukarı taşı">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1} className={iconBtnClass} aria-label="Aşağı taşı" title="Sırayı aşağı taşı">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {resolvedSitePath && (
                      <button
                        type="button"
                        onClick={() => window.open(`https://dekortools.com${resolvedSitePath}`, '_blank', 'noopener,noreferrer')}
                        className={iconBtnClass}
                        aria-label="Sitede önizle"
                        title="Sitede Görüntüle"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button type="button" onClick={() => setActiveSection(section)} className={iconBtnClass} aria-label="Düzenle" title="Düzenle">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => duplicate(section.id)} className={iconBtnClass} aria-label="Çoğalt" title="Çoğalt">
                      <Copy size={14} />
                    </button>
                    <Switch checked={section.visible} onChange={() => toggleVisible(section.id)} label={`${section.name} görünür`} />
                    <Popover
                      align="end"
                      width={260}
                      trigger={({ toggle }) => (
                        <button type="button" onClick={toggle} className={iconBtnClass} aria-label="Revizyonlar" title="Revizyonlar">
                          <History size={14} />
                        </button>
                      )}
                    >
                      <div className="max-h-64 overflow-y-auto p-1">
                        {[...revisions].reverse().slice(0, 3).map((rev) => (
                          <div key={rev.id} className="px-2.5 py-2 text-[12px]">
                            <p className="font-medium text-near-black dark:text-white/85">
                              <span className="font-mono text-[10.5px] text-steel dark:text-white/40">{rev.versionLabel}</span> · {rev.author}
                            </p>
                            <p className="text-steel dark:text-white/40">{rev.date}</p>
                            <p className="mt-0.5 text-steel dark:text-white/50">{rev.changeSummary}</p>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setActiveSection(section)}
                          className="mt-1 w-full rounded-soft px-2.5 py-1.5 text-left text-[11.5px] font-medium text-red hover:bg-mist dark:text-red-eyebrow dark:hover:bg-white/5"
                        >
                          Tüm revizyonları gör →
                        </button>
                      </div>
                    </Popover>
                    {status !== 'yayinda' && (
                      <button
                        type="button"
                        onClick={() => publishOne(section)}
                        disabled={isPublishing}
                        className={iconBtnClass}
                        aria-label="Yayınla"
                        title="Yayınla"
                      >
                        {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                      </button>
                    )}
                    <button type="button" onClick={() => setPendingDelete(section)} className={cn(iconBtnClass, 'hover:text-danger')} aria-label="Sil" title="Sil">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionEditorDrawer
        section={activeSection}
        onClose={() => setActiveSection(null)}
        onUpdate={applyUpdate}
        pageName={page?.name}
        pagePath={page?.path}
        pageSeoScore={pageSeoScore}
        siteUrl={resolvedSitePath ? `https://dekortools.com${resolvedSitePath}` : undefined}
        onDuplicate={(id) => { duplicate(id); setActiveSection(null); }}
        onDelete={(sectionToDelete) => { setActiveSection(null); setPendingDelete(sectionToDelete); }}
        onToggleVisible={(id) => toggleVisible(id)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Bölümü sil"
        description={pendingDelete ? <>&quot;{pendingDelete.name}&quot; bölümünü kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</> : null}
        consequences={
          pendingDelete && resolvePublishStatus(pendingDelete) === 'yayinda'
            ? ['Bu bölüm şu anda canlı sitede yayında — silme işlemi yayından da kaldırır.']
            : undefined
        }
        confirmLabel="Bölümü Sil"
        onConfirm={confirmRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
