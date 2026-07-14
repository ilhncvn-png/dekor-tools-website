'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload, FileText, Download, Trash2, Lock, Globe2, X, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { FileDrawer } from '@/components/files/FileDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type FileDoc } from '@/lib/mock-data';
import { getAdminFiles, saveFile, deleteFileDoc } from '@/lib/actions/misc-content-actions';

const formatTone: Record<string, 'danger' | 'success' | 'info'> = { PDF: 'danger', XLSX: 'success', DOCX: 'info' };

const accessTone: Record<FileDoc['accessLevel'], { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  'herkese-acik': { tone: 'success', label: 'Herkese Açık' },
  'sadece-bayi': { tone: 'warning', label: 'Bayi' },
  'sadece-yonetici': { tone: 'danger', label: 'Yönetici' },
};

export default function DosyaMerkeziPage() {
  const { push } = useToast();
  const [fileDocs, setFileDocs] = useState<FileDoc[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFile] = useState<FileDoc | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<FileDoc | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      setFileDocs(await getAdminFiles());
    } catch {
      push({ tone: 'danger', title: 'Dosyalar yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const categoryOptions = Array.from(new Set(fileDocs.map((f) => f.category)));

  const filtered = useMemo(
    () =>
      fileDocs.filter((f) => {
        if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (category !== 'all' && f.category !== category) return false;
        return true;
      }),
    [fileDocs, query, category]
  );

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((f) => f.id))));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function uploadFile() {
    // Create a real FileDoc metadata record (title/format/access editable in the drawer).
    const draft: FileDoc = {
      id: `new-${Date.now()}`, name: 'Yeni Doküman', category: 'Katalog', format: 'PDF', size: '0 KB',
      downloads: 0, updatedAt: new Date().toISOString().slice(0, 10), accessLevel: 'herkese-acik',
      version: 'v1', language: 'TR', linkedTo: null, uploadedBy: '',
    };
    const result = await saveFile(null, draft);
    if (!result.success) { push({ tone: 'danger', title: 'Oluşturulamadı', description: result.error }); return; }
    await loadFiles();
  }

  async function updateFile(updated: FileDoc) {
    const result = await saveFile(updated.id, updated);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    await loadFiles();
    setActiveFile(null);
  }

  function bulkDownload() {
    push({ tone: 'info', title: `${selected.size} dosya indiriliyor` });
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    setSelected(new Set());
    setBulkDeleteOpen(false);
    await Promise.all(ids.filter((id) => !id.includes('-')).map((id) => deleteFileDoc(id)));
    push({ tone: 'danger', title: `${ids.length} dosya silindi` });
    await loadFiles();
  }

  async function confirmSingleDelete() {
    if (!singleDeleteTarget) return;
    const target = singleDeleteTarget;
    setSingleDeleteTarget(null);
    if (!target.id.includes('-')) await deleteFileDoc(target.id);
    await loadFiles();
  }

  if (fileDocs.length === 0) {
    return (
      <ContentContainer>
        <PageHeader
          title="Dosya Merkezi"
          description="Kataloglar, fiyat listeleri ve teknik dokümanlar."
          actions={<Button icon={<Upload size={15} />} onClick={uploadFile}>Dosya Yükle</Button>}
        />
        <EmptyState icon={FolderOpen} title="Henüz dosya yok" description="İlk kataloğunuzu veya dokümanınızı yükleyerek başlayın." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Dosya Merkezi"
        description="Kataloglar, fiyat listeleri ve teknik dokümanlar."
        actions={<Button icon={<Upload size={15} />} onClick={uploadFile}>Dosya Yükle</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} dosya</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Dosya ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-48">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Tüm Kategoriler</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </Toolbar>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} dosya seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={bulkDownload}>İndir</Button>
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
            <Th>Dosya</Th>
            <Th>Kategori</Th>
            <Th>Format</Th>
            <Th>Erişim</Th>
            <Th>Bağlı Bölüm</Th>
            <Th>İndirme</Th>
            <Th>Güncellendi</Th>
            <Th className="w-16" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <TableEmptyRow colSpan={9}>Arama kriterlerine uyan dosya bulunamadı.</TableEmptyRow>}
          {filtered.map((f) => {
            const access = accessTone[f.accessLevel];
            return (
              <Tr key={f.id} interactive onClick={() => setActiveFile(f)}>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(f.id)} onChange={() => toggleOne(f.id)} />
                </Td>
                <Td className="flex items-center gap-2.5 font-medium">
                  <FileText size={16} className="shrink-0 text-steel dark:text-white/40" />
                  {f.name}
                  <span className="font-mono text-[10px] text-steel dark:text-white/40">{f.version}</span>
                </Td>
                <Td>{f.category}</Td>
                <Td><Badge tone={formatTone[f.format]}>{f.format}</Badge></Td>
                <Td>
                  <Badge tone={access.tone}>
                    {f.accessLevel === 'herkese-acik' ? <Globe2 size={9} className="mr-0.5 inline" /> : <Lock size={9} className="mr-0.5 inline" />}
                    {access.label}
                  </Badge>
                </Td>
                <Td className="max-w-[160px] truncate text-steel dark:text-white/50">{f.linkedTo ?? '—'}</Td>
                <Td className="text-steel dark:text-white/50">{f.downloads.toLocaleString('tr-TR')}</Td>
                <Td className="text-steel dark:text-white/50">{f.updatedAt}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => push({ tone: 'info', title: 'İndiriliyor', description: `${f.name} (${f.version})` })}
                      className="text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white"
                      aria-label="İndir"
                    >
                      <Download size={15} />
                    </button>
                    <button type="button" onClick={() => setSingleDeleteTarget(f)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Dosyayı sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <FileDrawer file={activeFile} onClose={() => setActiveFile(null)} onUpdate={updateFile} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} dosyayı sil`}
        description={<>Seçili {selected.size} dosyayı kalıcı olarak silmek üzeresiniz.</>}
        confirmLabel="Dosyaları Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(singleDeleteTarget)}
        title="Dosyayı sil"
        description={singleDeleteTarget ? <>&quot;{singleDeleteTarget.name}&quot; dosyasını kalıcı olarak silmek üzeresiniz.</> : null}
        consequences={singleDeleteTarget?.linkedTo ? [`${singleDeleteTarget.linkedTo} bu dosya bağlantısını kaybedecek`] : undefined}
        confirmLabel="Dosyayı Sil"
        onConfirm={confirmSingleDelete}
        onCancel={() => setSingleDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
