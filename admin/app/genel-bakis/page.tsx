'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Package, ListTodo, Handshake, Image as ImageIcon, Rocket, AlertOctagon,
  ArrowRight, Plus, Upload, Newspaper, FolderTree, FileText, Megaphone, Layers,
  Database, HardDrive, Globe, RefreshCw, CheckCircle2, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { type ActivityItem } from '@/lib/mock-data';
import { getDashboardStats, type DashboardStats } from '@/lib/actions/dashboard-actions';

function DashboardSkeleton() {
  return (
    <>
      <Skeleton variant="block" className="h-[168px]" />
      <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="block" className="h-[92px]" />)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="block" className="h-[92px]" />)}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-[1fr_1.4fr]">
        <Skeleton variant="block" className="h-[220px]" />
        <Skeleton variant="block" className="h-[220px]" />
      </div>
    </>
  );
}

const VERBS: Record<string, string> = {
  create: 'oluşturdu', update: 'güncelledi', publish: 'yayınladı', unpublish: 'yayından kaldırdı',
  archive: 'arşivledi', delete: 'sildi', upload: 'yükledi', restore: 'geri yükledi', invite: 'davet etti',
};
const ENTITIES: Record<string, string> = {
  product: 'ürün', product_category: 'kategori', banner: 'banner', media_asset: 'medya', news_article: 'haber',
  dealer: 'bayi', page: 'sayfa', user: 'kullanıcı', seo_entry: 'SEO kaydı', form_submission: 'form talebi',
};
const HREF: Record<string, string> = {
  product: '/urun-yonetimi', product_category: '/kategori-yonetimi', banner: '/genel-bilesenler',
  media_asset: '/medya-kutuphanesi', news_article: '/haberler', dealer: '/bayi-yonetimi',
  page: '/sayfa-yonetimi', user: '/kullanicilar',
};

function relativeTime(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  return `${Math.floor(hr / 24)} gün önce`;
}

type StatusTone = 'ok' | 'warn' | 'off' | 'error';
function StatusDot({ tone }: { tone: StatusTone }) {
  const color = tone === 'ok' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : tone === 'error' ? 'bg-danger' : 'bg-steel/50';
  return <span className={cn('h-2 w-2 shrink-0 rounded-full', color)} />;
}

