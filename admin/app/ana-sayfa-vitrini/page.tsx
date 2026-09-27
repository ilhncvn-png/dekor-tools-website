'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Star, UploadCloud, Info, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { ShowcaseRow } from '@/components/home-featured/ShowcaseRow';
import { ShowcasePicker } from '@/components/home-featured/ShowcasePicker';
import {
  getHomeFeatured,
  addHomeFeatured,
  removeHomeFeatured,
  reorderHomeFeatured,
  type HomeFeaturedData,
  type HomeFeaturedItem,
} from '@/lib/actions/home-featured-actions';
import { publishSiteProducts, getPublishStatus, type PublishStatus } from '@/lib/actions/publish-actions';

const EMPTY: HomeFeaturedData = { featured: [], candidates: [] };

function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function AnaSayfaVitriniPage() {
  const { push } = useToast();
  const [data, setData] = useState<HomeFeaturedData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<HomeFeaturedItem | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getHomeFeatured());
    } catch {
      push({ tone: 'danger', title: 'Vitrin yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const loadPublishStatus = useCallback(async () => {
    try {
      setPublishStatus(await getPublishStatus());
    } catch {
      /* status is best-effort; ignore */
    }
  }, []);

  useEffect(() => {
    load();
    loadPublishStatus();
  }, [load, loadPublishStatus]);

  const { featured, candidates } = data;
  const flaggedCount = featured.filter((f) => f.warnings.length > 0).length;
  const isBusy = busyId !== null;

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= featured.length) return;
    const previous = featured;
    const reordered = moveItem(featured, index, target);
    setData((d) => ({ ...d, featured: reordered }));
    setBusyId(featured[index].id);
    try {
      const res = await reorderHomeFeatured(reordered.map((f) => f.id));
      if (!res.success) {
        setData((d) => ({ ...d, featured: previous }));
        push({ tone: 'danger', title: 'Sıralama kaydedilemedi', description: res.error ?? 'Bilinmeyen hata.' });
        await load();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdd(item: HomeFeaturedItem) {
    setBusyId(item.id);
    try {
      const res = await addHomeFeatured(item.id);
      if (res.success) {
        push({ tone: 'success', title: 'Vitrine eklendi', description: `"${item.name}" listenin sonuna eklendi.` });
      } else {
        push({ tone: 'danger', title: 'Eklenemedi', description: res.error ?? 'Bilinmeyen hata.' });
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemoveConfirmed() {
    const item = removeTarget;
    if (!item) return;
    setBusyId(item.id);
    try {
      const res = await removeHomeFeatured(item.id);
      if (res.success) {
        push({ tone: 'success', title: 'Vitrinden çıkarıldı', description: `"${item.name}" artık öne çıkan ürün değil.` });
      } else {
        push({ tone: 'danger', title: 'Çıkarılamadı', description: res.error ?? 'Bilinmeyen hata.' });
      }
      await load();
    } finally {
      setBusyId(null);
      setRemoveTarget(null);
    }
  }

  async function handlePublishSite() {
    setPublishing(true);
    try {
      const res = await publishSiteProducts();
      if (res.success) {
        push({ tone: 'success', title: 'Siteye yayınlandı', description: `${res.count} yayınlı ürün · ${res.version}` });
        await loadPublishStatus();
      } else {
        push({ tone: 'danger', title: 'Yayınlama başarısız', description: res.error ?? 'Bilinmeyen hata.' });
      }
    } finally {
      setPublishing(false);
    }
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Ana Sayfa Vitrini"
        description="Ana sayfadaki “Öne Çıkan Ürünler” kaydırıcısında hangi ürünlerin hangi sırayla gösterileceğini yönetin."
        actions={
          <>
            <Button variant="secondary" icon={<UploadCloud size={15} />} onClick={handlePublishSite} disabled={publishing || isBusy}>
              {publishing ? 'Yayınlanıyor…' : 'Siteye Yayınla'}
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setPickerOpen((v) => !v)} aria-expanded={pickerOpen}>
              Ürün ekle
            </Button>
          </>
        }
      />

      <aside
        aria-label="Yayın notu"
        className="mb-6 flex gap-3 rounded-lg border border-info-border bg-info-soft px-4 py-3 text-[13px] text-near-black dark:text-white/80"
      >
        <Info size={16} className="mt-0.5 shrink-0 text-info" aria-hidden="true" />
        <div className="space-y-1">
          <p>
            Buradaki değişiklikler hemen kaydedilir, ancak web sitesinde ancak <strong>“Siteye Yayınla”</strong> (Ürünleri Yayınla) ile
            katalog yeniden yayınlandıktan sonra görünür. Vitrinde yalnızca <strong>yayında olan</strong> ürünler gösterilir.
          </p>
          <p className="text-[12px] text-steel dark:text-white/50">
            {publishStatus?.current
              ? `Canlı sürüm: ${publishStatus.current.version} · ${publishStatus.current.count} ürün`
              : 'Henüz yayınlanmış bir katalog anlık görüntüsü yok.'}
            {' · '}Ürün düzenleyicideki “Öne çıkan” anahtarı da bu listeyi değiştirir.{' '}
            <Link href="/urun-yonetimi" className="underline decoration-dotted underline-offset-2 hover:text-red">Ürünler</Link>
          </p>
        </div>
      </aside>

      {pickerOpen && (
        <ShowcasePicker candidates={candidates} busyId={busyId} onAdd={handleAdd} onClose={() => setPickerOpen(false)} />
      )}

      <section aria-labelledby="showcase-heading" className="rounded-lg border border-border bg-white shadow-elevation-flat dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-flat">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3.5 dark:border-white/10">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[1.6px] text-red">Öne Çıkan Ürünler</p>
            <h2 id="showcase-heading" className="font-display text-[17px] font-bold text-near-black dark:text-white">
              Vitrin sırası
            </h2>
          </div>
          <p className="text-[12px] text-steel dark:text-white/50">
            {featured.length} ürün
            {flaggedCount > 0 && <span className="ml-2 font-medium text-warning">· {flaggedCount} ürün uyarılı</span>}
          </p>
        </header>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-steel dark:text-white/40">
            <Loader2 className="animate-spin" aria-label="Yükleniyor" />
          </div>
        ) : featured.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Star} title="Vitrin boş" description="“Ürün ekle” ile ana sayfada öne çıkarılacak ürünleri seçin." />
          </div>
        ) : (
          <ol className="divide-y divide-border dark:divide-white/5">
            {featured.map((item, index) => (
              <ShowcaseRow
                key={item.id}
                item={item}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === featured.length - 1}
                disabled={isBusy || publishing}
                onMove={(direction) => handleMove(index, direction)}
                onRemove={() => setRemoveTarget(item)}
              />
            ))}
          </ol>
        )}
      </section>

      <ConfirmDialog
        open={removeTarget !== null}
        title="Vitrinden çıkarılsın mı?"
        description={`"${removeTarget?.name ?? ''}" ana sayfa vitrininden çıkarılacak ve “Öne çıkan” işareti kaldırılacak. Ürün silinmez.`}
        confirmLabel="Vitrinden çıkar"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setRemoveTarget(null)}
      />
    </ContentContainer>
  );
}
