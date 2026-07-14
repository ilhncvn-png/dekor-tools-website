'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save, Rocket, ArrowLeft, ArrowRight, Plus, Trash2, Copy, Check, Loader2, Image as ImageIcon,
  Info, Type, Images, Layers, Wrench, Table2, PencilRuler, FileText, Video, Link2, Search, Eye,
} from 'lucide-react';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';
import { cn } from '@/lib/utils';
import {
  getProductWizard, saveProductWizard, WIZARD_LANGUAGES,
  type WizardProduct, type WizardVariant,
} from '@/lib/actions/product-wizard-actions';
import { getAdminCategories } from '@/lib/actions/category-actions';
import { getAdminProducts } from '@/lib/actions/product-actions';
import type { Category, Product } from '@/lib/mock-data';

const STEPS = [
  { icon: Info, label: 'Genel' }, { icon: Type, label: 'İçerik' }, { icon: Images, label: 'Galeri' },
  { icon: Layers, label: 'Uygulama' }, { icon: Wrench, label: 'Özellikler' }, { icon: Table2, label: 'Varyantlar' },
  { icon: PencilRuler, label: 'Teknik Çizim' }, { icon: FileText, label: 'Dokümanlar' }, { icon: Video, label: 'Video' },
  { icon: Link2, label: 'İlgili' }, { icon: Search, label: 'SEO' }, { icon: Eye, label: 'Önizle & Yayınla' },
];
const LANG_LABELS: Record<string, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français', ru: 'Русский', az: 'Azərbaycan', ar: 'العربية' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-steel dark:text-white/55">{label}</span>
      {children}
    </label>
  );
}

function ProductWizardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? 'new';
  const { push } = useToast();

  const [w, setW] = useState<WizardProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('tr');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [picker, setPicker] = useState<null | ((mediaId: string) => void)>(null);
  const savedRef = useRef<string>('');

  useEffect(() => {
    getProductWizard(id).then((p) => { setW(p); savedRef.current = JSON.stringify(p); }).catch(() => push({ tone: 'danger', title: 'Ürün yüklenemedi' }));
    getAdminCategories().then(setCategories).catch(() => {});
    getAdminProducts().then(setAllProducts).catch(() => {});
  }, [id, push]);

  const update = useCallback((patch: Partial<WizardProduct>) => { setW((prev) => (prev ? { ...prev, ...patch } : prev)); setDirty(true); }, []);
  const updateTr = useCallback((field: keyof WizardProduct['translations'][string], value: string) => {
    setW((prev) => prev ? { ...prev, translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [field]: value } } } : prev);
    setDirty(true);
  }, [lang]);

  const doSave = useCallback(async (publishStatus?: WizardProduct['status']): Promise<boolean> => {
    if (!w) return false;
    const payload = publishStatus ? { ...w, status: publishStatus } : w;
    setSaving(true);
    const result = await saveProductWizard(payload);
    setSaving(false);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return false; }
    const savedId = (result.data as { id?: string })?.id;
    const next = { ...payload, id: savedId ?? payload.id };
    setW(next); savedRef.current = JSON.stringify(next); setDirty(false);
    if (!w.id && savedId) router.replace(`/urun-sihirbazi?id=${savedId}`);
    return true;
  }, [w, push, router]);

  // Autosave draft every 12s when dirty and valid.
  useEffect(() => {
    if (!dirty || !w?.sku || !w.translations.tr.name) return;
    const t = setTimeout(() => { void doSave(); }, 12000);
    return () => clearTimeout(t);
  }, [dirty, w, doSave]);

  // Warn on unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const families = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const subcats = useMemo(() => categories.filter((c) => c.parentId), [categories]);

  if (!w) {
    return <ContentContainer><div className="flex h-64 items-center justify-center text-steel dark:text-white/40"><Loader2 className="animate-spin" /></div></ContentContainer>;
  }

  const t = w.translations[lang];
  const tr = w.translations.tr;

  return (
    <ContentContainer>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/urun-yonetimi')} className="flex h-9 w-9 items-center justify-center rounded-soft border border-border text-steel hover:text-near-black dark:border-white/10 dark:text-white/50 dark:hover:text-white" aria-label="Geri"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="font-display text-heading-md font-bold text-near-black dark:text-white">{w.id ? tr.name || 'Ürün Düzenle' : 'Yeni Ürün'}</h1>
            <p className="text-[12px] text-steel dark:text-white/40">{w.sku || 'SKU yok'} · <Badge tone={w.status === 'yayinda' ? 'success' : 'neutral'}>{w.status}</Badge> {dirty && <span className="text-warning">· kaydedilmemiş</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} onClick={() => doSave()} disabled={saving}>Taslak Kaydet</Button>
          {w.status !== 'yayinda' ? (
            <Button variant="success" icon={<Rocket size={14} />} onClick={async () => { if (await doSave('yayinda')) push({ tone: 'success', title: 'Ürün yayınlandı' }); }} disabled={saving}>Yayınla</Button>
          ) : (
            <Button variant="secondary" onClick={async () => { if (await doSave('taslak')) push({ tone: 'info', title: 'Yayından kaldırıldı' }); }} disabled={saving}>Yayından Kaldır</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-[220px_1fr]">
        {/* Stepper */}
        <nav className="flex gap-1.5 overflow-x-auto rounded-lg border border-border bg-white p-2 dark:border-white/[.06] dark:bg-surface-dark-raised laptop:flex-col laptop:overflow-visible" aria-label="Adımlar">
          {STEPS.map((s, i) => (
            <button key={i} type="button" onClick={() => setStep(i)} className={cn('flex shrink-0 items-center gap-2 rounded-soft px-3 py-2 text-left text-[12.5px] transition-colors', i === step ? 'bg-red/10 font-medium text-red dark:bg-red/15 dark:text-red-eyebrow' : 'text-steel hover:bg-mist dark:text-white/55 dark:hover:bg-white/5')}>
              <s.icon size={14} className="shrink-0" /> <span className="hidden laptop:inline">{i + 1}. {s.label}</span><span className="laptop:hidden">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Step body */}
        <div className="rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          {/* Language tabs for content/SEO steps */}
          {(step === 1 || step === 3 || step === 10) && (
            <div className="mb-4 flex flex-wrap gap-1">
              {WIZARD_LANGUAGES.map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded-soft px-2.5 py-1 text-[11.5px] font-mono uppercase transition-colors', l === lang ? 'bg-near-black text-white dark:bg-white dark:text-near-black' : 'text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5', w.translations[l]?.name.trim() && l !== 'tr' && 'ring-1 ring-success/40')}>
                  {l}{l === 'tr' ? '' : w.translations[l]?.name.trim() ? ' ✓' : ''}
                </button>
              ))}
              <span className="ml-2 self-center text-[11px] text-steel dark:text-white/35">{LANG_LABELS[lang]}</span>
            </div>
          )}

          {step === 0 && (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Field label="Ürün Adı (TR)"><Input value={tr.name} onChange={(e) => setW({ ...w, translations: { ...w.translations, tr: { ...tr, name: e.target.value } } })} /></Field>
              <Field label="Ürün Kodu / SKU"><Input value={w.sku} onChange={(e) => update({ sku: e.target.value })} className="font-mono" /></Field>
              <Field label="Ürün Ailesi / Kategori">
                <Select value={families.some((f) => f.id === w.categoryId) ? (w.categoryId ?? '') : (subcats.find((s) => s.id === w.categoryId)?.parentId ?? '')} onChange={(e) => update({ categoryId: e.target.value || null })}>
                  <option value="">— Seçin —</option>
                  {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </Field>
              <Field label="Alt Kategori">
                <Select value={subcats.some((s) => s.id === w.categoryId) ? (w.categoryId ?? '') : ''} onChange={(e) => update({ categoryId: e.target.value || w.categoryId })}>
                  <option value="">— Yok / doğrudan aile —</option>
                  {subcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
              <Field label="Durum"><Select value={w.status} onChange={(e) => update({ status: e.target.value as WizardProduct['status'] })}><option value="taslak">Taslak</option><option value="inceleme">İncelemede</option><option value="yayinda">Yayında</option><option value="arsiv">Arşiv</option></Select></Field>
              <Field label="Sıra"><Input type="number" value={w.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value) })} /></Field>
              <div className="tablet:col-span-2 flex flex-wrap gap-4 pt-1">
                <Switch checked={w.featured} onChange={(v) => update({ featured: v })} label="Öne çıkan" />
                {(['new', 'bestseller', 'professional'] as const).map((flag) => (
                  <Switch key={flag} checked={w.flags.includes(flag)} onChange={(v) => update({ flags: v ? [...w.flags, flag] : w.flags.filter((x) => x !== flag) })} label={flag === 'new' ? 'Yeni' : flag === 'bestseller' ? 'Çok satan' : 'Profesyonel'} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <Field label="Eyebrow"><Input value={t.eyebrow} onChange={(e) => updateTr('eyebrow', e.target.value)} /></Field>
                <Field label="Ürün Adı"><Input value={t.name} onChange={(e) => updateTr('name', e.target.value)} /></Field>
                <Field label="Hero Alt Başlık"><Input value={t.heroSubtitle} onChange={(e) => updateTr('heroSubtitle', e.target.value)} /></Field>
                <Field label="Malzeme Etiketi"><Input value={t.materialLabel} onChange={(e) => updateTr('materialLabel', e.target.value)} /></Field>
                <Field label="Rozet Metni"><Input value={t.badgeText} onChange={(e) => updateTr('badgeText', e.target.value)} /></Field>
                <Field label="Slug"><Input value={t.slug} onChange={(e) => updateTr('slug', e.target.value)} className="font-mono text-[12px]" /></Field>
              </div>
              <Field label="Kısa Açıklama"><Textarea rows={2} value={t.shortDescription} onChange={(e) => updateTr('shortDescription', e.target.value)} /></Field>
              <Field label="Uzun Açıklama"><Textarea rows={5} value={t.description} onChange={(e) => updateTr('description', e.target.value)} /></Field>
            </div>
          )}

          {step === 2 && (
            <Repeater
              title="Galeri Görselleri" addLabel="Görsel Ekle" items={w.gallery}
              onAdd={() => setPicker(() => (mediaId: string) => update({ gallery: [...w.gallery, { mediaId, itemType: w.gallery.length === 0 ? 'MAIN' : 'CUSTOM', altText: '', caption: '', sortOrder: w.gallery.length }] }))}
              onChange={(items) => update({ gallery: items })}
              render={(g, i, set) => (
                <div className="grid grid-cols-1 gap-2 tablet:grid-cols-4">
                  <Input value={g.mediaId} onChange={(e) => set({ ...g, mediaId: e.target.value })} placeholder="Medya ID" className="font-mono text-[11px]" />
                  <Select value={g.itemType} onChange={(e) => set({ ...g, itemType: e.target.value })}>{['MAIN', 'CLOSE_UP', 'HANDLE_DETAIL', 'APPLICATION', 'PACKAGING', 'TECHNICAL', 'CUSTOM'].map((x) => <option key={x} value={x}>{x}</option>)}</Select>
                  <Input value={g.altText} onChange={(e) => set({ ...g, altText: e.target.value })} placeholder="Alt metin" />
                  <Input value={g.caption} onChange={(e) => set({ ...g, caption: e.target.value })} placeholder="Açıklama" />
                </div>
              )}
            />
          )}

          {step === 3 && (
            <Repeater
              title="Uygulama Alanları" addLabel="Alan Ekle" items={w.applications}
              onAdd={() => update({ applications: [...w.applications, { title: '', description: '', eyebrow: '', iconMediaId: null, mediaId: null, sortOrder: w.applications.length }] })}
              onChange={(items) => update({ applications: items })}
              render={(a, i, set) => (
                <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
                  <Input value={a.eyebrow} onChange={(e) => set({ ...a, eyebrow: e.target.value })} placeholder="Eyebrow" />
                  <Input value={a.title} onChange={(e) => set({ ...a, title: e.target.value })} placeholder="Başlık" />
                  <Input value={a.description} onChange={(e) => set({ ...a, description: e.target.value })} placeholder="Açıklama" />
                </div>
              )}
            />
          )}

          {step === 4 && (
            <Repeater
              title="Mühendislik Notları / Özellikler" addLabel="Özellik Ekle" items={w.features}
              onAdd={() => update({ features: [...w.features, { label: '', sortOrder: w.features.length }] })}
              onChange={(items) => update({ features: items })}
              render={(f, i, set) => <Input value={f.label} onChange={(e) => set({ ...f, label: e.target.value })} placeholder={`${i + 1}. özellik — başlık ve açıklama`} />}
            />
          )}

          {step === 5 && <VariantsStep w={w} update={update} push={push} />}

          {step === 6 && (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Field label="Çizim Kodu"><Input value={w.drawing?.drawingCode ?? ''} onChange={(e) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), drawingCode: e.target.value } })} /></Field>
              <Field label="Revizyon"><Input value={w.drawing?.revisionCode ?? ''} onChange={(e) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), revisionCode: e.target.value } })} /></Field>
              <Field label="Genişlik Etiketi"><Input value={w.drawing?.widthLabel ?? ''} onChange={(e) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), widthLabel: e.target.value } })} /></Field>
              <Field label="Yükseklik Etiketi"><Input value={w.drawing?.heightLabel ?? ''} onChange={(e) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), heightLabel: e.target.value } })} /></Field>
              <div className="tablet:col-span-2"><Field label="Notlar"><Textarea rows={2} value={w.drawing?.notes ?? ''} onChange={(e) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), notes: e.target.value } })} /></Field></div>
              <div className="tablet:col-span-2 flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={<ImageIcon size={13} />} onClick={() => setPicker(() => (mediaId: string) => update({ drawing: { ...(w.drawing ?? emptyDrawing()), mediaId } }))}>Çizim Dosyası Seç</Button>
                <span className="font-mono text-[11px] text-steel dark:text-white/40">{w.drawing?.mediaId ?? 'seçilmedi'}</span>
              </div>
            </div>
          )}

          {step === 7 && (
            <Repeater
              title="Dokümanlar" addLabel="Doküman Ekle" items={w.documents}
              onAdd={() => update({ documents: [...w.documents, { mediaId: null, type: 'TECHNICAL_SHEET', title: '', fileSizeLabel: '', isActive: true, sortOrder: w.documents.length }] })}
              onChange={(items) => update({ documents: items })}
              render={(d, i, set) => (
                <div className="grid grid-cols-1 gap-2 tablet:grid-cols-4">
                  <Input value={d.title} onChange={(e) => set({ ...d, title: e.target.value })} placeholder="Başlık" />
                  <Select value={d.type} onChange={(e) => set({ ...d, type: e.target.value })}>{['TECHNICAL_SHEET', 'CATALOG', 'CERTIFICATE', 'PERFORMANCE_DECLARATION', 'USER_MANUAL', 'WARRANTY', 'OTHER'].map((x) => <option key={x} value={x}>{x}</option>)}</Select>
                  <Input value={d.fileSizeLabel} onChange={(e) => set({ ...d, fileSizeLabel: e.target.value })} placeholder="Boyut (2.4 MB)" />
                  <div className="flex items-center gap-2"><Button variant="secondary" size="sm" onClick={() => setPicker(() => (mediaId: string) => set({ ...d, mediaId }))}>Dosya</Button><span className="truncate font-mono text-[10px] text-steel dark:text-white/35">{d.mediaId ?? '—'}</span></div>
                </div>
              )}
            />
          )}

          {step === 8 && (
            <Repeater
              title="Videolar" addLabel="Video Ekle" items={w.videos}
              onAdd={() => update({ videos: [...w.videos, { provider: 'youtube', url: '', blobMediaId: null, posterMediaId: null, durationLabel: '', title: '', description: '', isPrimary: w.videos.length === 0, sortOrder: w.videos.length }] })}
              onChange={(items) => update({ videos: items })}
              render={(v, i, set) => (
                <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
                  <Select value={v.provider} onChange={(e) => set({ ...v, provider: e.target.value })}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="blob">Blob (MP4/WebM)</option></Select>
                  <Input value={v.url} onChange={(e) => set({ ...v, url: e.target.value })} placeholder="Video URL" className="tablet:col-span-2" />
                  <Input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} placeholder="Başlık" />
                  <Input value={v.durationLabel} onChange={(e) => set({ ...v, durationLabel: e.target.value })} placeholder="Süre (2:30)" />
                  <label className="flex items-center gap-2 text-[12px] text-steel dark:text-white/50"><input type="checkbox" checked={v.isPrimary} onChange={(e) => set({ ...v, isPrimary: e.target.checked })} /> Birincil</label>
                </div>
              )}
            />
          )}

          {step === 9 && (
            <div>
              <p className="mb-2 text-[12.5px] text-steel dark:text-white/50">İlgili ürünleri seçin (aynı aile, çok satan, benzer boyut vb.).</p>
              <div className="max-h-[420px] space-y-1 overflow-y-auto">
                {allProducts.filter((p) => p.id !== w.id).map((p) => {
                  const on = w.relatedProductIds.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => update({ relatedProductIds: on ? w.relatedProductIds.filter((x) => x !== p.id) : [...w.relatedProductIds, p.id] })} className={cn('flex w-full items-center justify-between gap-2 rounded-soft border px-3 py-2 text-left text-[12.5px] transition-colors', on ? 'border-red/40 bg-red/[.05]' : 'border-border hover:border-red/20 dark:border-white/[.06]')}>
                      <span className="text-near-black dark:text-white/85">{p.name} <span className="font-mono text-[11px] text-steel dark:text-white/40">{p.sku}</span></span>
                      {on && <Check size={14} className="text-red dark:text-red-eyebrow" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Field label="Meta Başlık"><Input value={t.metaTitle} onChange={(e) => updateTr('metaTitle', e.target.value)} maxLength={60} /></Field>
              <Field label="Canonical"><Input value={t.slug} onChange={(e) => updateTr('slug', e.target.value)} className="font-mono text-[12px]" /></Field>
              <div className="tablet:col-span-2"><Field label="Meta Açıklama"><Textarea rows={2} value={t.metaDescription} onChange={(e) => updateTr('metaDescription', e.target.value)} maxLength={160} /></Field></div>
              <Field label="OG Başlık"><Input value={t.ogTitle} onChange={(e) => updateTr('ogTitle', e.target.value)} /></Field>
              <Field label="OG Açıklama"><Input value={t.ogDescription} onChange={(e) => updateTr('ogDescription', e.target.value)} /></Field>
            </div>
          )}

          {step === 11 && (
            <div className="space-y-4">
              <p className="text-[13px] text-near-black dark:text-white/85">Ürün özeti — kaydet, taslak tut veya yayınla. Herkese açık önizleme, yayın parite doğrulaması sonrasında etkinleşecek (public site şu an değişmedi).</p>
              <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
                <Summary label="Diller" value={`${WIZARD_LANGUAGES.filter((l) => w.translations[l].name.trim()).length}/7`} />
                <Summary label="Varyant" value={String(w.variants.length)} />
                <Summary label="Özellik" value={String(w.features.length)} />
                <Summary label="Doküman" value={String(w.documents.length)} />
                <Summary label="Galeri" value={String(w.gallery.length)} />
                <Summary label="Uygulama" value={String(w.applications.length)} />
                <Summary label="Video" value={String(w.videos.length)} />
                <Summary label="İlgili" value={String(w.relatedProductIds.length)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" icon={<Save size={14} />} onClick={() => doSave()} disabled={saving}>Taslak Kaydet</Button>
                <Button variant="success" icon={<Rocket size={14} />} onClick={async () => { if (await doSave('yayinda')) push({ tone: 'success', title: 'Ürün yayınlandı' }); }} disabled={saving}>Yayınla</Button>
                <Button variant="secondary" onClick={async () => { if (await doSave('inceleme')) push({ tone: 'info', title: 'İncelemeye gönderildi' }); }} disabled={saving}>İncelemeye Gönder</Button>
              </div>
            </div>
          )}

          {/* Prev / Next */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 dark:border-white/[.06]">
            <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Önceki</Button>
            <span className="text-[11.5px] text-steel dark:text-white/40">Adım {step + 1} / {STEPS.length}</span>
            <Button variant="ghost" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Sonraki <ArrowRight size={14} /></Button>
          </div>
        </div>
      </div>

      <MediaPickerModal open={picker !== null} filterType="image" onClose={() => setPicker(null)} onSelect={(item) => { picker?.(item.id); setPicker(null); }} />
    </ContentContainer>
  );
}

function emptyDrawing() { return { mediaId: null, title: '', drawingCode: '', revisionCode: '', widthLabel: '', heightLabel: '', notes: '' }; }

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
        <p className="rounded-soft border border-dashed border-border py-8 text-center text-[12.5px] text-steel dark:border-white/10 dark:text-white/40">Henüz kayıt yok. Bu içerik public kaynakta yoksa boş bırakılabilir.</p>
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

function VariantsStep({ w, update, push }: { w: WizardProduct; update: (p: Partial<WizardProduct>) => void; push: ReturnType<typeof useToast>['push'] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cols: { key: keyof WizardVariant; label: string }[] = [
    { key: 'sku', label: 'Kod' }, { key: 'material', label: 'Malzeme' }, { key: 'width', label: 'Genişlik' },
    { key: 'length', label: 'Uzunluk' }, { key: 'thickness', label: 'Kalınlık' }, { key: 'pack', label: 'Paket' },
  ];
  const setRow = (i: number, v: WizardVariant) => update({ variants: w.variants.map((x, j) => (j === i ? v : x)) });
  const exportCsv = () => {
    const head = cols.map((c) => c.label).join(',');
    const rows = w.variants.map((v) => cols.map((c) => `"${String(v[c.key]).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[head, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${w.sku || 'varyantlar'}.csv`; a.click();
  };
  const importCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).filter(Boolean);
      const parsed: WizardVariant[] = lines.slice(1).map((line, i) => {
        const cells = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, k) => k % 2 === 0).map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
        return { sku: cells[0] ?? '', material: cells[1] ?? '', width: cells[2] ?? '', length: cells[3] ?? '', thickness: cells[4] ?? '', pack: cells[5] ?? '', isDefault: false, sortOrder: i };
      }).filter((v) => v.sku.trim());
      if (parsed.length) { update({ variants: parsed }); push({ tone: 'success', title: `${parsed.length} varyant içe aktarıldı` }); }
    };
    reader.readAsText(file);
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-heading-sm font-bold text-near-black dark:text-white">Varyantlar & Teknik Tablo</p>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>CSV İçe Aktar</Button>
          <Button size="sm" variant="secondary" onClick={exportCsv} disabled={!w.variants.length}>CSV Dışa Aktar</Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={() => update({ variants: [...w.variants, { sku: '', material: '', width: '', length: '', thickness: '', pack: '', isDefault: false, sortOrder: w.variants.length }] })}>Satır Ekle</Button>
        </div>
      </div>
      {w.variants.length === 0 ? (
        <p className="rounded-soft border border-dashed border-border py-8 text-center text-[12.5px] text-steel dark:border-white/10 dark:text-white/40">Varyant yok — satır ekleyin veya CSV içe aktarın.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="text-left text-steel dark:text-white/40">{cols.map((c) => <th key={c.key} className="px-1.5 py-1 font-medium">{c.label}</th>)}<th className="px-1.5 py-1"></th></tr></thead>
            <tbody>
              {w.variants.map((v, i) => (
                <tr key={i}>
                  {cols.map((c) => <td key={c.key} className="px-1 py-1"><Input value={String(v[c.key])} onChange={(e) => setRow(i, { ...v, [c.key]: e.target.value })} className={c.key === 'sku' ? 'font-mono text-[11px]' : 'text-[11px]'} /></td>)}
                  <td className="whitespace-nowrap px-1 py-1">
                    <button type="button" onClick={() => update({ variants: [...w.variants.slice(0, i + 1), { ...v, sku: v.sku + '-KOPYA' }, ...w.variants.slice(i + 1)] })} className="mr-1 text-steel hover:text-near-black dark:text-white/40" aria-label="Çoğalt"><Copy size={13} /></button>
                    <button type="button" onClick={() => update({ variants: w.variants.filter((_, j) => j !== i) })} className="text-steel hover:text-danger dark:text-white/40" aria-label="Sil"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProductWizardPage() {
  return <Suspense fallback={<ContentContainer><div className="flex h-64 items-center justify-center text-steel"><Loader2 className="animate-spin" /></div></ContentContainer>}><ProductWizardInner /></Suspense>;
}