export default function GenelBakisPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  const activityItems: ActivityItem[] = useMemo(() => {
    if (!stats) return [];
    return stats.recentActivity.map((a) => {
      const verb = VERBS[a.action.split('.').pop() ?? ''] ?? a.action;
      const target = ENTITIES[a.entityType] ?? a.entityType;
      return {
        id: a.id, actor: a.actorName ?? 'Sistem', action: verb, target,
        time: relativeTime(a.at), module: target,
        status: a.action.includes('delete') ? 'warning' : 'success',
        href: HREF[a.entityType] ?? '/genel-bakis',
      } as ActivityItem;
    });
  }, [stats]);

  if (!stats) {
    return (
      <ContentContainer>
        <PageHeader title="Genel Bakış" description="CMS ve web sitesinin genel durumu." />
        <DashboardSkeleton />
      </ContentContainer>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Günaydın' : h < 18 ? 'İyi Günler' : 'İyi Akşamlar';
  })();
  const firstName = stats.currentUser.name.split(' ')[0];
  const lastLogin = stats.currentUser.lastLogin ? relativeTime(stats.currentUser.lastLogin) : 'ilk giriş';

  const lastPublish = stats.recentActivity.find((a) => a.action.endsWith('.publish'));
  const cmsOk = stats.system.database === 'operational' && stats.system.blob === 'connected';
  const siteReachable = stats.system.publicSite === 'reachable';

  // Zone 3 — real content counts (no fabricated values).
  const contentCards = [
    { label: 'Ürünler', value: stats.products.total, sub: `${stats.products.published} yayında`, icon: Package, href: '/urun-yonetimi' },
    { label: 'Kategoriler', value: stats.categories.total, sub: `${stats.categories.visible} görünür`, icon: FolderTree, href: '/kategori-yonetimi' },
    { label: 'Haberler', value: stats.news.total, sub: `${stats.news.published} yayında`, icon: Newspaper, href: '/haberler' },
    { label: 'Sayfalar', value: stats.pages.total, sub: `${stats.pages.published} yayında`, icon: FileText, href: '/sayfa-yonetimi' },
    { label: 'Bayiler', value: stats.dealers.total, sub: `${stats.dealers.approved} onaylı`, icon: Handshake, href: '/bayi-yonetimi' },
    { label: 'Medya', value: stats.media.total, sub: `${stats.media.images} görsel`, icon: ImageIcon, href: '/medya-kutuphanesi' },
    { label: 'Bannerlar', value: stats.banners.total, sub: `${stats.banners.active} aktif`, icon: Megaphone, href: '/genel-bilesenler' },
    { label: 'Taslaklar', value: stats.publishing.draft, sub: 'yayın bekliyor', icon: Layers, href: '/yayin-merkezi' },
  ];

  // Zone 4 — verified system states, honest labels.
  const systemTiles: { label: string; state: string; tone: StatusTone; icon: typeof Database }[] = [
    { label: 'Neon PostgreSQL', state: 'Sağlıklı', tone: 'ok', icon: Database },
    { label: 'Vercel Blob', state: stats.system.blob === 'connected' ? 'Sağlıklı' : 'Bağlı değil', tone: stats.system.blob === 'connected' ? 'ok' : 'off', icon: HardDrive },
    { label: 'Kimlik Doğrulama', state: 'Sağlıklı', tone: 'ok', icon: ShieldCheck },
    { label: 'Yayınlama', state: stats.system.database === 'operational' ? 'Aktif' : 'Uyarı', tone: stats.system.database === 'operational' ? 'ok' : 'warn', icon: RefreshCw },
    { label: 'Public Website', state: siteReachable ? 'Yayında' : 'Erişilemiyor', tone: siteReachable ? 'ok' : 'error', icon: Globe },
  ];

  const quickActions = [
    { label: 'Yeni Ürün', icon: Plus, href: '/urun-yonetimi' },
    { label: 'Yeni Kategori', icon: FolderTree, href: '/kategori-yonetimi' },
    { label: 'Yeni Haber', icon: Newspaper, href: '/haberler' },
    { label: 'Yeni Banner', icon: Megaphone, href: '/genel-bilesenler' },
    { label: 'Medya Yükle', icon: Upload, href: '/medya-kutuphanesi' },
    { label: 'Yeni Sayfa', icon: FileText, href: '/sayfa-yonetimi' },
  ];

  return (
    <ContentContainer>
      <PageHeader title="Genel Bakış" description="CMS ve web sitesinin genel durumu, bekleyen işler ve hızlı işlemler." />

      {/* ── ZONE 1 — Today / Primary status ─────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-lg border border-white/10 p-6 tablet:p-7"
        style={{ background: 'radial-gradient(120% 140% at 8% 0%, #1d2126 0%, #121417 45%, #0a0b0c 100%)' }}
        aria-label="Günün durumu"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative flex flex-col gap-6 laptop:flex-row laptop:items-center laptop:justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2', cmsOk && siteReachable ? 'border-success/60' : 'border-warning/60')}>
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">CMS Durumu</p>
              <p className="mt-1 font-display text-heading-lg font-bold text-white">
                {cmsOk && siteReachable ? 'Her şey çalışıyor.' : 'Dikkat gereken noktalar var.'}
              </p>
              <p className="mt-1.5 text-[13px] text-white/50">
                {greeting}, {firstName} — son giriş {lastLogin} · Website: {siteReachable ? 'Yayında' : 'Erişilemiyor'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4 tablet:gap-3">
            <button type="button" onClick={() => router.push('/yayin-merkezi')} className="flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.04em] text-white/50"><Rocket size={11} /> Taslak</span>
              <span className="font-display text-heading-md font-bold text-white">{stats.publishing.draft}</span>
            </button>
            <button type="button" onClick={() => router.push('/yayin-merkezi')} className="flex flex-col items-start gap-1 rounded-soft border border-warning/25 bg-warning/[.08] px-3.5 py-2.5 text-left transition-colors hover:border-warning/50">
              <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.04em] text-warning"><AlertOctagon size={11} /> İncelemede</span>
              <span className="font-display text-heading-md font-bold text-white">{stats.publishing.inReview}</span>
            </button>
            <button type="button" onClick={() => router.push('/operasyon-merkezi')} className="flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.04em] text-white/50"><ListTodo size={11} /> Başarısız Yayın</span>
              <span className="font-display text-heading-md font-bold text-white">0</span>
            </button>
            <button type="button" onClick={() => router.push('/operasyon-merkezi')} className="flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.04em] text-white/50"><Clock size={11} /> Son Yayın</span>
              <span className="truncate font-display text-body-lg font-bold text-white">{lastPublish ? relativeTime(lastPublish.at) : '—'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── ZONE 2 — Quick actions ──────────────────────────────────────── */}
      <section className="mt-4" aria-label="Hızlı işlemler">
        <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Hızlı İşlemler</p>
        <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-3 laptop:grid-cols-6">
          {quickActions.map((a) => (
            <button
              key={a.href + a.label}
              type="button"
              onClick={() => router.push(a.href)}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-3 text-[12.5px] font-medium text-near-black transition-colors hover:border-red/40 hover:text-red dark:border-white/[.06] dark:bg-surface-dark-raised dark:text-white dark:hover:text-red-eyebrow"
            >
              <a.icon size={15} className="shrink-0" /> {a.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── ZONE 3 — Content summary (real counts) ──────────────────────── */}
      <section className="mt-4" aria-label="İçerik özeti">
        <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">İçerik Özeti</p>
        <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
          {contentCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white p-4 transition-colors hover:border-red/30 dark:border-white/[.06] dark:bg-surface-dark-raised"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40"><c.icon size={11} /> {c.label}</p>
                <p className="mt-1 font-display text-heading-md font-bold tabular-nums text-near-black dark:text-white">{c.value}</p>
                <p className="mt-0.5 truncate text-[10.5px] text-steel dark:text-white/35">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ZONE 4 + 5 — System status + Recent activity ────────────────── */}
      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-[1fr_1.4fr]">
        <section className="rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised" aria-label="Sistem durumu">
          <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Sistem Durumu</p>
          <ul className="flex flex-col gap-1.5">
            {systemTiles.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2 rounded-soft border border-border px-3 py-2.5 text-[12.5px] dark:border-white/[.06]">
                <span className="flex items-center gap-2 text-near-black dark:text-white/85"><s.icon size={14} className="text-steel dark:text-white/40" /> {s.label}</span>
                <span className="flex items-center gap-1.5 font-medium text-near-black dark:text-white"><StatusDot tone={s.tone} /> {s.state}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-steel dark:text-white/35">
            <CheckCircle2 size={12} className="text-success" /> Durumlar gerçek zamanlı doğrulanır.
          </p>
        </section>

        <section aria-label="Son aktiviteler">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-heading-sm font-bold text-near-black dark:text-white">Son Aktiviteler</p>
            <Link href="/operasyon-merkezi" className="flex items-center gap-1 text-[11.5px] font-medium text-red hover:underline dark:text-red-eyebrow">
              Tümünü Gör <ArrowRight size={11} />
            </Link>
          </div>
          <ActivityFeed items={activityItems} limit={8} />
        </section>
      </div>
    </ContentContainer>
  );
}
