'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Rocket, ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Info, Type, Sparkles, BarChart3, Filter, Search, Eye } from 'lucide-react';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { getCategoryWizard, saveCategoryWizard } from '@/lib/actions/category-wizard-actions';
import { getAdminCategories } from '@/lib/actions/category-actions';
import { CAT_WIZARD_LANGUAGES, type WizardCategory } from '@/lib/wizard/category-wizard-types';
import type { Category } from '@/lib/mock-data';

const STEPS = [
  { icon: Info, label: 'Genel & İlişki' }, { icon: Type, label: 'İçerik' }, { icon: Sparkles, label: 'Hero' },
  { icon: BarChart3, label: 'İstatistik' }, { icon: Filter, label: 'Filtreler' }, { icon: Search, label: 'SEO' }, { icon: Eye, label: 'Önizle & Yayınla' },
];
const LANG_LABELS: Record<string, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français', ru: 'Русский', az: 'Azərbaycan', ar: 'العربية' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-steel dark:text-white/55">{label}</span>{children}</label>;
}

function CategoryWizardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? 'new';
  const { push } = useToast();
  const [w, setW] = useState<WizardCategory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('tr');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const parentParam = params.get('parent');
  useEffect(() => {
    getCategoryWizard(id).then((c) => setW(id === 'new' && parentParam ? { ...c, parentId: parentParam } : c)).catch(() => push({ tone: 'danger', title: 'Kategori yüklenemedi' }));
    getAdminCategories().then(setCategories).catch(() => {});
  }, [id, parentParam, push]);

  const update = useCallback((patch: Partial<WizardCategory>) => { setW((p) => (p ? { ...p, ...patch } : p)); setDirty(true); }, []);
  const updateTr = useCallback((field: keyof WizardCategory['translations'][string], value: string) => {
    setW((p) => p ? { ...p, translations: { ...p.translations, [lang]: { ...p.translations[lang], [field]: value } } } : p);
    setDirty(true);
  }, [lang]);

  const doSave = useCallback(async (publishStatus?: WizardCategory['status']): Promise<boolean> => {
    if (!w) return false;
    const payload = publishStatus ? { ...w, status: publishStatus } : w;
    setSaving(true);
    const result = await saveCategoryWizard(payload);
    setSaving(false);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return false; }
    const savedId = (result.data as { id?: string })?.id;
    setW({ ...payload, id: savedId ?? payload.id }); setDirty(false);
    if (!w.id && savedId) router.replace(`/kategori-sihirbazi?id=${savedId}`);
    return true;
  }, [w, push, router]);

  useEffect(() => {
    if (!dirty || !w?.translations.tr.name) return;
    const t = setTimeout(() => { void doSave(); }, 12000);
    return () => clearTimeout(t);
  }, [dirty, w, doSave]);

  const families = useMemo(() => categories.filter((c) => !c.parentId && c.id !== w?.id), [categories, w]);

  if (!w) return <ContentContainer><div className="flex h-64 items-center justify-center text-steel dark:text-white/40"><Loader2 className="animate-spin" /></div></ContentContainer>;
  const t = w.translations[lang];
  const tr = w.translations.tr;

  return (
    <ContentContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/kategori-yonetimi')} className="flex h-9 w-9 items-center justify-center rounded-soft border border-border text-steel hover:text-near-black dark:border-white/10 dark:text-white/50" aria-label="Geri"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="font-display text-heading-md font-bold text-near-black dark:text-white">{w.id ? tr.name || 'Kategori Düzenle' : 'Yeni Kategori'}</h1>
            <p className="text-[12px] text-steel dark:text-white/40">{w.parentId ? 'Alt Kategori' : 'Ana Kategori / Aile'} · <Badge tone={w.status === 'yayinda' ? 'success' : 'neutral'}>{w.status}</Badge> {dirty && <span className="text-warning">· kaydedilmemiş</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} onClick={() => doSave()} disabled={saving}>Taslak Kaydet</Button>
          {w.status !== 'yayinda'
            ? <Button variant="success" icon={<Rocket size={14} />} onClick={async () => { if (await doSave('yayinda')) push({ tone: 'success', title: 'Kategori yayınlandı' }); }} disabled={saving}>Yayınla</Button>
            : <Button variant="secondary" onClick={async () => { if (await doSave('taslak')) push({ tone: 'info', title: 'Yayından kaldırıldı' }); }} disabled={saving}>Yayından Kaldır</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-[220px_1fr]">
        <nav className="flex gap-1.5 overflow-x-auto rounded-lg border border-border bg-white p-2 dark:border-white/[.06] dark:bg-surface-dark-raised laptop:flex-col" aria-label="Adımlar">
          {STEPS.map((s, i) => (
            <button key={i} type="button" onClick={() => setStep(i)} className={cn('flex shrink-0 items-center gap-2 rounded-soft px-3 py-2 text-left text-[12.5px] transition-colors', i === step ? 'bg-red/10 font-medium text-red dark:bg-red/15 dark:text-red-eyebrow' : 'text-steel hover:bg-mist dark:text-white/55 dark:hover:bg-white/5')}>
              <s.icon size={14} className="shrink-0" /> <span>{i + 1}. {s.label}</span>
            </button>
          ))}
        </nav>

        <div className="rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          {(step === 1 || step === 2 || step === 5) && (
            <div className="mb-4 flex flex-wrap gap-1">
              {CAT_WIZARD_LANGUAGES.map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded-soft px-2.5 py-1 text-[11.5px] font-mono uppercase transition-colors', l === lang ? 'bg-near-black text-white dark:bg-white dark:text-near-black' : 'text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5', w.translations[l]?.name.trim() && l !== 'tr' && 'ring-1 ring-success/40')}>{l}</button>
              ))}
              <span className="ml-2 self-center text-[11px] text-steel dark:text-white/35">{LANG_LABELS[lang]}</span>
            </div>
          )}

          {step === 0 && (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Field label="Kategori Adı (TR)"><Input value={tr.name} onChange={(e) => setW({ ...w, translations: { ...w.translations, tr: { ...tr, name: e.target.value } } })} /></Field>
              <Field label="Kategori Kodu"><Input value={w.code} onChange={(e) => update({ code: e.target.value })} className="font-mono" placeholder="FAM-01" /></Field>
              <Field label="Üst Kategori / Aile">
                <Select value={w.parentId ?? ''} onChange={(e) => update({ parentId: e.target.value || null })}>
                  <option value="">— Yok (Ana Kategori / Aile) —</option>
                  {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </Field>
              <Field label="İkon"><Input value={w.icon} onChange={(e) => update({ icon: e.target.value })} placeholder="ikon anahtarı" /></Field>
              <Field label="Durum"><Select value={w.status} onChange={(e) => update({ status: e.target.value as WizardCategory['status'] })}><option value="taslak">Taslak</option><option value="inceleme">İncelemede</option><option value="yayinda">Yayında</option><option value="arsiv">Arşiv</option></Select></Field>
              <Field label="Sıra"><Input type="number" value={w.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value) })} /></Field>
              <div className="tablet:col-span-2 flex flex-wrap gap-4 pt-1">
                <Switch checked={w.isVisible} onChange={(v) => update({ isVisible: v })} label="Görünür" />
                <Switch checked={w.showInNavigation} onChange={(v) => update({ showInNavigation: v })} label="Menüde göster" />
                <Switch checked={w.showOnHomepage} onChange={(v) => update({ showOnHomepage: v })} label="Ana sayfada göster" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <Field label="Ad"><Input value={t.name} onChange={(e) => updateTr('name', e.target.value)} /></Field>
              <Field label="Kısa Açıklama (kart)"><Textarea rows={2} value={t.shortDescription} onChange={(e) => updateTr('shortDescription', e.target.value)} /></Field>
              <Field label="Uzun Açıklama"><Textarea rows={5} value={t.longDescription} onChange={(e) => updateTr('longDescription', e.target.value)} /></Field>
              <Field label="Slug"><Input value={t.slug} onChange={(e) => updateTr('slug', e.target.value)} className="font-mono text-[12px]" /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <Field label="Hero Başlık"><Input value={t.heroTitle} onChange={(e) => updateTr('heroTitle', e.target.value)} /></Field>
              <Field label="Hero Açıklama"><Textarea rows={3} value={t.heroDescription} onChange={(e) => updateTr('heroDescription', e.target.value)} /></Field>
            </div>
          )}

          {step === 3 && (
            <Repeater title="İstatistikler" addLabel="İstatistik Ekle" items={w.stats}
              onAdd={() => update({ stats: [...w.stats, { value: '', label: '', sortOrder: w.stats.length }] })}
              onChange={(items) => update({ stats: items })}
              render={(s, i, set) => <div className="grid grid-cols-2 gap-2"><Input value={s.value} onChange={(e) => set({ ...s, value: e.target.value })} placeholder="Değer (96)" /><Input value={s.label} onChange={(e) => set({ ...s, label: e.target.value })} placeholder="Etiket (Ürün)" /></div>} />
          )}

          {step === 4 && (
            <Repeater title="Filtre Grupları" addLabel="Filtre Grubu Ekle" items={w.filters}
              onAdd={() => update({ filters: [...w.filters, { key: '', label: '', type: 'checkbox', active: true, sortOrder: w.filters.length, options: [] }] })}
              onChange={(items) => update({ filters: items })}
              render={(f, i, set) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
                    <Input value={f.label} onChange={(e) => set({ ...f, label: e.target.value })} placeholder="Grup adı (Malzeme)" />
                    <Select value={f.type} onChange={(e) => set({ ...f, type: e.target.value })}><option value="checkbox">Çoklu seçim</option><option value="radio">Tekli seçim</option><option value="range">Aralık</option></Select>
                    <label className="flex items-center gap-2 text-[12px] text-steel dark:text-white/50"><input type="checkbox" checked={f.active} onChange={(e) => set({ ...f, active: e.target.checked })} /> Aktif</label>
                  </div>
                  <div className="ml-2 space-y-1 border-l border-border pl-3 dark:border-white/[.06]">
                    {f.options.map((o, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Input value={o.label} onChange={(e) => set({ ...f, options: f.options.map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) })} placeholder="Seçenek" className="text-[12px]" />
                        <button type="button" onClick={() => set({ ...f, options: f.options.filter((_, k) => k !== j) })} className="text-steel hover:text-danger dark:text-white/40"><Trash2 size={13} /></button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" icon={<Plus size={12} />} onClick={() => set({ ...f, options: [...f.options, { value: '', label: '', sortOrder: f.options.length }] })}>Seçenek</Button>
                  </div>
                </div>
              )} />
          )}

          {step === 5 && (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Field label="Meta Başlık"><Input value={t.metaTitle} onChange={(e) => updateTr('metaTitle', e.target.value)} maxLength={60} /></Field>
              <Field label="Canonical / Slug"><Input value={t.slug} onChange={(e) => updateTr('slug', e.target.value)} className="font-mono text-[12px]" /></Field>
              <div className="tablet:col-span-2"><Field label="Meta Açıklama"><Textarea rows={2} value={t.metaDescription} onChange={(e) => updateTr('metaDescription', e.target.value)} maxLength={160} /></Field></div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-[13px] text-near-black dark:text-white/85">Kategori özeti — kaydet, taslak tut veya yayınla. Public site şu an değişmedi (dual-read Aşama 1).</p>
              <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
                <Summary label="Diller" value={`${CAT_WIZARD_LANGUAGES.filter((l) => w.translations[l].name.trim()).length}/7`} />
                <Summary label="İstatistik" value={String(w.stats.length)} />
                <Summary label="Filtre" value={String(w.filters.length)} />
                <Summary label="Tip" value={w.parentId ? 'Alt Kategori' : 'Aile'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" icon={<Save size={14} />} onClick={() => doSave()} disabled={saving}>Taslak Kaydet</Button>
                <Button variant="success" icon={<Rocket size={14} />} onClick={async () => { if (await doSave('yayinda')) push({ tone: 'success', title: 'Kategori yayınlandı' }); }} disabled={saving}>Yayınla</Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 dark:border-white/[.06]">
            <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Önceki</Button>
            <span className="text-[11.5px] text-steel dark:text-white/40">Adım {step + 1} / {STEPS.length}</span>
            <Button variant="ghost" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Sonraki <ArrowRight size={14} /></Button>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-soft border border-border p-3 dark:border-white/[.06]"><p className="text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40">{label}</p><p className="mt-1 font-display text-heading-sm font-bold text-near-black dark:text-white">{value}</p></div>;
}

function Repeater<T>({ title, addLabel, items, onAdd, onChange, render }: { title: string; addLabel: string; items: T[]; onAdd: () => void; onChange: (items: T[]) => void; render: (item: T, i: number, set: (v: T) => void) => React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-heading-sm font-bold text-near-black dark:text-white">{title}</p>
        <Button size="sm" icon={<Plus size={13} />} onClick={onAdd}>{addLabel}</Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-soft border border-dashed border-border py-8 text-center text-[12.5px] text-steel dark:border-white/10 dark:text-white/40">Henüz kayıt yok.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 rounded-soft border border-border p-2.5 dark:border-white/[.06]">
              <span className="mt-2 font-mono text-[11px] text-steel dark:text-white/30">{i + 1}</span>
              <div className="min-w-0 flex-1">{render(item, i, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}</div>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="mt-1.5 text-steel hover:text-danger dark:text-white/40" aria-label="Sil"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CategoryWizardPage() {
  return <Suspense fallback={<ContentContainer><div className="flex h-64 items-center justify-center text-steel"><Loader2 className="animate-spin" /></div></ContentContainer>}><CategoryWizardInner /></Suspense>;
}
