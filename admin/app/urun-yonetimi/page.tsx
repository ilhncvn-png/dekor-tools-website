'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  ArrowUpDown,
  CheckCircle2,
  Archive,
  Trash2,
  X,
  ImageOff,
  SearchX,
  PackageX,
  Clock,
  ClipboardCheck,
  Package,
  MoreVertical,
  Eye,
  ExternalLink,
  Images,
  FileDown,
  Search,
  Copy,
  AlertTriangle,
  FileWarning,
  FilterX,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';
import { Popover } from '@/components/ui/Popover';
import { ProductDrawer, type ProductDrawerTab } from '@/components/products/ProductDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { products as initialProducts, categories, mediaItems, type Product } from '@/lib/mock-data';
import { productStatusTone } from '@/lib/status-tones';
import { getProductChecks, getWorkflowStage, workflowStageLabel, workflowStageTone, getSeoTone, type WorkflowStage } from '@/lib/product-health';

const stockTone: Record<string, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  stokta: { tone: 'success', label: 'Stokta' },
  'az-stok': { tone: 'warning', label: 'Az Stok' },
  tukendi: { tone: 'danger', label: 'Tükendi' },
};

// Shorter than workflowStageLabel — the table column is narrow, the full label still shows in the drawer.
const stageShortLabel: Record<WorkflowStage, string> = {
  taslak: 'Taslak',
  'icerik-hazir': 'İçerik',
  'medya-hazir': 'Medya',
  'seo-hazir': 'SEO',
  inceleme: 'İnceleme',
  yayinda: 'Yayında',
  arsiv: 'Arşiv',
};

type QuickFilter = 'none' | 'missingImages' | 'missingSeo' | 'outOfStock';

const quickFilterLabel: Record<Exclude<QuickFilter, 'none'>, string> = {
  missingImages: 'Görsel Eksik',
  missingSeo: 'SEO Eksik',
  outOfStock: 'Stokta Yok',
};

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

