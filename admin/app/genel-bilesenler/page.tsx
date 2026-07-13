'use client';

import { useMemo, useState } from 'react';
import { Plus, Component, Pencil, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { BannerDrawer } from '@/components/banners/BannerDrawer';
import { useToast } from '@/components/ui/Toast';
import { globalComponents, globalBanners as initialBanners, type GlobalComponent, type GlobalBanner } from '@/lib/mock-data';

const typeTone: Record<GlobalComponent['type'], 'danger' | 'info' | 'success' | 'ai'> = {
  'CTA Bloğu': 'danger',
  Banner: 'info',
  Form: 'success',
  Kart: 'ai',
};

/** Shared, reusable elements (CTA blocks, banners, forms, cards) referenced across many pages — one edit updates every usage. */
export default function GenelBilesenlerPage() {
  const { push } = useToast();
  const [type, setType] = useState('all');
  const [banners, setBanners] = useState<GlobalBanner[]>(initialBanners);
  const [activeBanner, setActiveBanner] = useState<GlobalBanner | null>(null);

  const filtered = useMemo(() => globalComponents.filter((c) => type === 'all' || c.type === type), [type]);

  function toggleActive(id: string) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  }

  function updateBanner(updated: GlobalBanner) {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setActiveBanner(updated);
  }

  function createBanner() {
    const newBanner: GlobalBanner = {
      id: `gb-${Date.now()}`,
      name: 'Yeni Banner',
      type: 'Banner',
      message: '',
      buttonLabel: 'Detaylar',
      buttonHref: '/',
      placements: [],
      active: false,
    };
    setBanners((prev) => [...prev, newBanner]);
    setActiveBanner(newBanner);
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Genel Bileşenler"
        description="Paylaşılan CTA, banner, form ve kart bileşenleri — bir düzenleme tüm kullanıldığı yerlere yansır."
        actions={<Button icon={<Plus size={15} />} onClick={createBanner}>Bileşen Oluştur</Button>}
      />

      <h2 className="mb-3 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
        <Megaphone size={17} /> Global Banner / CTA Yönetimi
      </h2>
      <Card className="mb-6 p-0">
        <ul className="divide-y divide-border dark:divide-white/[.06]">
          {banners.map((banner) => (
            <li key={banner.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{banner.name}</p>
                  <Badge tone={banner.type === 'CTA' ? 'danger' : 'info'}>{banner.type}</Badge>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-steel dark:text-white/50">
                  &quot;{banner.message}&quot; — {banner.buttonLabel} → {banner.buttonHref}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {banner.placements.map((p) => (
                    <Badge key={p} tone="neutral">{p}</Badge>
                  ))}
                </div>
              </div>
              <Switch checked={banner.active} onChange={() => toggleActive(banner.id)} label={`${banner.name} aktif`} />
              <button type="button" onClick={() => setActiveBanner(banner)} className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Düzenle">
                <Pencil size={14} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 font-display text-heading-md text-near-black dark:text-white">Bileşen Kütüphanesi</h2>
      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} bileşen</span>}>
        <div className="w-48">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Tüm Türler</option>
            <option value="CTA Bloğu">CTA Bloğu</option>
            <option value="Banner">Banner</option>
            <option value="Form">Form</option>
            <option value="Kart">Kart</option>
          </Select>
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {filtered.map((component) => (
          <Card key={component.id} interactive className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-soft bg-ai-soft text-ai">
                <Component size={18} strokeWidth={1.8} />
              </div>
              <Badge tone={typeTone[component.type]}>{component.type}</Badge>
            </div>
            <h3 className="mt-3 font-display text-heading-sm text-near-black dark:text-white">{component.name}</h3>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px] text-steel dark:border-white/[.06] dark:text-white/40">
              <span>{component.usageCount} yerde kullanılıyor</span>
              <span>{component.updatedAt}</span>
            </div>
            <button
              type="button"
              onClick={() => push({ tone: 'info', title: `${component.name} düzenleniyor`, description: 'Bu bileşen türü Bölüm Oluşturucu üzerinden yönetilir.' })}
              className="mt-3 flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow"
            >
              <Pencil size={11} /> Düzenle
            </button>
          </Card>
        ))}
      </div>

      <BannerDrawer banner={activeBanner} onClose={() => setActiveBanner(null)} onUpdate={updateBanner} />
    </ContentContainer>
  );
}
