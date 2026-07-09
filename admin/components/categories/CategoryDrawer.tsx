'use client';

import { useEffect, useState } from 'react';
import { Save, Copy, Eye, EyeOff, Home, Navigation as NavigationIcon, Search, ExternalLink, AlertTriangle, Package, FolderTree, Clock, Tag } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import type { Category, Product } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import {
  familyIconMap,
  flattenAll,
  getCategoryProductStats,
  getDescendantIds,
  getFamilyIcon,
  getFullNamePath,
  getFullSlugPath,
  validateCategory,
} from '@/lib/category-health';

function seoTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

interface CategoryDrawerProps {
  category: Category | null;
  categories: Category[];
  products: Product[];
  onClose: () => void;
  onUpdate?: (updated: Category) => void;
  onDuplicate?: (category: Category) => void;
}

/** Full category editor drawer — name/slug/description/parent/visibility/SEO, plus a read-only product-relationship panel. */
export function CategoryDrawer({ category, categories, products, onClose, onUpdate, onDuplicate }: CategoryDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(category);
  const [form, setForm] = useState(category);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      setDisplay(category);
      setForm(category);
      setErrors([]);
    }
  }, [category]);

  if (!display || !form) return null;

  function field<K extends keyof Category>(key: K, value: Category[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors([]);
  }

  function saveChanges() {
    if (!form) return;
    const validationErrors = validateCategory(form, categories);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    const updated: Category = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
    onUpdate?.(updated);
    setDisplay(updated);
    push({ tone: 'success', title: 'Kategori kaydedildi', description: `${updated.name} güncellendi.` });
  }

  // A category can't become its own parent, and can't be moved under any of its own descendants (circular guard).
  const forbiddenParentIds = new Set([display.id, ...getDescendantIds(categories, display.id)]);
  const parentOptions = flattenAll(categories).filter((row) => !forbiddenParentIds.has(row.category.id));
  const hierarchyPath = getFullNamePath(categories, display.id);
  const fullSlugPath = getFullSlugPath(categories, display.id);
  const stats = getCategoryProductStats(display, categories, products);

  return (
    <Drawer
      open={Boolean(category)}
      onClose={onClose}
      title={display.name}
      description={`/${fullSlugPath}`}
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Copy size={14} />} onClick={() => onDuplicate?.(display)}>
            Çoğalt
          </Button>
          <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
        </div>
      }
    >
      {hierarchyPath.includes(' / ') && (
        <p className="mb-4 flex items-center gap-1.5 text-[12px] text-steel dark:text-white/40">
          <FolderTree size={12} className="shrink-0" />
          {hierarchyPath}
        </p>
      )}

      {errors.length > 0 && (
        <div className="mb-4 rounded-soft border border-danger-border bg-danger-soft px-3 py-2.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-danger">
            <AlertTriangle size={11} /> Kaydetmeden önce düzeltin
          </p>
          <ul className="flex flex-col gap-1">
            {errors.map((err) => (
              <li key={err} className="text-[12.5px] text-danger">• {err}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Genel</p>
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Kategori Adı</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Slug</p>
          <Input value={form.slug} onChange={(e) => field('slug', e.target.value)} className="font-mono text-[13px]" />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-body-sm font-medium text-near-black dark:text-white/85">
            <Tag size={11} /> Aile Kodu
          </p>
          <Input value={form.code ?? ''} onChange={(e) => field('code', e.target.value)} placeholder="FAM-01" className="font-mono text-[13px]" />
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">İkon</p>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft border border-border text-steel dark:border-white/[.06] dark:text-white/60">
            {(() => { const Icon = getFamilyIcon(form.icon); return <Icon size={16} />; })()}
          </div>
          <Select value={form.icon ?? ''} onChange={(e) => field('icon', e.target.value || undefined)} className="flex-1">
            <option value="">Varsayılan (klasör)</option>
            {Object.keys(familyIconMap).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Üst Kategori</p>
        <Select
          value={form.parentId ?? ''}
          onChange={(e) => field('parentId', e.target.value === '' ? null : e.target.value)}
        >
          <option value="">— Üst kategori yok (ana kategori) —</option>
          {parentOptions.map(({ category: c, depth }) => (
            <option key={c.id} value={c.id}>{'—'.repeat(depth)} {c.name}</option>
          ))}
        </Select>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Açıklama</p>
        <Textarea rows={3} value={form.description} onChange={(e) => field('description', e.target.value)} />
      </div>

      <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Hero &amp; Kart İçeriği</p>
      <div className="rounded-soft border border-border p-3.5 dark:border-white/[.06]">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-steel/70 dark:text-white/30">/urunler sayfasındaki kart</p>
        <div>
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Kart Başlığı</p>
          <Input value={form.cardTitle ?? ''} placeholder={form.name} onChange={(e) => field('cardTitle', e.target.value)} />
        </div>
        <div className="mt-2.5">
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Kart Açıklaması</p>
          <Textarea rows={2} value={form.cardDescription ?? ''} placeholder={form.description} onChange={(e) => field('cardDescription', e.target.value)} />
        </div>
        <p className="mb-2 mt-3.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel/70 dark:text-white/30">/urunler/{form.slug} sayfasındaki hero</p>
        <div>
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Hero Başlığı</p>
          <Input value={form.heroTitle ?? ''} placeholder={form.name} onChange={(e) => field('heroTitle', e.target.value)} />
        </div>
        <div className="mt-2.5">
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Hero Açıklaması</p>
          <Textarea rows={2} value={form.heroDescription ?? ''} placeholder={form.description} onChange={(e) => field('heroDescription', e.target.value)} />
        </div>
      </div>

      <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Görünürlük</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Görünür</span>
          <Switch checked={form.visible} onChange={(v) => field('visible', v)} label="Görünür" />
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
            <Home size={12} /> Ana Sayfada Göster
          </span>
          <Switch checked={form.showOnHomepage} onChange={(v) => field('showOnHomepage', v)} label="Ana sayfada göster" />
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
            <NavigationIcon size={12} /> Menüde Göster
          </span>
          <Switch checked={form.showInNavigation} onChange={(v) => field('showInNavigation', v)} label="Menüde göster" />
        </div>
      </div>

      <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">SEO</p>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="font-medium text-near-black dark:text-white/85">SEO Skoru</span>
          <span className="tabular-nums text-steel dark:text-white/40">{display.seoScore}</span>
        </div>
        <ProgressBar value={display.seoScore} tone={seoTone(display.seoScore)} />
      </div>
      <div className="rounded-soft border border-border p-3.5 dark:border-white/[.06]">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <Search size={11} /> Sayfa SEO
        </p>
        <div>
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Başlık</p>
          <Input value={form.metaTitle ?? `${form.name} | Dekor Tools`} onChange={(e) => field('metaTitle', e.target.value)} maxLength={60} />
        </div>
        <div className="mt-2.5">
          <p className="mb-1 text-[12px] font-medium text-near-black dark:text-white/85">Meta Açıklama</p>
          <Textarea rows={2} value={form.metaDescription ?? form.description} onChange={(e) => field('metaDescription', e.target.value)} maxLength={160} />
        </div>
      </div>

      <Button
        variant="secondary"
        className="mt-3 w-full"
        icon={<ExternalLink size={14} />}
        onClick={() => window.open(`https://dekortools.com/${fullSlugPath}`, '_blank', 'noopener,noreferrer')}
      >
        Sitede Önizle
      </Button>

      {/* Read-only — reflects the real products array, never edited from here. */}
      <p className="mb-2 mt-5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
        <Package size={11} /> Ürün İlişkisi
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Bu Kategoriyi Kullanan</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-near-black dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Yayındaki Ürünler</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-success">{stats.published}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Taslak Ürünler</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-near-black dark:text-white">{stats.draft}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Arşivdeki Ürünler</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-steel dark:text-white/50">{stats.hidden}</p>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] text-steel dark:text-white/40">
        İlgili sayfa bulunamadı — sayfa ↔ kategori ilişkisi henüz veri modelinde tanımlı değil.
      </p>

      <div className="mt-5">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Dil Durumu</p>
        <div className="flex flex-col gap-2">
          {display.languageStatus.map((lang) => (
            <div key={lang.code} className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
              <span className="font-mono text-[12px] font-medium text-near-black dark:text-white">{lang.code}</span>
              {lang.complete ? (
                <Badge tone="success" dot>
                  <Eye size={10} className="mr-1 inline" />
                  Tamamlandı
                </Badge>
              ) : (
                <Badge tone="warning">
                  <EyeOff size={10} className="mr-1 inline" />
                  Eksik
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1 text-[11.5px] text-steel dark:text-white/40">
        <Clock size={11} /> Son güncelleme: {display.updatedAt}
      </p>
    </Drawer>
  );
}
