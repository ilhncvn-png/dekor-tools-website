'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, ArrowRight, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { navigationMenu } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

/** Header configuration — logo, CTA, mega menu, top bar, announcement bar, language switcher, sticky behavior; nav items are cross-linked to Navigasyon Yönetimi. */
export default function HeaderYonetimiPage() {
  const { push } = useToast();
  const [sticky, setSticky] = useState(true);
  const [languageSwitcher, setLanguageSwitcher] = useState(true);
  const [ctaLabel, setCtaLabel] = useState('Bayi Ol');
  const [ctaHref, setCtaHref] = useState('/bayi-ol');
  const [megaMenu, setMegaMenu] = useState(true);
  const [topBar, setTopBar] = useState(true);
  const [topBarText, setTopBarText] = useState('60+ ülkeye ihracat · export@dekortools.com · +90 (262) 658 30 10');
  const [announcement, setAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState('2026 ürün kataloğumuz yayında — hemen indirin.');

  return (
    <ContentContainer>
      <PageHeader title="Header Yönetimi" description="Logo, ana menü ve header CTA yönetimi." />

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Üst Bant (Top Bar)</h2>
          <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
            <span className="text-body-sm text-near-black dark:text-white/85">Üst Bant Görünür</span>
            <Switch checked={topBar} onChange={setTopBar} label="Üst bant" />
          </div>
          {topBar && (
            <div className="mt-3">
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Üst Bant Metni</p>
              <Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} />
            </div>
          )}

          <h2 className="mb-4 mt-6 font-display text-heading-md text-near-black dark:text-white">Duyuru Bandı</h2>
          <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
            <span className="text-body-sm text-near-black dark:text-white/85">Duyuru Bandı Görünür</span>
            <Switch checked={announcement} onChange={setAnnouncement} label="Duyuru bandı" />
          </div>
          {announcement && (
            <div className="mt-3">
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Duyuru Metni</p>
              <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
            </div>
          )}

          <h2 className="mb-4 mt-6 font-display text-heading-md text-near-black dark:text-white">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-soft bg-near-black text-white">
              <span className="font-display text-heading-md">D</span>
            </div>
            <div>
              <Button variant="secondary" icon={<ImageIcon size={14} />} onClick={() => push({ tone: 'info', title: 'Medya Kütüphanesi açılıyor', description: 'Logo Medya Kütüphanesi\'nden seçilir.' })}>Logo Değiştir</Button>
              <p className="mt-1.5 text-[11px] text-steel dark:text-white/40">SVG önerilir, maksimum 200×80px</p>
            </div>
          </div>

          <h2 className="mb-4 mt-6 font-display text-heading-md text-near-black dark:text-white">Header CTA Butonu</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Buton Metni</p>
              <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
            </div>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Bağlantı</p>
              <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
              <span className="text-body-sm text-near-black dark:text-white/85">Sabit (Sticky) Header</span>
              <Switch checked={sticky} onChange={setSticky} label="Sabit header" />
            </div>
            <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
              <span className="text-body-sm text-near-black dark:text-white/85">Dil Değiştirici Görünür</span>
              <Switch checked={languageSwitcher} onChange={setLanguageSwitcher} label="Dil değiştirici" />
            </div>
            <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
              <span className="text-body-sm text-near-black dark:text-white/85">Mega Menü (Ürünler)</span>
              <Switch checked={megaMenu} onChange={setMegaMenu} label="Mega menü" />
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-border pt-4 dark:border-white/[.06]">
            <Button icon={<Save size={14} />} onClick={() => push({ tone: 'success', title: 'Header ayarları kaydedildi' })}>Değişiklikleri Kaydet</Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-heading-md text-near-black dark:text-white">Ana Menü Önizleme</h2>
            <Link href="/navigasyon-yonetimi" className="flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
              Menüyü Düzenle
              <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
            {navigationMenu.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5 first:pt-0">
                <span className="text-body-sm text-near-black dark:text-white/85">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  {item.children && <Badge tone="neutral">{item.children.length} alt öğe</Badge>}
                  {item.external && <Badge tone="info">Dış Bağlantı</Badge>}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">
            Bu önizleme salt okunurdur — menü öğelerini eklemek/kaldırmak için Navigasyon Yönetimi'ni kullanın.
          </p>
        </Card>
      </div>
    </ContentContainer>
  );
}
