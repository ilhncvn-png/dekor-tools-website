'use client';

import { useEffect, useState } from 'react';
import { Pencil, Layers, History, Navigation as NavigationIcon, Tag, Link2, ImageIcon, CalendarClock } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CmsPage } from '@/lib/mock-data';
import { pageStatusTone } from '@/lib/status-tones';
import { useToast } from '@/components/ui/Toast';

function seoTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

interface PageDrawerProps {
  page: CmsPage | null;
  onClose: () => void;
}

/** Quick-view drawer for a single page — template, sections, SEO score, meta/nav status, revision history. */
export function PageDrawer({ page, onClose }: PageDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(page);
  useEffect(() => {
    if (page) setDisplay(page);
  }, [page]);

  if (!display) return null;

  const statusInfo = pageStatusTone[display.status];

  return (
    <Drawer
      open={Boolean(page)}
      onClose={onClose}
      title={display.title}
      description={display.path}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => window.open(`https://dekortools.com${display.path}`, '_blank', 'noopener,noreferrer')}
          >
            Sitede Görüntüle
          </Button>
          <Button
            icon={<Pencil size={14} />}
            className="flex-1"
            onClick={() => push({ tone: 'info', title: 'Website Yapısı\'na yönlendiriliyor', description: 'Sayfa bölümleri ilgili sayfa oluşturucudan düzenlenir.' })}
          >
            Düzenle
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        <Badge tone="neutral">{display.language}</Badge>
        <Badge tone={display.showInNavigation ? 'info' : 'neutral'}>
          <NavigationIcon size={10} className="mr-1 inline" />
          {display.showInNavigation ? 'Menüde' : 'Menüde Değil'}
        </Badge>
        <Badge tone={display.metaComplete ? 'success' : 'warning'}>
          <Tag size={10} className="mr-1 inline" />
          {display.metaComplete ? 'Meta Tam' : 'Meta Eksik'}
        </Badge>
      </div>

      <div className="mt-5">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
          <Link2 size={11} className="mr-1 inline" /> Slug
        </p>
        <Input defaultValue={display.slug} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Layers size={10} /> Şablon
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.template}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Bölüm Sayısı</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-near-black dark:text-white">{display.sectionCount}</p>
        </div>
      </div>

      <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <ImageIcon size={10} /> OpenGraph Görseli
        </p>
        <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.ogImage ?? 'Tanımlanmamış'}</p>
      </div>

      {display.scheduledAt && (
        <div className="mt-4 flex items-center gap-2 rounded-soft bg-info-soft px-3 py-2.5 text-[12.5px] text-info">
          <CalendarClock size={14} className="shrink-0" />
          Yayın planlandı: {display.scheduledAt}
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="font-medium text-near-black dark:text-white/85">SEO Skoru</span>
          <span className="tabular-nums text-steel dark:text-white/40">{display.seoScore}</span>
        </div>
        <ProgressBar value={display.seoScore} tone={seoTone(display.seoScore)} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="flex items-center gap-1 text-[12px] text-steel dark:text-white/50">
          <History size={12} /> Revizyon Geçmişi
        </p>
        <span className="tabular-nums text-[12px] font-medium text-near-black dark:text-white">{display.revisionCount} revizyon</span>
      </div>

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">
        {display.author} tarafından güncellendi · {display.updatedAt}
      </p>
    </Drawer>
  );
}
