'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Package, ListTodo, TrendingUp, Handshake, FileStack, Image as ImageIcon, Rocket,
  AlertOctagon, ArrowRight, Plus, Upload, LayoutTemplate, Newspaper, Eye, Search, Layers,
  Gauge, History, Database, HardDrive, MessageCircle, FolderTree, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ContentOverview } from '@/components/dashboard/ContentOverview';
import { quickActions, type ActivityItem, type ContentOverviewCard } from '@/lib/mock-data';
import { getDashboardStats, type DashboardStats } from '@/lib/actions/dashboard-actions';

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="block" className="h-[150px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 tablet:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="block" className="h-[120px]" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <Skeleton variant="block" className="h-[320px] laptop:col-span-2" />
        <Skeleton variant="block" className="h-[320px]" />
      </div>
    </>
  );
}

// Human-readable Turkish label for an audit action + entity type.
function describeAudit(action: string, entityType: string): { verb: string; target: string } {
  const verbs: Record<string, string> = {
    create: 'oluşturdu', update: 'güncelledi', publish: 'yayınladı', unpublish: 'yayından kaldırdı',
    archive: 'arşivledi', delete: 'sildi', upload: 'yükledi', restore: 'geri yükledi',
  };
  const entities: Record<string, string> = {
    product: 'ürün', product_category: 'kategori', banner: 'banner', media_asset: 'medya',
    news_article: 'haber', dealer: 'bayi', page: 'sayfa', user: 'kullanıcı',
  };
  const short = action.split('.').pop() ?? action;
  return { verb: verbs[short] ?? short, target: entities[entityType] ?? entityType };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  return `${Math.floor(hr / 24)} gün önce`;
}

const auditHref: Record<string, string> = {
  product: '/urun-yonetimi', product_category: '/kategori-yonetimi', banner: '/genel-bilesenler',
  media_asset: '/medya-kutuphanesi', news_article: '/haberler', dealer: '/bayi-yonetimi',
  page: '/sayfa-yonetimi', user: '/kullanicilar',
};

