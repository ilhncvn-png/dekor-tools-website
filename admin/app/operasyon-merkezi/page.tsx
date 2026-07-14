'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Rocket, History, Clock, ShieldCheck, GitBranch, Package, Layers, Newspaper,
  FileText, Megaphone, Handshake, RefreshCw, CheckCircle2, XCircle, Image as ImageIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { getOperationsData, type OperationsData } from '@/lib/actions/operations-actions';

const ENTITY_LABEL: Record<string, string> = {
  product: 'Ürün', product_category: 'Kategori', banner: 'Banner', media_asset: 'Medya',
  news_article: 'Haber', dealer: 'Bayi', page: 'Sayfa', user: 'Kullanıcı',
};
const ENTITY_ICON: Record<string, typeof Package> = {
  product: Package, product_category: Layers, banner: Megaphone, media_asset: ImageIcon,
  news_article: Newspaper, dealer: Handshake, page: FileText, user: ShieldCheck,
};
const ENTITY_HREF: Record<string, string> = {
  product: '/urun-yonetimi', product_category: '/kategori-yonetimi', banner: '/genel-bilesenler',
  media_asset: '/medya-kutuphanesi', news_article: '/haberler', dealer: '/bayi-yonetimi',
  page: '/sayfa-yonetimi', user: '/kullanicilar',
};
const ACTION_LABEL: Record<string, string> = {
  CREATE: 'oluşturuldu', UPDATE: 'güncellendi', PUBLISH: 'yayınlandı', UNPUBLISH: 'yayından kaldırıldı',
  ARCHIVE: 'arşivlendi', DELETE: 'silindi', RESTORE: 'geri yüklendi',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  return `${Math.floor(hr / 24)} gün önce`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function OperasyonMerkeziPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setData(await getOperationsData());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ContentContainer>
      <PageHeader
        title="Operasyon Merkezi"
        description="Gerçek yayın işleri, revizyonlar, zamanlanmış görevler ve denetim günlüğü — canlı üretim verisi."
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-soft border border-border bg-white px-3 py-1.5 text-[12.5px] font-medium text-near-black transition-colors hover:border-red/40 disabled:opacity-50 dark:border-white/[.08] dark:bg-surface-dark-raised dark:text-white"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
        }
      />

      {loading && !data ? (
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="block" className="h-[90px]" />)}
        </div>
      ) : !data ? (
        <Card className="p-6"><p className="flex items-center gap-2 text-[13px] text-danger"><XCircle size={15} /> Veriler yüklenemedi.</p></Card>
      ) : (
        <>
          {/* Command ticker — real operations metrics */}
          <div className="flex items-stretch divide-x divide-border overflow-x-auto rounded-lg border border-border bg-white dark:divide-white/[.06] dark:border-white/[.06] dark:bg-surface-dark-raised">
            {[
              { label: 'Yayında', value: data.pipeline.published, sub: null, tone: 'success' as const },
              { label: 'Taslak', value: data.pipeline.draft, sub: null, tone: 'neutral' as const },
              { label: 'İncelemede', value: data.pipeline.inReview, sub: null, tone: data.pipeline.inReview > 0 ? 'warning' as const : 'neutral' as const },
              { label: 'Arşiv', value: data.pipeline.archived, sub: null, tone: 'neutral' as const },
              { label: 'Toplam Revizyon', value: data.counts.totalRevisions, sub: `${data.counts.revisions24h} son 24s`, tone: 'neutral' as const },
              { label: 'Bekleyen İş', value: data.counts.pendingJobs, sub: 'kuyruk', tone: data.counts.pendingJobs > 0 ? 'warning' as const : 'neutral' as const },
              { label: 'Denetim Olayı', value: data.counts.auditEvents, sub: `${data.counts.auditEvents24h} son 24s`, tone: 'neutral' as const },
            ].map((item) => (
              <div key={item.label} className="flex min-w-[150px] flex-1 flex-col gap-1 px-4 py-3">
                <span className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">{item.label}</span>
                <span className="flex items-baseline gap-1.5">
                  <span className={cn('font-display text-heading-sm font-bold tabular-nums', item.tone === 'warning' ? 'text-warning' : item.tone === 'success' ? 'text-success' : 'text-near-black dark:text-white')}>
                    {item.value}
                  </span>
                  {item.sub && <span className="truncate text-[10.5px] text-steel dark:text-white/35">{item.sub}</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-[1fr_1fr]">
            {/* Revision history */}
            <div className="flex flex-col rounded-lg border-t-2 border-info bg-white dark:bg-surface-dark-raised">
              <p className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-info dark:border-white/[.06]">
                <History size={13} /> Revizyon Geçmişi <Badge tone="neutral">{data.counts.totalRevisions}</Badge>
              </p>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                {data.revisions.length === 0 ? (
                  <p className="text-[12px] text-steel dark:text-white/40">Henüz revizyon yok.</p>
                ) : (
                  data.revisions.slice(0, 12).map((r) => {
                    const Icon = ENTITY_ICON[r.entityType] ?? GitBranch;
                    return (
                      <Link key={r.id} href={ENTITY_HREF[r.entityType] ?? '/genel-bakis'} className="flex items-start gap-2 rounded-soft border border-border px-2.5 py-2 text-[11.5px] transition-colors hover:border-info/40 dark:border-white/[.06]">
                        <Icon size={12} className="mt-0.5 shrink-0 text-steel dark:text-white/40" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-near-black dark:text-white/80">
                            {ENTITY_LABEL[r.entityType] ?? r.entityType} {ACTION_LABEL[r.action] ?? r.action.toLowerCase()}
                          </span>
                          <span className="mt-0.5 block font-mono text-[10.5px] text-steel dark:text-white/35">{r.author ?? 'Sistem'} · {relativeTime(r.at)}</span>
                        </span>
                        <Badge tone={r.action === 'PUBLISH' ? 'success' : r.action === 'DELETE' ? 'danger' : 'neutral'}>{ACTION_LABEL[r.action] ?? r.action}</Badge>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Publishing queue (scheduled jobs) */}
            <div className="flex flex-col rounded-lg border-t-2 border-warning bg-white dark:bg-surface-dark-raised">
              <p className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-warning dark:border-white/[.06]">
                <Clock size={13} /> Yayın Kuyruğu <Badge tone="warning">{data.counts.pendingJobs}</Badge>
              </p>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                {data.jobs.length === 0 ? (
                  <p className="flex items-center gap-1.5 text-[12px] text-steel dark:text-white/40"><CheckCircle2 size={13} className="text-success" /> Zamanlanmış iş yok.</p>
                ) : (
                  data.jobs.slice(0, 12).map((j) => {
                    const Icon = ENTITY_ICON[j.entityType] ?? Rocket;
                    return (
                      <div key={j.id} className="flex items-start gap-2 rounded-soft border border-border px-2.5 py-2 text-[11.5px] dark:border-white/[.06]">
                        <Icon size={12} className="mt-0.5 shrink-0 text-steel dark:text-white/40" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-near-black dark:text-white/80">{ENTITY_LABEL[j.entityType] ?? j.entityType}</span>
                          <span className="mt-0.5 block font-mono text-[10.5px] text-steel dark:text-white/35">{formatDateTime(j.scheduledFor)}</span>
                        </span>
                        <Badge tone={j.status === 'PENDING' ? 'warning' : j.status === 'EXECUTED' ? 'success' : j.status === 'FAILED' ? 'danger' : 'neutral'}>{j.status}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div className="mt-4 rounded-lg border border-border bg-white dark:border-white/[.06] dark:bg-surface-dark-raised">
            <p className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-steel dark:border-white/[.06] dark:text-white/50">
              <ShieldCheck size={13} /> Denetim Günlüğü <Badge tone="neutral">{data.counts.auditEvents}</Badge>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-left text-steel dark:border-white/[.06] dark:text-white/40">
                    <th className="px-4 py-2 font-medium">İşlem</th>
                    <th className="px-2 py-2 font-medium">Varlık</th>
                    <th className="px-2 py-2 font-medium">Kullanıcı</th>
                    <th className="px-2 py-2 font-medium">IP</th>
                    <th className="px-4 py-2 font-medium">Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {data.audit.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-4 text-center text-steel dark:text-white/40">Henüz denetim kaydı yok.</td></tr>
                  ) : (
                    data.audit.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 dark:border-white/[.04]">
                        <td className="px-4 py-2 font-mono text-near-black dark:text-white/85">{a.action}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{a.entityType ? (ENTITY_LABEL[a.entityType] ?? a.entityType) : '—'}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{a.actor ?? 'Sistem'}</td>
                        <td className="px-2 py-2 font-mono text-steel dark:text-white/35">{a.ip ?? '—'}</td>
                        <td className="px-4 py-2 text-steel dark:text-white/50">{relativeTime(a.at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ContentContainer>
  );
}
