'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  Globe2,
  Weight,
  Link2,
  Images,
  Video,
  FileDown,
  Share2,
  ListChecks,
  Copy,
  ExternalLink,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  History as HistoryIcon,
  Rocket,
  Package,
  ImageOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { products, categories, mediaItems, fileDocs, activityFeed, type Product } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';
import { FilePickerModal } from '@/components/files/FilePickerModal';
import {
  getProductChecks,
  getWorkflowStage,
  getNextStep,
  workflowStageLabel,
  workflowStageOrder,
  workflowStageTone,
  getSeoTone,
} from '@/lib/product-health';
import { flattenAll } from '@/lib/category-health';

function slugify(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Merged from the previous 8-tab structure: Belgeler folded into Teknik (both
// low-frequency, reference-style content), Geçmiş folded into Yayınlama as a
// small inline section (it was almost always empty as its own tab, and its
// one useful fact — last updated — now lives in the header instead).
const tabItems = [
  { value: 'genel', label: 'Genel' },
  { value: 'medya', label: 'Medya' },
  { value: 'teknik', label: 'Teknik & Belgeler' },
  { value: 'seo', label: 'SEO' },
  { value: 'iliskiler', label: 'İlişkiler' },
  { value: 'yayinlama', label: 'Yayınlama' },
];

export type ProductDrawerTab = (typeof tabItems)[number]['value'];

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
  onUpdate?: (updated: Product) => void;
  onDuplicate?: (product: Product) => void;
  /** Lets row-level quick actions ("SEO'yu Aç", "Medya Ekle") jump straight to the relevant tab instead of always opening on Genel. */
  initialTab?: ProductDrawerTab;
}

/** Full product editor drawer, organized into tabs so the client always knows which part of the record they're looking at. */
export function ProductDrawer({ product, onClose, onUpdate, onDuplicate, initialTab }: ProductDrawerProps) {
  const { push } = useToast();
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductDrawerTab>(initialTab ?? 'genel');
  // Keep rendering the last-viewed product's content while the drawer
  // animates closed, instead of unmounting content abruptly mid-exit.
  const [displayProduct, setDisplayProduct] = useState(product);
  const [form, setForm] = useState(product);

  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
      setForm(product);
      setActiveTab(initialTab ?? 'genel');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!displayProduct || !form) return null;

  const checks = getProductChecks(form);
  const stage = getWorkflowStage(form, checks);
  const stageIndex = workflowStageOrder.indexOf(stage);
  const nextStep = getNextStep(form, checks, stage);
  const coverMedia = form.gallery.length > 0 ? mediaItems.find((m) => m.id === form.gallery[0]) : undefined;

  function field<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges(overrideStatus?: Product['status']) {
    if (!form) return;
    const updated: Product = { ...form, status: overrideStatus ?? form.status, updatedAt: new Date().toISOString().slice(0, 10) };
    onUpdate?.(updated);
    setDisplayProduct(updated);
    setForm(updated);
    push({
      tone: 'success',
      title: overrideStatus === 'yayinda' ? 'Ürün yayınlandı' : 'Ürün kaydedildi',
      description: `${updated.name} güncellendi.`,
    });
  }

  const relatedProducts = form.relatedProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  const productHistory = activityFeed.filter((a) => a.target.toLowerCase().includes(form.name.toLowerCase()));

  const checklist: { label: string; missing: boolean }[] = [
    { label: 'Ürün galerisi eksik', missing: checks.missingGallery },
    { label: 'PDF / teknik doküman eksik', missing: checks.missingDocument },
    { label: 'SEO başlığı eksik', missing: checks.missingSeoTitle },
    { label: 'Meta açıklama eksik', missing: checks.missingMetaDescription },
    { label: 'Kategori atanmamış', missing: checks.missingCategory },
    { label: 'İlişkili ürün eklenmemiş', missing: checks.missingRelated },
    { label: 'Galeri görsellerinde ALT metni eksik', missing: checks.missingAltText },
  ];

  return (
    <Drawer
      open={Boolean(product)}
      onClose={onClose}
      title={displayProduct.name}
      description={displayProduct.sku}
      size="wide"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" icon={<Copy size={14} />} onClick={() => onDuplicate?.(displayProduct)}>
            Çoğalt
          </Button>
          <div className="flex flex-1 items-center justify-end gap-2">
            {form.status !== 'yayinda' && (
              <Button variant="success" icon={<Rocket size={14} />} onClick={() => saveChanges('yayinda')}>
                Yayınla
              </Button>
            )}
            <Button icon={<Save size={14} />} onClick={() => saveChanges()}>
              Kaydet
            </Button>
          </div>
        </div>
      }
    >
      {/* Meaningful product header — image, name, SKU, category, status, SEO score, last updated. Replaces the old decorative color block. */}
      <div className="flex items-start gap-3">
        {coverMedia ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-soft text-white/80" style={{ backgroundColor: coverMedia.swatch }}>
            <Package size={22} strokeWidth={1.6} />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-soft border border-dashed border-border text-steel/50 dark:border-white/10 dark:text-white/25">
            <ImageOff size={20} strokeWidth={1.6} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-heading-sm text-near-black dark:text-white">{form.name}</p>
          <p className="font-mono text-[11.5px] text-steel dark:text-white/50">{form.sku}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{form.category || 'Kategorisiz'}</Badge>
            <Badge tone={workflowStageTone[stage]} dot>{workflowStageLabel[stage]}</Badge>
            <Badge tone={getSeoTone(form.seoScore)}>SEO {form.seoScore}</Badge>
          </div>
        </div>
      </div>
      <p className="mt-2.5 flex items-center gap-1 text-[11.5px] text-steel dark:text-white/40">
        <Clock size={11} /> Güncellendi: {displayProduct.updatedAt}
      </p>

      {/* Workflow progress — always visible regardless of active tab, so the client always knows where this product stands and what's left. */}
      <div className="mt-4 rounded-soft border border-border p-3 dark:border-white/[.06]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">İş Akışı Durumu</p>
          <span className="text-[12px] font-medium text-near-black dark:text-white">{workflowStageLabel[stage]}</span>
        </div>
        <div className="flex items-center gap-1">
          {workflowStageOrder.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? 'bg-success' : 'bg-mist dark:bg-white/10'}`}
              title={workflowStageLabel[s]}
            />
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-steel dark:text-white/50">
          <Sparkles size={11} className="shrink-0 text-ai" />
          {nextStep}
        </p>
      </div>

      <div className="mt-4">
        <Tabs items={tabItems} value={activeTab} onChange={(v) => setActiveTab(v as ProductDrawerTab)}>
          {(active) => (
            <>
              {active === 'genel' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ürün Adı</p>
                    <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">SKU</p>
                    <Input value={form.sku} onChange={(e) => field('sku', e.target.value)} className="font-mono text-[13px]" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Kısa Açıklama</p>
                    <Textarea rows={3} value={form.description} onChange={(e) => field('description', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
                    <div className="tablet:col-span-2">
                      <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ürün Ailesi</p>
                      <Select
                        value={form.categoryId ?? ''}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value);
                          setForm((prev) => (prev ? { ...prev, categoryId: cat?.id, category: cat?.name ?? prev.category } : prev));
                        }}
                      >
                        {flattenAll(categories).map(({ category: c, depth }) => (
                          <option key={c.id} value={c.id}>{'—'.repeat(depth)} {c.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Fiyat</p>
                      <Input value={form.price} onChange={(e) => field('price', e.target.value)} />
                    </div>
                    <div>
                      <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
                        <Weight size={11} /> Ağırlık (kg)
                      </p>
                      <Input type="number" value={form.weightKg} onChange={(e) => field('weightKg', Number(e.target.value))} />
                    </div>
                    <div className="tablet:col-span-4">
                      <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
                        <Globe2 size={11} /> İhracat Kapsamı (ülke)
                      </p>
                      <Input type="number" value={form.countries} onChange={(e) => field('countries', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              )}

              {active === 'medya' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
                        <Images size={11} /> Ürün Galerisi ({form.gallery.length})
                      </p>
                      <button type="button" onClick={() => setGalleryPickerOpen(true)} className="text-[11.5px] font-medium text-red dark:text-red-eyebrow">
                        Galeriye Ekle
                      </button>
                    </div>
                    {form.gallery.length === 0 ? (
                      <p className="rounded-soft border border-dashed border-border px-3 py-3 text-center text-[12px] text-steel dark:border-white/10 dark:text-white/40">
                        Henüz galeri görseli eklenmedi.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 tablet:grid-cols-4">
                        {form.gallery.map((mediaId, i) => {
                          const media = mediaItems.find((m) => m.id === mediaId);
                          return (
                            <div key={mediaId} className="group relative aspect-square overflow-hidden rounded-soft" style={{ backgroundColor: media?.swatch ?? '#8A9097' }}>
                              {i === 0 && (
                                <span className="absolute left-1 top-1 rounded-full bg-near-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">Kapak</span>
                              )}
                              {!media?.altText && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-white" title="ALT metni eksik">
                                  <AlertTriangle size={10} />
                                </span>
                              )}
                              <span className="absolute inset-x-0 bottom-0 truncate bg-near-black/60 px-1.5 py-1 text-[9.5px] text-white">{media?.title ?? mediaId}</span>
                              <button
                                type="button"
                                onClick={() => field('gallery', form.gallery.filter((id) => id !== mediaId))}
                                aria-label="Galeriden kaldır"
                                className="absolute right-1 bottom-6 flex h-5 w-5 items-center justify-center rounded-full bg-near-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setVideoPickerOpen(true)}
                    className="flex items-center gap-2 rounded-soft border border-border px-3 py-2 text-left transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30"
                  >
                    <Video size={13} className={form.video ? 'text-success' : 'text-steel dark:text-white/25'} />
                    <span className="truncate text-[12px] text-near-black dark:text-white/85">
                      {form.video ? mediaItems.find((m) => m.id === form.video)?.title ?? form.video : 'Video seçilmedi — seçmek için tıklayın'}
                    </span>
                  </button>
                </div>
              )}

              {active === 'teknik' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
                      <FileDown size={11} /> Teknik Doküman / PDF
                    </p>
                    <button
                      type="button"
                      onClick={() => setDocumentPickerOpen(true)}
                      className="flex w-full items-center gap-2 rounded-soft border border-border px-3 py-3 text-left transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30"
                    >
                      <FileDown size={15} className={form.document ? 'text-success' : 'text-steel dark:text-white/25'} />
                      <span className="truncate text-[12.5px] text-near-black dark:text-white/85">
                        {form.document ? fileDocs.find((f) => f.id === form.document)?.name ?? form.document : 'Teknik doküman / PDF seçilmedi'}
                      </span>
                    </button>
                    <p className="mt-1.5 text-[11.5px] text-steel dark:text-white/40">
                      Teknik çizim ve indirilebilir ürün PDF'i aynı belge alanını kullanır — Dosya Merkezi'nden seçin.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
                      <ListChecks size={11} /> Teknik Özellikler
                    </p>
                    {form.specifications.length === 0 ? (
                      <p className="rounded-soft border border-dashed border-border px-3 py-3 text-center text-[12px] text-steel dark:border-white/10 dark:text-white/40">
                        Henüz teknik özellik eklenmedi.
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-soft border border-border dark:border-white/[.06]">
                        {form.specifications.map((spec, i) => (
                          <div
                            key={spec.label}
                            className={`flex items-center justify-between px-3 py-2 text-[12px] ${i > 0 ? 'border-t border-border dark:border-white/[.06]' : ''}`}
                          >
                            <span className="text-steel dark:text-white/50">{spec.label}</span>
                            <span className="font-medium text-near-black dark:text-white/85">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {active === 'seo' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-soft border border-border p-3.5 dark:border-white/[.06]">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                      <Search size={11} /> Sayfa SEO
                    </p>
                    <div>
                      <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Başlık</p>
                      <Input value={form.metaTitle ?? ''} placeholder={`${form.name} | Dekor Tools`} onChange={(e) => field('metaTitle', e.target.value)} maxLength={60} />
                    </div>
                    <div className="mt-2.5">
                      <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Açıklama</p>
                      <Textarea rows={2} value={form.metaDescription ?? ''} placeholder={form.description} onChange={(e) => field('metaDescription', e.target.value)} maxLength={160} />
                    </div>
                    <div className="mt-2.5">
                      <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">URL</p>
                      <Input value={form.slug ?? slugify(form.name)} onChange={(e) => field('slug', e.target.value)} className="font-mono text-[12px]" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOgPickerOpen(true)}
                    className="flex items-center gap-2 rounded-soft border border-border px-3 py-2 text-left transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30"
                  >
                    <Share2 size={13} className={form.ogImage ? 'text-success' : 'text-steel dark:text-white/25'} />
                    <span className="truncate text-[12px] text-near-black dark:text-white/85">
                      {form.ogImage ? `OG görseli: ${mediaItems.find((m) => m.id === form.ogImage)?.title ?? form.ogImage}` : 'Open Graph görseli seçilmedi'}
                    </span>
                  </button>
                </div>
              )}

              {active === 'iliskiler' && (
                <div>
                  {relatedProducts.length === 0 ? (
                    <p className="rounded-soft border border-dashed border-border px-3 py-3 text-center text-[12px] text-steel dark:border-white/10 dark:text-white/40">
                      Henüz ilişkili ürün eklenmedi.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {relatedProducts.map((related) => (
                        <li key={related.id} className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
                          <span className="flex items-center gap-1.5 truncate text-[12.5px] text-near-black dark:text-white/85">
                            <Link2 size={11} className="shrink-0 text-steel dark:text-white/30" />
                            {related.name}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-steel dark:text-white/40">{related.sku}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {active === 'yayinlama' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Durum</p>
                      <Select value={form.status} onChange={(e) => field('status', e.target.value as Product['status'])}>
                        <option value="yayinda">Yayında</option>
                        <option value="taslak">Taslak</option>
                        <option value="arsiv">Arşiv</option>
                      </Select>
                    </div>
                    <div>
                      <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Stok Durumu</p>
                      <Select value={form.stock} onChange={(e) => field('stock', e.target.value as Product['stock'])}>
                        <option value="stokta">Stokta</option>
                        <option value="az-stok">Az Stok</option>
                        <option value="tukendi">Tükendi</option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                    <span className="text-[12.5px] text-near-black dark:text-white/80">Ana Sayfada Öne Çıkar</span>
                    <Switch checked={form.featured} onChange={(v) => field('featured', v)} label="Öne çıkan ürün" />
                  </div>

                  <Button
                    variant="secondary"
                    icon={<ExternalLink size={14} />}
                    onClick={() => window.open(`https://dekortools.com/urunler/${form.slug ?? slugify(form.name)}`, '_blank', 'noopener,noreferrer')}
                  >
                    Sitede Önizle
                  </Button>

                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Yayın Hazırlık Kontrol Listesi</p>
                    <ul className="flex flex-col gap-1.5">
                      {checklist.map((item) => (
                        <li key={item.label} className="flex items-center gap-2 text-[12.5px]">
                          {item.missing ? (
                            <AlertTriangle size={13} className="shrink-0 text-warning" />
                          ) : (
                            <CheckCircle2 size={13} className="shrink-0 text-success" />
                          )}
                          <span className={item.missing ? 'text-near-black dark:text-white/85' : 'text-steel dark:text-white/50'}>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Folded in from the old standalone "Geçmiş" tab — the one fact it always had (last updated) now lives in the header, so this only shows real per-product activity when it exists. */}
                  <div className="border-t border-border pt-3 dark:border-white/[.06]">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                      <HistoryIcon size={11} /> Geçmiş
                    </p>
                    {productHistory.length === 0 ? (
                      <p className="text-[12px] text-steel dark:text-white/40">
                        Bu ürüne özel değişiklik geçmişi gerçek veri bağlandığında burada görünecek.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {productHistory.map((item) => (
                          <li key={item.id} className="rounded-soft border border-border px-3 py-2 text-[12.5px] dark:border-white/[.06]">
                            <span className="font-medium text-near-black dark:text-white">{item.actor}</span>{' '}
                            <span className="text-steel dark:text-white/50">{item.action}</span>{' '}
                            {item.target}
                            <span className="ml-2 text-[11px] text-steel dark:text-white/40">{item.time}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>

      <MediaPickerModal
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        filterType="image"
        onSelect={(item) => {
          if (!form.gallery.includes(item.id)) field('gallery', [...form.gallery, item.id]);
          push({ tone: 'success', title: 'Galeriye eklendi', description: item.title });
        }}
      />
      <MediaPickerModal
        open={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        filterType="image"
        onSelect={(item) => {
          field('ogImage', item.id);
          push({ tone: 'success', title: 'Open Graph görseli ayarlandı', description: item.title });
        }}
      />
      <MediaPickerModal
        open={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        filterType="video"
        onSelect={(item) => {
          field('video', item.id);
          push({ tone: 'success', title: 'Video eklendi', description: item.title });
        }}
      />
      <FilePickerModal
        open={documentPickerOpen}
        onClose={() => setDocumentPickerOpen(false)}
        onSelect={(file) => {
          field('document', file.id);
          push({ tone: 'success', title: 'Doküman eklendi', description: file.name });
        }}
      />
    </Drawer>
  );
}
