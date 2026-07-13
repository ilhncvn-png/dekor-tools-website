'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FolderPlus, Image as ImageIcon, PlayCircle, AlertTriangle, Sparkles, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { MediaDrawer } from '@/components/media/MediaDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type MediaItem } from '@/lib/mock-data';
import { getAdminMedia, uploadMediaAsset, deleteMediaAsset, updateMediaAsset } from '@/lib/actions/media-actions';

const folders = ['Ürün Görselleri', 'Kurumsal', 'Üretim', 'Etkinlikler', 'Belgeler'];

const optimizationDot: Record<MediaItem['optimizationStatus'], string> = {
  optimized: 'bg-success',
  gerekli: 'bg-warning',
  desteklenmiyor: 'bg-steel/50 dark:bg-white/30',
};

export default function MedyaKutuphanesiPage() {
  const { push } = useToast();
  // Real assets from Neon + Vercel Blob, mapped to the UI's MediaItem shape.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<MediaItem | null>(null);

  const loadMedia = useCallback(async () => {
    try {
      const rows = await getAdminMedia();
      setMediaItems(rows);
    } catch {
      push({ tone: 'danger', title: 'Medya yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Deep-link support: ?asset=<id> opens that item's drawer once media loads.
  useEffect(() => {
    const assetId = new URLSearchParams(window.location.search).get('asset');
    if (!assetId || mediaItems.length === 0) return;
    const match = mediaItems.find((m) => m.id === assetId);
    if (match) setActiveItem(match);
  }, [mediaItems]);

  const filtered = useMemo(
    () =>
      mediaItems.filter((m) => {
        if (query && !m.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (folder !== 'all' && m.folder !== folder) return false;
        return true;
      }),
    [mediaItems, query, folder]
  );

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    setSelected(new Set());
    setBulkDeleteOpen(false);
    const results = await Promise.all(ids.map((id) => deleteMediaAsset(id)));
    const blocked = results.filter((r) => !r.success);
    if (blocked.length) push({ tone: 'danger', title: `${blocked.length} dosya silinemedi`, description: blocked[0].error });
    await loadMedia();
  }

  async function confirmSingleDelete() {
    if (!singleDeleteTarget) return;
    const target = singleDeleteTarget;
    setSingleDeleteTarget(null);
    setActiveItem(null);
    const result = await deleteMediaAsset(target.id);
    if (!result.success) {
      push({ tone: 'danger', title: 'Silinemedi', description: result.error });
      return;
    }
    await loadMedia();
  }

  async function updateItem(updated: MediaItem) {
    setActiveItem(updated); // optimistic drawer state
    const result = await updateMediaAsset(updated.id, {
      fileName: updated.name,
      altText: updated.altText,
      caption: updated.caption,
    });
    if (!result.success) {
      push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error });
      return;
    }
    await loadMedia();
  }

  // Real upload path: trigger the hidden file input; the change handler streams
  // each selected file to Vercel Blob via the uploadMediaAsset server action.
  function uploadMedia() {
    fileInputRef.current?.click();
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;
    setUploading(true);
    let ok = 0;
    let failed = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadMediaAsset(fd);
      if (result.success) ok += 1;
      else {
        failed += 1;
        push({ tone: 'danger', title: `"${file.name}" yüklenemedi`, description: result.error });
      }
    }
    setUploading(false);
    if (ok) push({ tone: 'success', title: `${ok} dosya yüklendi` });
    await loadMedia();
  }

  function bulkOptimize() {
    // Optimization pipeline is not yet wired; reflect intent locally only.
    setMediaItems((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, optimizationStatus: 'optimized' } : m)));
    push({ tone: 'info', title: `${selected.size} dosya için optimizasyon sırası oluşturuldu` });
    setSelected(new Set());
  }

  const selectedUsedIn = Array.from(new Set(mediaItems.filter((m) => selected.has(m.id)).flatMap((m) => m.usedIn)));

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf,video/mp4,video/webm"
      multiple
      className="hidden"
      onChange={handleFiles}
    />
  );

  if (!loading && mediaItems.length === 0) {
    return (
      <ContentContainer>
        {hiddenFileInput}
        <PageHeader
          title="Medya Kütüphanesi"
          description="Görsel ve video varlıkları."
          actions={
            <Button icon={<Upload size={15} />} onClick={uploadMedia} disabled={uploading}>
              {uploading ? 'Yükleniyor…' : 'Medya Yükle'}
            </Button>
          }
        />
        <EmptyState icon={ImageIcon} title="Henüz medya yok" description="İlk görsel veya videonuzu yükleyerek başlayın." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      {hiddenFileInput}
      <PageHeader
        title="Medya Kütüphanesi"
        description="Görsel ve video varlıkları."
        actions={
          <>
            <Button variant="secondary" icon={<FolderPlus size={15} />} onClick={() => push({ tone: 'info', title: 'Klasör oluşturma açılıyor' })}>Klasör Oluştur</Button>
            <Button icon={<Upload size={15} />} onClick={uploadMedia} disabled={uploading}>{uploading ? 'Yükleniyor…' : 'Medya Yükle'}</Button>
          </>
        }
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} dosya</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Dosya ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-48">
          <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="all">Tüm Klasörler</option>
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </div>
      </Toolbar>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} dosya seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<Sparkles size={13} />} onClick={bulkOptimize}>Optimize Et</Button>
            <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => setBulkDeleteOpen(true)}>Sil</Button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-soft p-1.5 text-steel hover:bg-mist dark:text-white/40 dark:hover:bg-white/5" aria-label="Seçimi temizle">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 laptop:grid-cols-4">
        {filtered.map((item) => (
          <Card key={item.id} interactive className="overflow-hidden p-0" onClick={() => setActiveItem(item)}>
            <div className="relative flex aspect-[4/3] items-center justify-center" style={{ backgroundColor: item.swatch }}>
              <span onClick={(e) => e.stopPropagation()} className="absolute left-2 top-2 rounded-soft bg-near-black/40 p-0.5 backdrop-blur-sm">
                <Checkbox checked={selected.has(item.id)} onChange={() => toggleOne(item.id)} />
              </span>
              <span className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white/70 ${optimizationDot[item.optimizationStatus]}`} title="Optimizasyon durumu" />
              <div className="text-white/80">
                {item.type === 'video' ? <PlayCircle size={28} strokeWidth={1.4} /> : <ImageIcon size={28} strokeWidth={1.4} />}
              </div>
            </div>
            <div className="p-3">
              <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{item.name}</p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-steel dark:text-white/40">
                <span>{item.size}</span>
                <span>{item.updatedAt}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone={item.usageCount > 0 ? 'info' : 'neutral'}>{item.usageCount > 0 ? `${item.usageCount} kullanım` : 'Kullanılmıyor'}</Badge>
                {item.type === 'image' && !item.altText && (
                  <Badge tone="danger">
                    <AlertTriangle size={9} className="mr-0.5 inline" />
                    ALT Yok
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <MediaDrawer item={activeItem} onClose={() => setActiveItem(null)} onRequestDelete={setSingleDeleteTarget} onUpdate={updateItem} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} dosyayı sil`}
        description={<>Seçili {selected.size} medya dosyasını kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</>}
        consequences={selectedUsedIn.length > 0 ? selectedUsedIn.map((place) => `${place} bu görselsiz kalacak`) : undefined}
        confirmLabel="Dosyaları Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(singleDeleteTarget)}
        title="Dosyayı sil"
        description={singleDeleteTarget ? <>&quot;{singleDeleteTarget.name}&quot; dosyasını kalıcı olarak silmek üzeresiniz.</> : null}
        consequences={singleDeleteTarget && singleDeleteTarget.usedIn.length > 0 ? singleDeleteTarget.usedIn.map((place) => `${place} bu görselsiz kalacak`) : undefined}
        confirmLabel="Dosyayı Sil"
        onConfirm={confirmSingleDelete}
        onCancel={() => setSingleDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
