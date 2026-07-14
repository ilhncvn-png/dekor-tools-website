'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  ArrowUpDown,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pencil,
  CheckCircle2,
  EyeOff,
  Trash2,
  X,
  Home,
  Navigation as NavigationIcon,
  MoreVertical,
  Eye,
  ExternalLink,
  Copy,
  FilterX,
  FolderTree,
  Package,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Popover } from '@/components/ui/Popover';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { CategoryDrawer } from '@/components/categories/CategoryDrawer';
import { type Category, type Product } from '@/lib/mock-data';
import { toCategoryInput } from '@/lib/adapters/category-adapter';
import {
  getAdminCategories,
  saveCategory,
  softDeleteCategory,
  setCategoryVisibility,
  setCategoryPromotion,
  reorderCategories,
} from '@/lib/actions/category-actions';
import { getSeoTone } from '@/lib/product-health';
import {
  buildCategoryTree,
  flattenAll,
  getCategoryPath,
  getCategoryProductStats,
  getChildren,
  getDescendantIds,
  getFullNamePath,
  getFullSlugPath,
  reorderSibling,
  type CategorySortKey,
  type CategoryTreeRow,
} from '@/lib/category-health';

type VisibilityFilter = 'all' | 'gorunur' | 'gizli';

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

export default function KategoriYonetimiPage() {
  const { push } = useToast();
  // Real data from Neon PostgreSQL (via getAdminCategories), mapped to the same
  // Category shape this UI has always consumed — the screen is unchanged, only
  // the source is real. loadCategories() is the single reconcile point every
  // mutation calls after persisting, so the list always reflects the database.
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // Products are not yet migrated to the DB; the count/reassignment workflow
  // operates on this (currently empty) list until Product Management is wired.
  const [products, setProducts] = useState<Product[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const rows = await getAdminCategories();
      setCategories(rows);
    } catch {
      push({ tone: 'danger', title: 'Kategoriler yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [query, setQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'fam-01': true });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<CategorySortKey>('manual');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string> | null>(null);
  const [reassignChoice, setReassignChoice] = useState<'move' | 'together'>('move');
  const [replacementCategoryId, setReplacementCategoryId] = useState('');
  const [parentChangeOpen, setParentChangeOpen] = useState(false);
  const [newParentId, setNewParentId] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const matchedIds = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return new Set(
      categories.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).map((c) => c.id)
    );
  }, [categories, query]);

  // Search shows the matching node(s) plus their ancestor chain — not every unrelated
  // sibling the way the old implementation did — and force-expands just enough of the
  // tree to reveal them, without permanently changing the user's collapse state.
  const searchVisibleIds = useMemo(() => {
    if (!matchedIds) return null;
    const result = new Set<string>();
    for (const id of matchedIds) {
      for (const ancestor of getCategoryPath(categories, id)) result.add(ancestor.id);
    }
    return result;
  }, [matchedIds, categories]);

  const effectiveExpanded = useMemo(() => {
    if (!searchVisibleIds) return expanded;
    const next = { ...expanded };
    for (const id of searchVisibleIds) next[id] = true;
    return next;
  }, [expanded, searchVisibleIds]);

  const treeRows = useMemo(() => {
    let rows = buildCategoryTree(categories, effectiveExpanded, sortKey, sortDir);
    if (searchVisibleIds) rows = rows.filter((r) => searchVisibleIds.has(r.category.id));
    if (visibilityFilter !== 'all') rows = rows.filter((r) => (visibilityFilter === 'gorunur' ? r.category.visible : !r.category.visible));
    return rows;
  }, [categories, effectiveExpanded, sortKey, sortDir, searchVisibleIds, visibilityFilter]);

  function toggleSort(key: CategorySortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === treeRows.length ? new Set() : new Set(treeRows.map((r) => r.category.id))));
  }

  function clearFilters() {
    setQuery('');
    setVisibilityFilter('all');
  }

  function openCategory(category: Category) {
    setActiveCategory(category);
  }

  async function updateCategory(updated: Category) {
    // A locally-created draft has a synthetic id (new-.../import-...); persist
    // it as an INSERT, otherwise UPDATE the existing database row.
    const isDraft = updated.id.startsWith('new-') || updated.id.startsWith('import-') || updated.id.includes('-copy-');
    const result = await saveCategory(isDraft ? null : updated.id, toCategoryInput(updated));
    if (!result.success) {
      push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error });
      return;
    }
    await loadCategories();
    setActiveCategory(null);
  }

  function addCategory(parentId: string | null = null) {
    const siblingCount = getChildren(categories, parentId).length;
    const newCategory: Category = {
      id: `new-${Date.now()}`,
      name: 'Yeni Kategori',
      slug: `yeni-kategori-${Date.now()}`,
      description: '',
      parentId,
      order: siblingCount + 1,
      visible: false,
      showOnHomepage: false,
      showInNavigation: false,
      seoScore: 0,
      languageStatus: [{ code: 'TR', complete: false }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setCategories((prev) => [...prev, newCategory]);
    if (parentId) setExpanded((prev) => ({ ...prev, [parentId]: true }));
    setActiveCategory(newCategory);
  }

  function duplicateCategory(source: Category) {
    const siblingCount = getChildren(categories, source.parentId).length;
    const copy: Category = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} (Kopya)`,
      slug: `${source.slug}-kopya-${Date.now()}`,
      order: siblingCount + 1,
      visible: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setCategories((prev) => [...prev, copy]);
    setActiveCategory(copy);
    push({ tone: 'success', title: 'Kategori çoğaltıldı', description: `${copy.name} taslak olarak eklendi.` });
  }

  async function setVisible(ids: Set<string>, visible: boolean) {
    // Optimistic UI, then persist each to Neon and reconcile.
    setCategories((prev) =>
      prev.map((c) => (ids.has(c.id) ? { ...c, visible, ...(visible ? {} : { showOnHomepage: false, showInNavigation: false }) } : c))
    );
    for (const id of ids) {
      const r = await setCategoryVisibility(id, visible);
      if (!r.success) push({ tone: 'danger', title: 'İşlem başarısız', description: r.error });
    }
    await loadCategories();
  }

  async function setPromotion(ids: Set<string>, promoted: boolean) {
    setCategories((prev) => prev.map((c) => (ids.has(c.id) ? { ...c, showOnHomepage: promoted, showInNavigation: promoted } : c)));
    for (const id of ids) {
      const r = await setCategoryPromotion(id, promoted);
      if (!r.success) push({ tone: 'danger', title: 'İşlem başarısız', description: r.error });
    }
    await loadCategories();
  }

  async function moveCategory(catId: string, dir: 'up' | 'down') {
    const next = reorderSibling(categories, catId, dir);
    setCategories(next);
    setSortKey('manual');
    // Persist the new order to Neon (skip synthetic drafts). Global increasing
    // sortOrder preserves each sibling group's relative order on reload.
    const ordered = [...next]
      .sort((a, b) => a.order - b.order)
      .map((c) => c.id)
      .filter((id) => !id.startsWith('new-') && !id.startsWith('import-') && !id.includes('-copy-'));
    await reorderCategories(ordered);
  }

  function bulkPublish() {
    setVisible(selected, true);
    push({ tone: 'success', title: `${selected.size} kategori yayınlandı` });
    setSelected(new Set());
  }

  function bulkUnpublish() {
    setVisible(selected, false);
    push({ tone: 'success', title: `${selected.size} kategori yayından kaldırıldı` });
    setSelected(new Set());
  }

  function bulkHide() {
    setPromotion(selected, false);
    push({ tone: 'success', title: `${selected.size} kategori ana sayfa/menüden gizlendi` });
    setSelected(new Set());
  }

  function exportList() {
    const header = ['Kategori Adı', 'Kod', 'Tam Yol', 'Üst Kategori', 'Görünürlük', 'SEO Skoru', 'Ürün Sayısı', 'Sıra', 'Güncellendi'];
    const rows = treeRows.map(({ category: c }) => {
      const parent = c.parentId ? categories.find((p) => p.id === c.parentId) : undefined;
      const stats = getCategoryProductStats(c, categories, products);
      return [c.name, c.code ?? '', getFullNamePath(categories, c.id), parent?.name ?? '—', c.visible ? 'Görünür' : 'Gizli', c.seoScore, stats.total, c.order, c.updatedAt];
    });
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kategori-listesi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push({ tone: 'success', title: 'Liste dışa aktarıldı', description: `${treeRows.length} kategori CSV olarak indirildi.` });
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const dataLines = lines[0]?.toLowerCase().includes('slug') ? lines.slice(1) : lines;

      let next = categories;
      let imported = 0;
      for (const line of dataLines) {
        const [name, slug, parentName] = line.split(',').map((v) => v.trim());
        if (!name) continue;
        const parent = parentName ? next.find((c) => c.name.toLowerCase() === parentName.toLowerCase()) : undefined;
        const parentId = parent?.id ?? null;
        const siblingCount = getChildren(next, parentId).length;
        const created: Category = {
          id: `import-${Date.now()}-${imported}`,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          parentId,
          order: siblingCount + 1,
          visible: false,
          showOnHomepage: false,
          showInNavigation: false,
          seoScore: 0,
          languageStatus: [{ code: 'TR', complete: false }, { code: 'EN', complete: false }, { code: 'DE', complete: false }],
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        next = [...next, created];
        imported += 1;
      }
      setCategories(next);
      push({ tone: 'success', title: 'Kategoriler içe aktarıldı', description: `${imported} kategori taslak olarak eklendi.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ---- Delete workflow ----

  function requestDelete(ids: Set<string>) {
    const blocked = [...ids].filter((id) => getChildren(categories, id).some((child) => !ids.has(child.id)));
    if (blocked.length > 0) {
      const names = blocked.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean);
      push({
        tone: 'warning',
        title: 'Silinemedi',
        description: `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` ve ${names.length - 3} kategori daha` : ''} alt kategori içeriyor. Önce alt kategorileri taşıyın veya silin.`,
      });
      return;
    }
    setReassignChoice('move');
    setReplacementCategoryId('');
    if (ids.size === 1) setSingleDeleteId([...ids][0]);
    else setBulkDeleteOpen(true);
    setPendingDeleteIds(ids);
  }

  const affectedProducts = useMemo(() => {
    if (!pendingDeleteIds) return [];
    const names = new Set([...pendingDeleteIds].map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean));
    return products.filter((p) => names.has(p.category));
  }, [pendingDeleteIds, categories, products]);

  function performDelete() {
    if (!pendingDeleteIds) return;
    const ids = pendingDeleteIds;

    if (affectedProducts.length > 0) {
      if (reassignChoice === 'move') {
        if (!replacementCategoryId) {
          push({ tone: 'danger', title: 'Lütfen yeni bir kategori seçin' });
          return;
        }
        const replacement = categories.find((c) => c.id === replacementCategoryId);
        if (replacement) {
          const affectedIds = new Set(affectedProducts.map((p) => p.id));
          setProducts((prev) => prev.map((p) => (affectedIds.has(p.id) ? { ...p, category: replacement.name } : p)));
        }
      } else {
        const affectedIds = new Set(affectedProducts.map((p) => p.id));
        setProducts((prev) => prev.filter((p) => !affectedIds.has(p.id)));
      }
    }

    setCategories((prev) => prev.filter((c) => !ids.has(c.id)));
    setSelected(new Set());
    setSingleDeleteId(null);
    setBulkDeleteOpen(false);
    setPendingDeleteIds(null);
    // Persist the soft-delete for real database rows (skip synthetic drafts).
    (async () => {
      let failed = 0;
      for (const id of ids) {
        if (id.startsWith('new-') || id.startsWith('import-') || id.includes('-copy-')) continue;
        const r = await softDeleteCategory(id);
        if (!r.success) { failed += 1; push({ tone: 'danger', title: 'Silinemedi', description: r.error }); }
      }
      await loadCategories();
      if (failed === 0) push({ tone: 'success', title: ids.size === 1 ? 'Kategori silindi' : `${ids.size} kategori silindi` });
    })();
  }

  function cancelDelete() {
    setSingleDeleteId(null);
    setBulkDeleteOpen(false);
    setPendingDeleteIds(null);
  }

  // ---- Bulk parent change ----

  function applyParentChange() {
    const targetParentId = newParentId === '' ? null : newParentId;

    // Computed against the current (pre-update) state, not inside the setState
    // updater — an updater's execution timing relative to the rest of this
    // function isn't guaranteed, so counting moves/skips as a side effect in
    // there previously reported "0 moved" even when the move had applied.
    let next = categories;
    let moved = 0;
    let skipped = 0;
    for (const id of selected) {
      const forbidden = new Set([id, ...getDescendantIds(next, id)]);
      if (targetParentId && forbidden.has(targetParentId)) {
        skipped += 1;
        continue;
      }
      const siblingCount = getChildren(next, targetParentId).length;
      next = next.map((c) => (c.id === id ? { ...c, parentId: targetParentId, order: siblingCount + 1 } : c));
      moved += 1;
    }

    setCategories(next);
    push({
      tone: moved > 0 ? 'success' : 'warning',
      title: `${moved} kategori taşındı${skipped > 0 ? `, ${skipped} kategori döngüsel hiyerarşi nedeniyle atlandı` : ''}`,
    });
    setParentChangeOpen(false);
    setSelected(new Set());
  }

  const selectedCount = selected.size;
  const forbiddenBulkParentIds = useMemo(() => {
    const result = new Set<string>();
    for (const id of selected) {
      result.add(id);
      for (const d of getDescendantIds(categories, id)) result.add(d);
    }
    return result;
  }, [selected, categories]);

  return (
    <ContentContainer>
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorisi (Ürün Aileleri) ve alt kategori kayıtlarını buradan yönetin — bu kayıtlar /urunler sayfasındaki aile kartlarını besler."
        actions={
          <>
            <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
            <Button variant="secondary" icon={<Upload size={15} />} onClick={() => importInputRef.current?.click()}>İçe Aktar</Button>
            <Button variant="secondary" icon={<Download size={15} />} onClick={exportList}>Dışa Aktar</Button>
            <Button icon={<Plus size={15} />} onClick={() => addCategory(null)}>Yeni Kategori</Button>
          </>
        }
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{treeRows.length} kategori</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Kategori ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}>
            <option value="all">Tüm Görünürlük</option>
            <option value="gorunur">Görünür</option>
            <option value="gizli">Gizli</option>
          </Select>
        </div>
      </Toolbar>

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selectedCount} kategori seçildi</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<CheckCircle2 size={13} />} onClick={bulkPublish}>Yayınla</Button>
            <Button variant="ghost" size="sm" icon={<EyeOff size={13} />} onClick={bulkUnpublish}>Yayından Kaldır</Button>
            <Button variant="ghost" size="sm" icon={<EyeOff size={13} />} onClick={bulkHide}>Gizle</Button>
            <Button variant="ghost" size="sm" icon={<FolderTree size={13} />} onClick={() => { setNewParentId(''); setParentChangeOpen(true); }}>Üst Kategori Değiştir</Button>
            <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={exportList}>Dışa Aktar</Button>
            <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => requestDelete(new Set(selected))}>Sil</Button>
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
              <Checkbox checked={treeRows.length > 0 && selected.size === treeRows.length} onChange={toggleAll} />
            </Th>
            <Th><SortHeader label="Kategori" active={sortKey === 'name'} onClick={() => toggleSort('name')} /></Th>
            <Th>Kod</Th>
            <Th>Üst Kategori</Th>
            <Th>Görünürlük</Th>
            <Th><SortHeader label="SEO" active={sortKey === 'seoScore'} onClick={() => toggleSort('seoScore')} /></Th>
            <Th>Ürün Sayısı</Th>
            <Th>Sıra</Th>
            <Th><SortHeader label="Güncellendi" active={sortKey === 'updatedAt'} onClick={() => toggleSort('updatedAt')} /></Th>
            <Th className="w-16" />
          </Tr>
        </Thead>
        <Tbody>
          {treeRows.length === 0 && (
            <TableEmptyRow colSpan={10}>
              {loading ? (
                <p>Kategoriler yükleniyor…</p>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <p>Henüz kategori eklenmedi.</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<Upload size={13} />} onClick={() => importInputRef.current?.click()}>İçe Aktar</Button>
                    <Button size="sm" icon={<Plus size={13} />} onClick={() => addCategory(null)}>Yeni Kategori</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p>Arama kriterlerine uyan kategori bulunamadı.</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<FilterX size={13} />} onClick={clearFilters}>Filtreleri Temizle</Button>
                    <Button size="sm" icon={<Plus size={13} />} onClick={() => addCategory(null)}>Yeni Kategori</Button>
                  </div>
                </div>
              )}
            </TableEmptyRow>
          )}
          {treeRows.map(({ category: cat, depth }: CategoryTreeRow) => {
            const hasChildren = categories.some((c) => c.parentId === cat.id);
            const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : undefined;
            const siblings = getChildren(categories, cat.parentId);
            const siblingIndex = siblings.findIndex((c) => c.id === cat.id);
            const stats = getCategoryProductStats(cat, categories, products);
            return (
              <Tr key={cat.id} interactive className="group" onClick={() => openCategory(cat)}>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(cat.id)} onChange={() => toggleSelect(cat.id)} />
                </Td>
                <Td style={{ paddingLeft: `${16 + depth * 24}px` }}>
                  <div className="flex items-center gap-1.5">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] })); }}
                        className="shrink-0 text-steel dark:text-white/40"
                        aria-label={effectiveExpanded[cat.id] ? 'Daralt' : 'Genişlet'}
                      >
                        <ChevronRight size={15} className={effectiveExpanded[cat.id] ? 'rotate-90 transition-transform' : 'transition-transform'} />
                      </button>
                    ) : (
                      <span className="w-[15px] shrink-0" />
                    )}
                    <div className="flex shrink-0 flex-col" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={siblingIndex <= 0}
                        onClick={() => moveCategory(cat.id, 'up')}
                        className="flex h-3.5 w-4 items-center justify-center text-steel/60 hover:text-near-black disabled:opacity-20 dark:text-white/30 dark:hover:text-white"
                        aria-label="Yukarı taşı"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        type="button"
                        disabled={siblingIndex >= siblings.length - 1}
                        onClick={() => moveCategory(cat.id, 'down')}
                        className="flex h-3.5 w-4 items-center justify-center text-steel/60 hover:text-near-black disabled:opacity-20 dark:text-white/30 dark:hover:text-white"
                        aria-label="Aşağı taşı"
                      >
                        <ChevronDown size={11} />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{cat.name}</span>
                        {!cat.visible && <Badge tone="neutral">Gizli</Badge>}
                      </div>
                      <p className="truncate font-mono text-[11px] text-steel dark:text-white/40">/{getFullSlugPath(categories, cat.id)}</p>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-steel dark:text-white/50">{cat.code ?? '—'}</Td>
                <Td className="text-steel dark:text-white/50">{parent?.name ?? '—'}</Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {cat.showOnHomepage && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-soft bg-info-soft text-info" title="Ana sayfada gösteriliyor">
                        <Home size={11} />
                      </span>
                    )}
                    {cat.showInNavigation && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-soft bg-ai-soft text-ai" title="Menüde gösteriliyor">
                        <NavigationIcon size={11} />
                      </span>
                    )}
                    {!cat.showOnHomepage && !cat.showInNavigation && <span className="text-[11.5px] text-steel dark:text-white/30">—</span>}
                  </div>
                </Td>
                <Td><Badge tone={getSeoTone(cat.seoScore)}>{cat.seoScore}</Badge></Td>
                <Td>
                  <span
                    className="flex items-center gap-1 text-[12px] font-medium text-near-black dark:text-white"
                    title={`${stats.published} yayında · ${stats.draft} taslak · ${stats.hidden} arşiv`}
                  >
                    <Package size={12} className="text-steel dark:text-white/30" /> {stats.total}
                  </span>
                </Td>
                <Td className="tabular-nums text-steel dark:text-white/50">{cat.order}</Td>
                <Td className="text-steel dark:text-white/50">{cat.updatedAt}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => window.open(`https://dekortools.com/${getFullSlugPath(categories, cat.id)}`, '_blank', 'noopener,noreferrer')}
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
                        <button type="button" onClick={() => openCategory(cat)} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Pencil size={13} /> Görüntüle / Düzenle
                        </button>
                        <button type="button" onClick={() => addCategory(cat.id)} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Plus size={13} /> Alt Kategori Ekle
                        </button>
                        <button type="button" onClick={() => duplicateCategory(cat)} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5">
                          <Copy size={13} /> Çoğalt
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(`https://dekortools.com/${getFullSlugPath(categories, cat.id)}`, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
                        >
                          <Eye size={13} /> Sitede Görüntüle
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisible(new Set([cat.id]), !cat.visible)}
                          className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
                        >
                          {cat.visible ? <EyeOff size={13} /> : <CheckCircle2 size={13} />} {cat.visible ? 'Yayından Kaldır' : 'Yayınla'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPromotion(new Set([cat.id]), !(cat.showOnHomepage || cat.showInNavigation))}
                          className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
                        >
                          {cat.showOnHomepage || cat.showInNavigation ? <EyeOff size={13} /> : <Eye size={13} />}
                          {cat.showOnHomepage || cat.showInNavigation ? ' Ana Sayfa/Menüden Gizle' : ' Ana Sayfa/Menüde Göster'}
                        </button>
                        <button type="button" onClick={() => requestDelete(new Set([cat.id]))} className="flex items-center gap-2 rounded-soft px-2.5 py-1.5 text-left text-[12.5px] text-danger hover:bg-danger-soft">
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
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(treeRows.length / 50))} onPageChange={setPage} />
      </div>

      <CategoryDrawer
        category={activeCategory}
        categories={categories}
        products={products}
        onClose={() => setActiveCategory(null)}
        onUpdate={updateCategory}
        onDuplicate={duplicateCategory}
      />

      <ConfirmDialog
        open={Boolean(singleDeleteId) || bulkDeleteOpen}
        title={pendingDeleteIds && pendingDeleteIds.size > 1 ? `${pendingDeleteIds.size} kategoriyi sil` : `"${pendingDeleteIds ? categories.find((c) => c.id === [...pendingDeleteIds][0])?.name : ''}" kategorisini sil`}
        description={
          <div>
            {affectedProducts.length > 0 ? (
              <>
                <p>Bu kategori {affectedProducts.length} ürün içeriyor. Devam etmeden önce ne yapılacağını seçin:</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  <Radio checked={reassignChoice === 'move'} onChange={() => setReassignChoice('move')} label="Ürünleri başka bir kategoriye taşı" />
                  {reassignChoice === 'move' && (
                    <div className="ml-6">
                      <Select value={replacementCategoryId} onChange={(e) => setReplacementCategoryId(e.target.value)}>
                        <option value="">Kategori seçin...</option>
                        {categories.filter((c) => !pendingDeleteIds?.has(c.id)).map((c) => (
                          <option key={c.id} value={c.id}>{getFullNamePath(categories, c.id)}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <Radio checked={reassignChoice === 'together'} onChange={() => setReassignChoice('together')} label="Ürünleri kategoriyle birlikte sil" />
                </div>
              </>
            ) : (
              <p>Bu kategoriyi kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</p>
            )}
          </div>
        }
        confirmLabel="Sil"
        onConfirm={performDelete}
        onCancel={cancelDelete}
      />

      <ConfirmDialog
        open={parentChangeOpen}
        title="Üst kategoriyi değiştir"
        tone="default"
        description={
          <div>
            <p>{selectedCount} kategori için yeni üst kategori seçin.</p>
            <div className="mt-3">
              <Select value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
                <option value="">— Üst kategori yok (ana kategori) —</option>
                {flattenAll(categories).filter((row) => !forbiddenBulkParentIds.has(row.category.id)).map(({ category: c, depth }) => (
                  <option key={c.id} value={c.id}>{'—'.repeat(depth)} {c.name}</option>
                ))}
              </Select>
            </div>
          </div>
        }
        confirmLabel="Taşı"
        onConfirm={applyParentChange}
        onCancel={() => setParentChangeOpen(false)}
      />
    </ContentContainer>
  );
}