export default function GenelBakisPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  // Real activity feed mapped from the production audit log.
  const activityItems: ActivityItem[] = useMemo(() => {
    if (!stats) return [];
    return stats.recentActivity.map((a) => {
      const { verb, target } = describeAudit(a.action, a.entityType);
      return {
        id: a.id,
        actor: a.actorName ?? 'Sistem',
        action: verb,
        target,
        time: relativeTime(a.at),
        module: target,
        status: a.action.includes('delete') ? 'warning' : 'success',
        href: auditHref[a.entityType] ?? '/genel-bakis',
      } as ActivityItem;
    });
  }, [stats]);

  const derived = useMemo(() => {
    if (!stats) return null;
    const totalContent = stats.products.total + stats.news.total + stats.pages.total + stats.categories.total;
    const publishedContent = stats.products.published + stats.news.published + stats.pages.published;
    const pendingTasks = stats.dealers.pending + stats.news.draft + stats.pages.draft + stats.scheduled.pending;
    const criticalCount = stats.publishing.inReview;
    const draftCount = stats.publishing.draft;
    const publishedRatio = totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 100;
    const seoCoverage = totalContent > 0 ? Math.round((stats.seo.metadataRows / totalContent) * 100) : 0;
    const mediaGB = stats.media.totalBytes / (1024 * 1024 * 1024);
    return { totalContent, publishedContent, pendingTasks, criticalCount, draftCount, publishedRatio, seoCoverage, mediaGB };
  }, [stats]);

  if (!stats || !derived) {
    return (
      <ContentContainer>
        <PageHeader title="Genel Bakış" description="Web sitenizin durumu ve bugün yapılacaklar." />
        <DashboardSkeleton />
      </ContentContainer>
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  })();

  const health = stats.websiteHealth;
  const grade = health >= 90 ? 'A+' : health >= 80 ? 'A' : health >= 70 ? 'B' : health >= 60 ? 'C' : 'D';

  // Six real CMS-health tiles (replacing the former Lighthouse-style fixtures
  // that had no data source) — every number is a real production metric.
  const intelligenceMetrics = [
    { label: 'İçerik Sağlığı', score: health, icon: FileStack, href: '/website-sagligi' },
    { label: 'Yayın Oranı', score: derived.publishedRatio, icon: Rocket, href: '/yayin-merkezi' },
    { label: 'SEO Kapsamı', score: derived.seoCoverage, icon: Search, href: '/seo-yonetimi' },
    { label: 'Medya', score: Math.min(stats.media.total, 100), icon: ImageIcon, href: '/medya-kutuphanesi', raw: stats.media.total },
    { label: 'Revizyon', score: Math.min(stats.revisions.total, 100), icon: History, href: '/operasyon-merkezi', raw: stats.revisions.total },
    { label: 'Denetim', score: Math.min(stats.revisions.last7Days, 100), icon: ShieldCheck, href: '/operasyon-merkezi', raw: stats.revisions.last7Days },
  ];

  // Today's operations — real counts, hidden when zero.
  const todaysOperations = [
    { label: 'Bayi Başvurusu', count: stats.dealers.pending, icon: Handshake, tone: 'warning' as const, href: '/bayi-yonetimi' },
    { label: 'Taslak Haber', count: stats.news.draft, icon: Newspaper, tone: 'neutral' as const, href: '/haberler' },
    { label: 'Taslak Ürün', count: stats.products.draft, icon: Package, tone: 'neutral' as const, href: '/urun-yonetimi' },
    { label: 'İncelemede İçerik', count: stats.publishing.inReview, icon: AlertOctagon, tone: 'danger' as const, href: '/yayin-merkezi' },
    { label: 'Zamanlanmış Yayın', count: stats.scheduled.pending, icon: History, tone: 'warning' as const, href: '/operasyon-merkezi' },
    { label: 'Taslak Sayfa', count: stats.pages.draft, icon: LayoutTemplate, tone: 'neutral' as const, href: '/sayfa-yonetimi' },
  ].filter((op) => op.count > 0);

  // Real publishing pipeline (aggregate across every content type).
  const pipeline = [
    { label: 'Taslak', count: stats.publishing.draft, tone: 'text-steel dark:text-white/50' },
    { label: 'İncelemede', count: stats.publishing.inReview, tone: 'text-info' },
    { label: 'Yayında', count: stats.publishing.published, tone: 'text-success' },
    { label: 'Arşiv', count: stats.publishing.archived, tone: 'text-warning' },
  ];

  // Real content overview cards — live counts, no fixtures.
  const contentCards: ContentOverviewCard[] = [
    { id: 'co-products', label: 'Ürünler', value: stats.products.total, trend: `${stats.products.published} yayında`, lastUpdate: '', href: '/urun-yonetimi', sparkline: [] },
    { id: 'co-categories', label: 'Kategoriler', value: stats.categories.total, trend: `${stats.categories.visible} görünür`, lastUpdate: '', href: '/kategori-yonetimi', sparkline: [] },
    { id: 'co-media', label: 'Medya', value: stats.media.total, trend: `${stats.media.images} görsel · ${stats.media.videos} video`, lastUpdate: '', href: '/medya-kutuphanesi', sparkline: [] },
    { id: 'co-banners', label: 'Bileşenler', value: stats.banners.total, trend: `${stats.banners.active} aktif`, lastUpdate: '', href: '/genel-bilesenler', sparkline: [] },
    { id: 'co-news', label: 'Haberler', value: stats.news.total, trend: `${stats.news.published} yayında`, lastUpdate: '', href: '/haberler', sparkline: [] },
    { id: 'co-dealers', label: 'Bayiler', value: stats.dealers.total, trend: `${stats.dealers.approved} onaylı`, lastUpdate: '', href: '/bayi-yonetimi', sparkline: [] },
    { id: 'co-pages', label: 'Sayfalar', value: stats.pages.total, trend: `${stats.pages.published} yayında`, lastUpdate: '', href: '/sayfa-yonetimi', sparkline: [] },
    { id: 'co-revisions', label: 'Revizyonlar', value: stats.revisions.total, trend: `${stats.revisions.last7Days} son 7 gün`, lastUpdate: '', href: '/operasyon-merkezi', sparkline: [] },
  ];

  // Real system status.
  const systemStatus = [
    { label: 'Veritabanı', ok: stats.system.database === 'operational', detail: 'Neon PostgreSQL', icon: Database },
    { label: 'Blob Depolama', ok: stats.system.blob === 'connected', detail: stats.system.blob === 'connected' ? 'Bağlı' : 'Yapılandırılmamış', icon: HardDrive },
    { label: 'Kullanıcılar', ok: true, detail: `${stats.users.active} aktif`, icon: ShieldCheck },
    { label: 'Yönlendirmeler', ok: true, detail: `${stats.redirects.total} kayıt`, icon: FolderTree },
  ];

  const lastLogin = stats.currentUser.lastLogin ? relativeTime(stats.currentUser.lastLogin) : 'ilk giriş';
  const greetingName = stats.currentUser.name.split(' ')[0];

  return (
    <ContentContainer>
      <PageHeader title="Genel Bakış" description="Web sitenizin durumu ve bugün yapılacaklar." />

      {/* Command hero — the one card that answers "is the website OK right now?" at a glance */}
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 p-6 tablet:p-8"
        style={{ background: 'radial-gradient(120% 140% at 8% 0%, #1d2126 0%, #121417 45%, #0a0b0c 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative flex flex-col gap-6 laptop:flex-row laptop:items-center laptop:justify-between">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 font-display text-heading-lg font-bold tabular-nums text-white',
                health >= 85 ? 'border-success/60' : health >= 60 ? 'border-warning/60' : 'border-danger/60'
              )}
            >
              %{health}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">Website Durumu</p>
              <p className="mt-1 font-display text-heading-lg font-bold text-white">
                {derived.criticalCount === 0 ? 'Site sağlıklı ve yayında.' : 'Dikkat gereken içerik var.'}
              </p>
              <p className="mt-1.5 text-[13px] text-white/50">{greeting}, {greetingName} — son giriş {lastLogin}.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 tablet:gap-4">
            <button type="button" onClick={() => router.push('/yayin-merkezi')} className="group flex flex-col items-start gap-1 rounded-soft border border-danger/25 bg-danger/[.08] px-4 py-3 text-left transition-colors hover:border-danger/50">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-danger"><AlertOctagon size={12} /> İncelemede</span>
              <span className="font-display text-heading-md font-bold text-white">{derived.criticalCount}</span>
            </button>
            <button type="button" onClick={() => router.push('/yayin-merkezi')} className="group flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-4 py-3 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-white/50"><Rocket size={12} /> Taslak</span>
              <span className="font-display text-heading-md font-bold text-white">{derived.draftCount}</span>
            </button>
            <button type="button" onClick={() => router.push('/operasyon-merkezi')} className="group flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-4 py-3 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-white/50"><ListTodo size={12} /> Bekleyen Görev</span>
              <span className="font-display text-heading-md font-bold text-white">{derived.pendingTasks}</span>
            </button>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-white/35">Hızlı İşlem</span>
          {[
            { label: 'Yeni Ürün', icon: Plus, href: '/urun-yonetimi' },
            { label: 'Medya Yükle', icon: Upload, href: '/medya-kutuphanesi' },
            { label: 'Ana Sayfayı Düzenle', icon: LayoutTemplate, href: '/ana-sayfa-olusturucu' },
            { label: 'Haber Yayınla', icon: Newspaper, href: '/haberler' },
            { label: 'Siteyi Önizle', icon: Eye, href: '/canli-website' },
          ].map((a) => (
            <button
              key={a.href + a.label}
              type="button"
              onClick={() => router.push(a.href)}
              className="flex items-center gap-1.5 rounded-full bg-white/[.06] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-red hover:text-white"
            >
              <a.icon size={12} /> {a.label}
            </button>
          ))}
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-white/35">Hızlı Erişim</span>
          {[
            { label: 'Website Sağlığı', href: '/website-sagligi' },
            { label: 'Operasyon Merkezi', href: '/operasyon-merkezi' },
            { label: 'Yayın Merkezi', href: '/yayin-merkezi' },
            { label: 'Website Explorer', href: '/website-explorer' },
          ].map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => router.push(a.href)}
              className="flex items-center gap-1 rounded-soft border border-white/10 bg-white/[.03] px-3 py-1.5 text-[12px] font-medium text-white/75 transition-colors hover:border-red/40 hover:text-white"
            >
              {a.label} <ArrowRight size={11} />
            </button>
          ))}
        </div>
      </div>

      {/* Bento KPI grid — asymmetric sizing so the most important number (Website Sağlığı) visually dominates */}
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4 laptop:grid-cols-6">
        <div className="col-span-2 tablet:col-span-2 laptop:col-span-2 laptop:row-span-2">
          <StatCard
            label="Website Sağlığı"
            value={`%${health}`}
            numericValue={health}
            formatValue={(n) => `%${Math.round(n)}`}
            icon={ShieldCheck}
            tone={health >= 85 ? 'success' : health >= 60 ? 'warning' : 'red'}
            onClick={() => router.push('/website-sagligi')}
          />
        </div>
        <div className="laptop:col-span-2">
          <StatCard
            label="SEO Kapsamı"
            value={`%${derived.seoCoverage}`}
            numericValue={derived.seoCoverage}
            formatValue={(n) => `%${Math.round(n)}`}
            icon={TrendingUp}
            tone={derived.seoCoverage >= 60 ? 'success' : 'neutral'}
            onClick={() => router.push('/seo-yonetimi')}
          />
        </div>
        <div className="laptop:col-span-2">
          <StatCard
            label="Bekleyen Görevler"
            value={String(derived.pendingTasks)}
            numericValue={derived.pendingTasks}
            formatValue={(n) => Math.round(n).toLocaleString('tr-TR')}
            icon={ListTodo}
            tone={derived.pendingTasks > 5 ? 'warning' : 'neutral'}
            onClick={() => router.push('/yayin-merkezi')}
          />
        </div>
        <div className="col-span-2 tablet:col-span-2 laptop:col-span-4">
          <StatCard
            label="Yayındaki Ürünler"
            value={String(stats.products.published)}
            numericValue={stats.products.published}
            formatValue={(n) => Math.round(n).toLocaleString('tr-TR')}
            icon={Package}
            tone="neutral"
            onClick={() => router.push('/urun-yonetimi')}
          />
        </div>
      </div>

      {/* CMS Health Score — one overall grade plus 6 real metric tiles */}
      <div className="mt-4 rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-soft bg-red/10 font-display text-body-sm font-bold text-red dark:bg-red/15 dark:text-red-eyebrow">
              {grade}
            </div>
            <div>
              <p className="font-display text-heading-sm font-bold text-near-black dark:text-white">CMS Sağlık Skoru</p>
              <p className="text-[12px] text-steel dark:text-white/40">Genel skor: %{health}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-3 laptop:grid-cols-6">
          {intelligenceMetrics.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => router.push(m.href)}
              className="flex flex-col gap-1.5 rounded-soft border border-border p-3 text-left transition-colors hover:border-red/30 dark:border-white/[.06]"
            >
              <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40">
                <m.icon size={11} /> {m.label}
              </span>
              <span className={cn('font-display text-heading-sm font-bold', m.score >= 90 ? 'text-success' : m.score >= 70 ? 'text-warning' : 'text-near-black dark:text-white')}>
                {'raw' in m && m.raw !== undefined ? m.raw : `%${m.score}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Operations + Publishing Pipeline — the operational pulse of the day */}
      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-[1.3fr_1fr]">
        <div className="rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Bugünün İşlemleri</p>
          {todaysOperations.length === 0 ? (
            <p className="flex items-center gap-1.5 text-[12.5px] text-steel dark:text-white/50"><CheckCircle2 size={13} className="text-success" /> Bekleyen işlem yok — her şey güncel.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {todaysOperations.map((op) => (
                <li key={op.label}>
                  <Link href={op.href} className="flex items-center justify-between gap-2 rounded-soft px-2.5 py-2 text-[12.5px] transition-colors hover:bg-mist dark:hover:bg-white/[.04]">
                    <span className="flex items-center gap-2 text-near-black dark:text-white/85">
                      <op.icon size={13} className={op.tone === 'danger' ? 'text-danger' : op.tone === 'warning' ? 'text-warning' : 'text-steel dark:text-white/40'} />
                      {op.label}
                    </span>
                    <Badge tone={op.tone}>{op.count}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Yayın Akışı</p>
          <div className="flex items-stretch gap-1.5">
            {pipeline.map((s, i, arr) => (
              <div key={s.label} className="flex flex-1 items-center gap-1.5">
                <div className="flex-1 rounded-soft border border-border px-2 py-2.5 text-center dark:border-white/[.06]">
                  <p className={cn('font-display text-heading-sm font-bold', s.tone)}>{s.count}</p>
                  <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.03em] text-steel dark:text-white/35">{s.label}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight size={11} className="shrink-0 text-steel/30 dark:text-white/15" />}
              </div>
            ))}
          </div>
          <Link href="/yayin-merkezi" className="mt-3 flex items-center justify-center gap-1 text-[11.5px] font-medium text-red hover:underline dark:text-red-eyebrow">
            Yayın Merkezi&apos;ni Aç <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* System status — real infrastructure + CMS integrity */}
      <div className="mt-4 rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
        <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Sistem Durumu</p>
        <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
          {systemStatus.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-soft border border-border p-3 dark:border-white/[.06]">
              <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40">
                <s.icon size={11} /> {s.label}
              </span>
              <span className="flex items-center gap-1.5 font-display text-body-sm font-bold text-near-black dark:text-white">
                <span className={cn('h-2 w-2 rounded-full', s.ok ? 'bg-success' : 'bg-warning')} />
                {s.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — secondary KPIs, compact (real values) */}
      <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-4">
        <StatCard
          size="compact"
          label="Kategoriler"
          value={String(stats.categories.total)}
          icon={Layers}
          tone="ai"
          onClick={() => router.push('/kategori-yonetimi')}
        />
        <StatCard
          size="compact"
          label="Aktif Bayiler"
          value={String(stats.dealers.approved)}
          icon={Handshake}
          tone="info"
          onClick={() => router.push('/bayi-yonetimi')}
        />
        <StatCard
          size="compact"
          label="Yayındaki İçerik"
          value={String(derived.publishedContent)}
          icon={FileStack}
          tone="neutral"
          onClick={() => router.push('/sayfa-yonetimi')}
        />
        <StatCard
          size="compact"
          label="Medya Kütüphanesi"
          value={derived.mediaGB >= 0.1 ? `${derived.mediaGB.toFixed(1)} GB` : `${stats.media.total} dosya`}
          icon={ImageIcon}
          tone="orange"
          onClick={() => router.push('/medya-kutuphanesi')}
        />
      </div>

      {/* Content overview (real counts) + quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <div className="laptop:col-span-2">
          <ContentOverview cards={contentCards} />
        </div>
        <QuickActions actions={quickActions} />
      </div>

      {/* Recent activity — real production audit log */}
      <div className="mt-4">
        <ActivityFeed items={activityItems} limit={8} />
      </div>
    </ContentContainer>
  );
}