type SortKey = 'name' | 'seoScore' | 'countries' | 'updatedAt';

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-near-black dark:hover:text-white">
      {label}
      <ArrowUpDown size={11} className={active ? 'text-red dark:text-red-eyebrow' : 'opacity-40'} />
    </button>
  );
}

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function UrunYonetimiPage() {
  const { push } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<ProductDrawerTab | undefined>(undefined);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<Product | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Every check/stage is derived from real fields (gallery, document, metaTitle...) — nothing here is a separate stored flag that can drift.
  // İş Akışı (workflow stage) is the single status vocabulary used across this screen — it already resolves to
  // "Yayında"/"Arşiv" at its terminal states, so there is no separate raw-status filter alongside it.
  const withHealth = useMemo(
    () => products.map((p) => {
      const checks = getProductChecks(p);
      return { product: p, checks, stage: getWorkflowStage(p, checks) };
    }),
    [products]
  );

  const overview = useMemo(() => {
    const published = withHealth.filter((h) => h.stage === 'yayinda').length;
    const drafts = withHealth.filter((h) => h.stage === 'taslak').length;
    const missingImages = withHealth.filter((h) => h.checks.missingGallery).length;
    const missingSeo = withHealth.filter((h) => h.checks.missingSeoTitle || h.checks.missingMetaDescription || h.product.seoScore < 50).length;
    const outOfStock = products.filter((p) => p.stock === 'tukendi').length;
    const recentlyUpdated = products.filter((p) => daysAgo(p.updatedAt) <= 7).length;
    const waitingForReview = withHealth.filter((h) => h.stage === 'inceleme').length;
    return { published, drafts, missingImages, missingSeo, outOfStock, recentlyUpdated, waitingForReview };
  }, [products, withHealth]);

  const filtered = useMemo(() => {
    const result = withHealth.filter(({ product: p, checks, stage }) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.sku.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (stageFilter !== 'all' && stage !== stageFilter) return false;
      if (quickFilter === 'missingImages' && !checks.missingGallery) return false;
      if (quickFilter === 'missingSeo' && !(checks.missingSeoTitle || checks.missingMetaDescription || p.seoScore < 50)) return false;
      if (quickFilter === 'outOfStock' && p.stock !== 'tukendi') return false;
      return true;
    });
    const sorted = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.product.name.localeCompare(b.product.name) * dir;
      if (sortKey === 'updatedAt') return a.product.updatedAt.localeCompare(b.product.updatedAt) * dir;
      return (a.product[sortKey] - b.product[sortKey]) * dir;
    });
    return sorted;
  }, [withHealth, query, category, stageFilter, quickFilter, sortKey, sortDir]);

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setStageFilter('all');
    setQuickFilter('none');
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((h) => h.product.id))));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkPublish() {
    setProducts((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, status: 'yayinda' } : p)));
    push({ tone: 'success', title: `${selected.size} ürün yayınlandı` });
    setSelected(new Set());
  }

  function bulkArchive() {
    setProducts((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, status: 'arsiv' } : p)));
    push({ tone: 'success', title: `${selected.size} ürün arşivlendi` });
    setSelected(new Set());
  }

  function updateProduct(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setActiveProduct(updated);
  }

  function duplicateProduct(source: Product) {
    const copy: Product = { ...source, id: `${source.id}-copy-${Date.now()}`, name: `${source.name} (Kopya)`, sku: `${source.sku}-COPY`, status: 'taslak', updatedAt: new Date().toISOString().slice(0, 10) };
    setProducts((prev) => [copy, ...prev]);
    setActiveProduct(copy);
    setActiveTab(undefined);
  }

  function confirmSingleDelete() {
    if (!singleDeleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== singleDeleteTarget.id));
    setSingleDeleteTarget(null);
  }

  function confirmBulkDelete() {
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    setBulkDeleteOpen(false);
  }

  // Products referencing a selected product in their relatedProductIds — the
  // dependency-map consequence surfaced before an actual delete happens.
  const affectedByBulkDelete = products.filter((p) => !selected.has(p.id) && p.relatedProductIds.some((id) => selected.has(id)));

  function openProduct(product: Product, tab?: ProductDrawerTab) {
    setActiveProduct(product);
    setActiveTab(tab);
  }

  function addProduct() {
    const newProduct: Product = {
      id: `new-${Date.now()}`,
      name: 'Yeni Ürün',
      sku: 'DKR-YENI',
      category: categories[0]?.name ?? '',
      categoryId: categories[0]?.id,
      status: 'taslak',
      countries: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      seoScore: 0,
      stock: 'stokta',
      price: '',
      description: '',
      weightKg: 0,
      swatch: '#8A9097',
      featured: false,
      relatedProductIds: [],
      gallery: [],
      video: null,
      document: null,
      ogImage: null,
      specifications: [],
    };
    setProducts((prev) => [newProduct, ...prev]);
    openProduct(newProduct, 'genel');
  }

  function exportList() {
    const header = ['Ürün Adı', 'SKU', 'Kategori', 'Durum', 'Stok', 'SEO Skoru', 'Güncellendi'];
    const rows = filtered.map(({ product: p }) => [p.name, p.sku, p.category, productStatusTone[p.status].label, stockTone[p.stock].label, p.seoScore, p.updatedAt]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urun-listesi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push({ tone: 'success', title: 'Liste dışa aktarıldı', description: `${filtered.length} ürün CSV olarak indirildi.` });
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const dataLines = lines[0]?.toLowerCase().includes('sku') ? lines.slice(1) : lines;
      const imported: Product[] = dataLines.map((line, i) => {
        const [name, sku, cat, price] = line.split(',').map((v) => v.trim());
        const matchedCategory = cat ? categories.find((c) => c.name.toLowerCase() === cat.toLowerCase()) : undefined;
        const resolvedCategory = matchedCategory ?? categories[0];
        return {
          id: `import-${Date.now()}-${i}`,
          name: name || `İçe Aktarılan Ürün ${i + 1}`,
          sku: sku || `DKR-IMP-${i + 1}`,
          category: cat || resolvedCategory?.name || '',
          categoryId: matchedCategory?.id ?? resolvedCategory?.id,
          status: 'taslak',
          countries: 0,
          updatedAt: new Date().toISOString().slice(0, 10),
          seoScore: 0,
          stock: 'stokta',
          price: price || '',
          description: '',
          weightKg: 0,
          swatch: '#8A9097',
          featured: false,
          relatedProductIds: [],
          gallery: [],
          video: null,
          document: null,
          ogImage: null,
          specifications: [],
        };
      });
      setProducts((prev) => [...imported, ...prev]);
      push({ tone: 'success', title: 'Ürünler içe aktarıldı', description: `${imported.length} ürün taslak olarak eklendi.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Ürün Yönetimi"
        description="Ürünlerin oluşturulması, düzenlenmesi ve yayınlanması."
        actions={
          <>
            <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
            <Button variant="secondary" icon={<Upload size={15} />} onClick={() => importInputRef.current?.click()}>İçe Aktar</Button>
            <Button variant="secondary" icon={<Download size={15} />} onClick={exportList}>Dışa Aktar</Button>
            <Button icon={<Plus size={15} />} onClick={addProduct}>Yeni Ürün</Button>
          </>
        }
      />

      {/* Primary — things that need attention today. */}
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
        <StatCard
          label="SEO Eksik"
          value={String(overview.missingSeo)}
          icon={SearchX}
          tone={overview.missingSeo > 0 ? 'warning' : 'neutral'}
          onClick={() => setQuickFilter('missingSeo')}
        />
        <StatCard
          label="Görselsiz"
          value={String(overview.missingImages)}
          icon={ImageOff}
          tone={overview.missingImages > 0 ? 'warning' : 'neutral'}
          onClick={() => setQuickFilter('missingImages')}
        />
        <StatCard
          label="Stokta Yok"
          value={String(overview.outOfStock)}
          icon={PackageX}
          tone={overview.outOfStock > 0 ? 'red' : 'neutral'}
          onClick={() => setQuickFilter('outOfStock')}
        />
        <StatCard
          label="İncelemede"
          value={String(overview.waitingForReview)}
          icon={ClipboardCheck}
          tone={overview.waitingForReview > 0 ? 'warning' : 'neutral'}
          onClick={() => setStageFilter('inceleme')}
        />
      </div>

      {/* Secondary — informational counts, no action implied. */}
      <div className="mt-3 grid grid-cols-2 gap-3 tablet:grid-cols-3">
        <StatCard size="compact" label="Yayında" value={String(overview.published)} icon={CheckCircle2} tone="success" onClick={() => setStageFilter('yayinda')} />
        <StatCard size="compact" label="Taslak" value={String(overview.drafts)} icon={Package} tone="neutral" onClick={() => setStageFilter('taslak')} />
        <StatCard size="compact" label="Son Güncellenen" value={String(overview.recentlyUpdated)} icon={Clock} tone="info" />
      </div>

      <div className="mt-4">
        <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} ürün</span>}>
          <div className="w-full max-w-xs">
            <SearchInput placeholder="Ürün adı veya SKU ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="w-40">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-40">
            <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="all">Tüm İş Akışları</option>
              {(Object.keys(workflowStageLabel) as WorkflowStage[]).map((s) => (
                <option key={s} value={s}>{workflowStageLabel[s]}</option>
              ))}
            </Select>
          </div>
          {quickFilter !== 'none' && (
            <button
              type="button"
              onClick={() => setQuickFilter('none')}
              className="flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[12px] font-medium text-warning transition-colors hover:bg-warning/20"
            >
              Filtre: {quickFilterLabel[quickFilter]}
              <X size={12} />
            </button>
          )}
        </Toolbar>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} ürün seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<CheckCircle2 size={13} />} onClick={bulkPublish}>Yayınla</Button>
            <Button variant="ghost" size="sm" icon={<Archive size={13} />} onClick={bulkArchive}>Arşivle</Button>
            <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => setBulkDeleteOpen(true)}>Sil</Button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-soft p-1.5 text-steel hover:bg-mist dark:text-white/40 dark:hover:bg-white/5" aria-label="Seçimi temizle">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <Table>
        <Thead>
          <Tr>
            <Th className="w-10">
              <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} />
            </Th>
            <Th><SortHeader label="Ürün" active={sortKey === 'name'} onClick={() => toggleSort('name')} /></Th>
            <Th>SKU</Th>
            <Th>Kategori</Th>
            <Th>İş Akışı</Th>
            <Th>Stok</Th>
            <Th><SortHeader label="SEO" active={sortKey === 'seoScore'} onClick={() => toggleSort('seoScore')} /></Th>
            <Th>Medya</Th>
            <Th>Belge</Th>
            <Th><SortHeader label="Güncellendi" active={sortKey === 'updatedAt'} onClick={() => toggleSort('updatedAt')} /></Th>
            <Th className="w-16" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && (
            <TableEmptyRow colSpan={11}>
              {products.length === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <p>Henüz ürün eklenmedi.</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<Upload size={13} />} onClick={() => importInputRef.current?.click()}>İçe Aktar</Button>
                    <Button size="sm" icon={<Plus size={13} />} onClick={addProduct}>Yeni Ürün</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p>Arama kriterlerine uyan ürün bulunamadı.</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<FilterX size={13} />} onClick={clearFilters}>Filtreleri Temizle</Button>
                    <Button size="sm" icon={<Plus size={13} />} onClick={addProduct}>Yeni Ürün</Button>
                  </div>
                </div>
              )}
            </TableEmptyRow>
          )}
          {filtered.map(({ product, checks, stage }) => {
            const stockInfo = stockTone[product.stock];
            const coverMedia = product.gallery.length > 0 ? mediaItems.find((m) => m.id === product.gallery[0]) : undefined;
            return (
              <Tr key={product.id} interactive className="group" onClick={() => openProduct(product)}>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(product.id)} onChange={() => toggleOne(product.id)} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    {coverMedia ? (
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft text-white/80"
                        style={{ backgroundColor: coverMedia.swatch }}
                      >
                        <Package size={14} strokeWidth={1.8} />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft border border-dashed border-border text-steel/50 dark:border-white/10 dark:text-white/25" title="Görsel yok">
                        <ImageOff size={14} strokeWidth={1.8} />
                      </div>
                    )}
                    <span className="min-w-0 truncate font-medium">{product.name}</span>
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-steel dark:text-white/50">{product.sku}</Td>
                <Td>{product.category || <span className="text-warning">Yok</span>}</Td>
                <Td><Badge tone={workflowStageTone[stage]} dot>{stageShortLabel[stage]}</Badge></Td>
                <Td><Badge tone={stockInfo.tone}>{stockInfo.label}</Badge></Td>
                <Td><Badge tone={getSeoTone(product.seoScore)}>{product.seoScore}</Badge></Td>
                <Td>
                  {checks.missingGallery ? (
                    <Badge tone="warning"><ImageOff size={10} /> Eksik</Badge>
                  ) : checks.missingAltText ? (
                    <Badge tone="warning"><AlertTriangle size={10} /> {product.gallery.length} görsel</Badge>
                  ) : (
                    <Badge tone="success"><Images size={10} /> {product.gallery.length} görsel</Badge>
                  )}
                </Td>
                <Td>
                  {checks.missingDocument ? (
                    <Badge tone="neutral"><FileWarning size={10} /> Yok</Badge>
                  ) : (
                    <Badge tone="success"><FileDown size={10} /> Var</Badge>
                  )}
                </Td>
                <Td className="text-steel dark:text-white/50">{product.updatedAt}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => window.open(`https://dekortools.com/urunler/${product.slug ?? product.sku.toLowerCase()}`, '_blank', 'noopener,noreferrer')}
                      className="flex h-7 w-7 items-center justify-center rounded-soft text-steel opacity-0 transition-opacity hover:bg-mist hover:text-near-black group-hover:opacity-100 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                      aria-label="Sitede görüntüle"
                      title="Sitede görüntüle"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <Popover
                      align="end"
                      width={200}
                      trigger={({ toggle }) => (
                        <button type="button" onClick={toggle} className="flex h-7 w-7 items-center justify-center rounded-soft text-steel hover:bg-mist hover:text-near-black dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white" aria-label="Hızlı işlemler">
                          <MoreVertical size={15} />
                        </button>
                      )}
                    >
                      <div className="flex flex-col p-1">
                        <button type="button" onClick={() => openProduct(product, 'genel')} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Eye size={13} /> Görüntüle / Düzenle
                        </button>
                        <button type="button" onClick={() => openProduct(product, 'medya')} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Images size={13} /> Medya Ekle
                        </button>
                        <button type="button" onClick={() => openProduct(product, 'teknik')} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <FileDown size={13} /> Belge / PDF Ekle
                        </button>
                        <button type="button" onClick={() => openProduct(product, 'seo')} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Search size={13} /> SEO&apos;yu Aç
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(`https://dekortools.com/urunler/${product.slug ?? product.sku.toLowerCase()}`, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
                        >
                          <ExternalLink size={13} /> Sitede Görüntüle
                        </button>
                        <button type="button" onClick={() => duplicateProduct(product)} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Copy size={13} /> Çoğalt
                        </button>
                        <button type="button" onClick={() => setSingleDeleteTarget(product)} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-danger hover:bg-danger-soft">
                          <Trash2 size={13} /> Sil
                        </button>
                      </div>
                    </Popover>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <div className="mt-4 flex justify-end">
        <Pagination page={page} totalPages={3} onPageChange={setPage} />
      </div>

      <ProductDrawer
        product={activeProduct}
        initialTab={activeTab}
        onClose={() => setActiveProduct(null)}
        onUpdate={updateProduct}
        onDuplicate={duplicateProduct}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} ürünü sil`}
        description={<>Seçili {selected.size} ürünü kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</>}
        consequences={
          affectedByBulkDelete.length > 0
            ? affectedByBulkDelete.map((p) => `"${p.name}" ürününün ilişkili ürünler listesinden çıkarılacak`)
            : undefined
        }
        confirmLabel="Ürünleri Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(singleDeleteTarget)}
        title="Ürünü sil"
        description={singleDeleteTarget ? <>&quot;{singleDeleteTarget.name}&quot; ürününü kalıcı olarak silmek üzeresiniz.</> : null}
        consequences={
          singleDeleteTarget
            ? products.filter((p) => p.id !== singleDeleteTarget.id && p.relatedProductIds.includes(singleDeleteTarget.id)).map((p) => `"${p.name}" ürününün ilişkili ürünler listesinden çıkarılacak`)
            : undefined
        }
        confirmLabel="Ürünü Sil"
        onConfirm={confirmSingleDelete}
        onCancel={() => setSingleDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
