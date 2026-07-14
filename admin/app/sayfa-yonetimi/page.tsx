'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ArrowUpDown, CheckCircle2, Archive, Trash2, X, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { PageDrawer } from '@/components/pages/PageDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type CmsPage } from '@/lib/mock-data';
import { getAdminPages, savePage, setPageStatus, softDeletePage } from '@/lib/actions/page-actions';
import { pageStatusTone } from '@/lib/status-tones';

function seoTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

type SortKey = 'title' | 'seoScore' | 'updatedAt';

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-near-black dark:hover:text-white">
      {label}
      <ArrowUpDown size={11} className={active ? 'text-red dark:text-red-eyebrow' : 'opacity-40'} />
    </button>
  );
}

export default function SayfaYonetimiPage() {
  const { push } = useToast();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activePage, setActivePage] = useState<CmsPage | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<CmsPage | null>(null);

  const loadPages = useCallback(async () => {
    try {
      setPages(await getAdminPages());
    } catch {
      push({ tone: 'danger', title: 'Sayfalar yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const filtered = useMemo(() => {
    const result = pages.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (status !== 'all' && p.status !== status) return false;
      return true;
    });
    const sorted = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortKey === 'updatedAt') return a.updatedAt.localeCompare(b.updatedAt) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
    return sorted;
  }, [pages, query, status, sortKey, sortDir]);

  async function bulkPublish() {
    const ids = [...selected];
    await Promise.all(ids.map((id) => setPageStatus(id, 'yayinda')));
    push({ tone: 'success', title: `${ids.length} sayfa yayınlandı` });
    setSelected(new Set());
    await loadPages();
  }

  async function bulkUnpublish() {
    const ids = [...selected];
    await Promise.all(ids.map((id) => setPageStatus(id, 'taslak')));
    push({ tone: 'success', title: `${ids.length} sayfa taslağa alındı` });
    setSelected(new Set());
    await loadPages();
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    setSelected(new Set());
    setBulkDeleteOpen(false);
    await Promise.all(ids.map((id) => softDeletePage(id)));
    push({ tone: 'danger', title: `${ids.length} sayfa silindi` });
    await loadPages();
  }

  async function confirmSingleDelete() {
    if (!singleDeleteTarget) return;
    const target = singleDeleteTarget;
    setSingleDeleteTarget(null);
    const result = await softDeletePage(target.id);
    if (!result.success) { push({ tone: 'danger', title: 'Silinemedi', description: result.error }); return; }
    push({ tone: 'danger', title: `"${target.title}" silindi` });
    await loadPages();
  }

  async function addPage() {
    const slug = `yeni-sayfa-${Date.now().toString(36)}`;
    const result = await savePage(null, { title: 'Yeni Sayfa', slug, path: `/${slug}`, template: 'standard', showInNavigation: false }, 'taslak');
    if (!result.success) { push({ tone: 'danger', title: 'Oluşturulamadı', description: result.error }); return; }
    push({ tone: 'success', title: 'Yeni sayfa oluşturuldu' });
    await loadPages();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (pages.length === 0) {
    return (
      <ContentContainer>
        <PageHeader
          title="Sayfa Yönetimi"
          description="Kurumsal site sayfaları ve içerik blokları."
          actions={<Button icon={<Plus size={15} />} onClick={addPage}>Yeni Sayfa</Button>}
        />
        <EmptyState icon={FileText} title="Henüz sayfa yok" description="İlk sayfanızı oluşturarak kurumsal siteyi düzenlemeye başlayın." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Sayfa Yönetimi"
        description="Kurumsal site sayfaları ve içerik blokları."
        actions={<Button icon={<Plus size={15} />} onClick={addPage}>Yeni Sayfa</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} sayfa</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Sayfa ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tüm Durumlar</option>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
            <option value="inceleme">İncelemede</option>
          </Select>
        </div>
      </Toolbar>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} sayfa seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<CheckCircle2 size={13} />} onClick={bulkPublish}>Yayınla</Button>
            <Button variant="ghost" size="sm" icon={<Archive size={13} />} onClick={bulkUnpublish}>Taslağa Al</Button>
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
            <Th><SortHeader label="Sayfa" active={sortKey === 'title'} onClick={() => toggleSort('title')} /></Th>
            <Th>Yol</Th>
            <Th>Dil</Th>
            <Th>Durum</Th>
            <Th><SortHeader label="SEO Skoru" active={sortKey === 'seoScore'} onClick={() => toggleSort('seoScore')} /></Th>
            <Th>Yazar</Th>
            <Th><SortHeader label="Güncellendi" active={sortKey === 'updatedAt'} onClick={() => toggleSort('updatedAt')} /></Th>
            <Th className="w-10" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <TableEmptyRow colSpan={9}>Arama kriterlerine uyan sayfa bulunamadı.</TableEmptyRow>}
          {filtered.map((p) => {
            const info = pageStatusTone[p.status];
            return (
              <Tr key={p.id} interactive onClick={() => setActivePage(p)}>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                </Td>
                <Td className="font-medium">{p.title}</Td>
                <Td className="font-mono text-[12px] text-steel dark:text-white/50">{p.path}</Td>
                <Td>
                  <Badge tone="neutral">{p.language}</Badge>
                </Td>
                <Td><Badge tone={info.tone} dot>{info.label}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="w-6 tabular-nums text-body-sm font-medium">{p.seoScore}</span>
                    <ProgressBar value={p.seoScore} tone={seoTone(p.seoScore)} className="w-16" />
                  </div>
                </Td>
                <Td>{p.author}</Td>
                <Td className="text-steel dark:text-white/50">{p.updatedAt}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => setSingleDeleteTarget(p)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Sayfayı sil">
                    <Trash2 size={16} />
                  </button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <PageDrawer page={activePage} onClose={() => setActivePage(null)} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} sayfayı sil`}
        description={<>Seçili {selected.size} sayfayı kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</>}
        confirmLabel="Sayfaları Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(singleDeleteTarget)}
        title="Sayfayı sil"
        description={singleDeleteTarget ? <>&quot;{singleDeleteTarget.title}&quot; sayfasını kalıcı olarak silmek üzeresiniz.</> : null}
        confirmLabel="Sayfayı Sil"
        onConfirm={confirmSingleDelete}
        onCancel={() => setSingleDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
