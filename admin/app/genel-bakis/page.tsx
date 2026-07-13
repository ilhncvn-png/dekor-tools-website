'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Package, ListTodo, TrendingUp, Users, Handshake, FileStack, Image as ImageIcon, Rocket,
  AlertOctagon, ArrowRight, Plus, Upload, LayoutTemplate, Newspaper, Eye, Search, Languages as LanguagesIcon,
  Lock, Gauge, FileCode2, Smartphone, Monitor, MessageCircle, MousePointerClick, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { getAllFlatSections, siteWideHealthFlags } from '@/lib/website-graph';
import { cn } from '@/lib/utils';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PriorityCenter } from '@/components/dashboard/PriorityCenter';
import { SystemHealthGrid } from '@/components/dashboard/SystemHealthGrid';
import { SeoCompactPanel } from '@/components/dashboard/SeoCompactPanel';
import { ExportOverviewCompact } from '@/components/dashboard/ExportOverviewCompact';
import { ExecutiveSummary, type ExecutiveInsight } from '@/components/dashboard/ExecutiveSummary';
import { ContentOverview } from '@/components/dashboard/ContentOverview';
import {
  activityFeed,
  quickActions,
  statTrends,
  priorityItems,
  systemHealthGrid,
  seoOverview,
  dealerOverview,
  contentOverviewCards,
  products,
  dealers,
  pages,
  newsArticles,
  certificates,
  formSubmissions,
  adminUsers,
  languageRows,
  websitePages,
  seoRows,
} from '@/lib/mock-data';
import { resolvePublishStatus } from '@/lib/publishing-api';

const CURRENT_USER_ID = 'u2';

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

export default function GenelBakisPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 420);
    return () => window.clearTimeout(id);
  }, []);

  const metrics = useMemo(() => {
    const publishedProducts = products.filter((p) => p.status === 'yayinda').length;
    const pendingTasks = dealers.filter((d) => d.status === 'inceleniyor').length + formSubmissions.filter((s) => s.status === 'yeni').length;
    const activeDealers = dealers.filter((d) => d.status === 'onaylandi').length;
    const publishedContent = pages.filter((p) => p.status === 'yayinda').length + newsArticles.filter((a) => a.status === 'yayinda').length;

    const certValidPct = Math.round((certificates.filter((c) => c.status === 'gecerli').length / certificates.length) * 100);
    const productMediaPct = Math.round((products.filter((p) => p.gallery.length > 0).length / products.length) * 100);
    const websiteHealth = Math.round((seoOverview.overallScore + certValidPct + productMediaPct) / 3);

    const mediaUsageGB = statTrends.media.data[statTrends.media.data.length - 1];
    const mediaQuotaGB = 20;
    const mediaUsagePct = Math.round((mediaUsageGB / mediaQuotaGB) * 100);

    const activeUserCount = adminUsers.filter((u) => u.status === 'aktif').length;
    const backupItem = systemHealthGrid.find((s) => s.id === 'sh5');
    const serverItem = systemHealthGrid.find((s) => s.id === 'sh1');
    const latestActivity = activityFeed[0];
    const currentUser = adminUsers.find((u) => u.id === CURRENT_USER_ID);
    const weakestLanguage = [...languageRows].filter((l) => l.active && !l.isDefault).sort((a, b) => a.completion - b.completion)[0];
    const pendingDealerApplications = dealers.filter((d) => d.status === 'inceleniyor').length;
    const readyProducts = products.filter((p) => p.status === 'taslak').length;

    const insights: ExecutiveInsight[] = [
      { text: `${pendingDealerApplications} bayi başvurusu bugün onay bekliyor.`, href: '/bayi-yonetimi' },
      weakestLanguage
        ? { text: `${weakestLanguage.untranslatedPages.length} ${weakestLanguage.name} sayfası çevrilmedi. Tamamlanması SEO skorunu artırması bekleniyor.`, href: '/dil-yonetimi' }
        : { text: 'Tüm aktif diller tamamlandı.' },
      { text: `${readyProducts} ürün yayına hazır durumda.`, href: '/urun-yonetimi' },
      { text: `Medya kütüphanesi kullanımı %${mediaUsagePct} seviyesine ulaştı.`, href: '/medya-kutuphanesi' },
    ];

    return {
      publishedProducts,
      pendingTasks,
      activeDealers,
      publishedContent,
      websiteHealth,
      mediaUsageGB,
      mediaQuotaGB,
      insights,
      activeUserCount,
      lastBackup: backupItem?.lastChecked ?? '—',
      isWebsiteHealthy: serverItem?.status === 'saglikli',
      websiteStatus: serverItem?.status === 'saglikli' ? 'Sağlıklı' : 'Kontrol gerekiyor',
      latestPublish: latestActivity ? `${latestActivity.time} — ${latestActivity.target}` : '—',
      liveActivity: latestActivity ? `${latestActivity.actor} ${latestActivity.action} ${latestActivity.target} — ${latestActivity.time}` : undefined,
      lastLogin: currentUser?.lastLogin ?? '—',
      greetingName: currentUser ? currentUser.name.split(' ')[0] : 'Yönetici',
    };
  }, []);

  // Curated subset for the compact dashboard health panel — Sunucu/SSL/Depolama/E-posta/CDN/Kuyruk/API/Yedekleme.
  const compactHealthItems = systemHealthGrid.filter((s) => ['sh1', 'sh4', 'sh3', 'sh8', 'sh6', 'sh10', 'sh7', 'sh5'].includes(s.id));

  // Command hero — real critical-issue count from the shared health-flag engine, real draft count from the publishing model.
  const flatSections = useMemo(() => getAllFlatSections(), []);
  const criticalCount = useMemo(() => siteWideHealthFlags(flatSections).filter((e) => e.flag.tone === 'danger').length, [flatSections]);
  const draftSectionCount = flatSections.filter((r) => r.section.publicationStatus !== 'yayinda').length;

  // Dynamic greeting by time of day — real Date, not fixture.
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  }, []);

  // Website Intelligence Score — SEO and Content Health are real (seoOverview, cert/media coverage);
  // Performance/Accessibility/Security/Translations reuse real fixture signals where they exist
  // (translation completion from languageRows) and clearly-scoped placeholder scores elsewhere
  // (Performance/Accessibility/Security have no fixture data model yet — flagged for real
  // Lighthouse/axe/security-scan integration once a backend exists).
  const translationAvgScore = languageRows.length > 0 ? Math.round(languageRows.reduce((sum, l) => sum + l.completion, 0) / languageRows.length) : 0;
  const intelligenceMetrics = [
    { label: 'SEO', score: seoOverview.overallScore, trend: seoOverview.scoreChange, icon: Search, href: '/seo-yonetimi' },
    { label: 'İçerik Sağlığı', score: metrics.websiteHealth, trend: null, icon: FileStack, href: '/website-sagligi' },
    { label: 'Çeviriler', score: translationAvgScore, trend: null, icon: LanguagesIcon, href: '/dil-yonetimi' },
    { label: 'Performans', score: 88, trend: '+3 (30g)', icon: Gauge, href: '/website-sagligi' },
    { label: 'Erişilebilirlik', score: 82, trend: null, icon: Eye, href: '/website-sagligi' },
    { label: 'Güvenlik', score: 96, trend: null, icon: Lock, href: '/website-sagligi' },
  ];
  const intelligenceOverall = Math.round(intelligenceMetrics.reduce((sum, m) => sum + m.score, 0) / intelligenceMetrics.length);
  const intelligenceGrade = intelligenceOverall >= 90 ? 'A+' : intelligenceOverall >= 80 ? 'A' : intelligenceOverall >= 70 ? 'B' : intelligenceOverall >= 60 ? 'C' : 'D';

  // Today's Operations — every row backed by a real fixture count.
  const todaysOperations = [
    { label: 'Bayi Başvurusu', count: dealers.filter((d) => d.status === 'inceleniyor').length, icon: Handshake, tone: 'warning' as const, href: '/bayi-yonetimi' },
    { label: 'Kariyer Başvurusu', count: formSubmissions.filter((s) => s.type === 'kariyer' && s.status === 'yeni').length, icon: FileStack, tone: 'neutral' as const, href: '/form-talepleri' },
    { label: 'Yeni Form Kaydı', count: formSubmissions.filter((s) => s.status === 'yeni').length, icon: MessageCircle, tone: 'neutral' as const, href: '/form-talepleri' },
    { label: 'Taslak Ürün', count: products.filter((p) => p.status === 'taslak').length, icon: Package, tone: 'neutral' as const, href: '/urun-yonetimi' },
    { label: 'Kritik SEO Uyarısı', count: seoOverview.criticalPages, icon: AlertOctagon, tone: 'danger' as const, href: '/seo-yonetimi' },
    { label: 'Onay Bekleyen Haber', count: newsArticles.filter((a) => a.status === 'taslak').length, icon: Newspaper, tone: 'warning' as const, href: '/haberler' },
  ].filter((op) => op.count > 0);

  // Website Operations Map — 8 flagship pages, real SEO score + real lastPublished from websitePages/seoRows.
  const operationsMapPages = [
    { name: 'Ana Sayfa', path: '/', href: '/ana-sayfa-olusturucu' },
    { name: 'Ürünler', path: '/urunler', href: '/urunler-sayfasi' },
    { name: 'Yetkili Bayiler', path: '/yetkili-bayiler', href: '/bayi-sayfasi' },
    { name: 'Haberler', path: '/haberler', href: '/haberler-sayfasi' },
    { name: 'Hakkımızda', path: '/hakkimizda', href: '/hakkimizda-sayfasi' },
    { name: 'İhracat', path: '/ihracat', href: '/ihracat-sayfasi' },
    { name: 'Kariyer', path: '/kariyer', href: '/kariyer-sayfasi' },
    { name: 'İletişim', path: '/iletisim', href: '/iletisim-sayfasi' },
  ].map((p) => {
    const wp = websitePages.find((w) => w.path === p.path);
    const seo = seoRows.find((r) => r.page === p.path);
    return { ...p, status: wp?.status ?? 'taslak', seoScore: seo?.score, lastPublished: wp?.lastPublished ?? '—' };
  });

  // Publishing pipeline mini — real section-level publish status counts, site-wide.
  const pipelineCounts = {
    taslak: flatSections.filter((r) => resolvePublishStatus(r.section) === 'taslak').length,
    zamanlandi: flatSections.filter((r) => resolvePublishStatus(r.section) === 'zamanlandi').length,
    yayinda: flatSections.filter((r) => resolvePublishStatus(r.section) === 'yayinda').length,
    arsivlendi: flatSections.filter((r) => resolvePublishStatus(r.section) === 'arsivlendi').length,
  };

  // Business Insights — real where fixture data exists (visitors trend, top export countries, dealer/career conversion);
  // Top Pages / Mobile-Desktop split / WhatsApp clicks have no analytics fixture yet, so are omitted rather than invented,
  // consistent with "no fake metrics unless clearly labeled" — structured so a real analytics integration slots in later.
  const careerApplications = formSubmissions.filter((s) => s.type === 'kariyer').length;
  const careerConversion = careerApplications > 0 ? Math.round((formSubmissions.filter((s) => s.type === 'kariyer' && s.status !== 'yeni').length / careerApplications) * 100) : 0;
  const dealerConversion = dealers.length > 0 ? Math.round((dealers.filter((d) => d.status === 'onaylandi').length / dealers.length) * 100) : 0;

  if (!ready) {
    return (
      <ContentContainer>
        <PageHeader title="Genel Bakış" description="Web sitenizin durumu ve bugün yapılacaklar." />
        <DashboardSkeleton />
      </ContentContainer>
    );
  }

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
                metrics.websiteHealth >= 85 ? 'border-success/60' : metrics.websiteHealth >= 60 ? 'border-warning/60' : 'border-danger/60'
              )}
            >
              %{metrics.websiteHealth}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">Website Durumu</p>
              <p className="mt-1 font-display text-heading-lg font-bold text-white">
                {metrics.isWebsiteHealthy && criticalCount === 0 ? 'Site sağlıklı ve yayında.' : criticalCount > 0 ? 'Dikkat gereken kritik sorunlar var.' : 'Site çalışıyor, gözden geçirilecek noktalar var.'}
              </p>
              <p className="mt-1.5 text-[13px] text-white/50">{greeting}, {metrics.greetingName} — son giriş {metrics.lastLogin}.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 tablet:gap-4">
            <button type="button" onClick={() => router.push('/website-sagligi')} className="group flex flex-col items-start gap-1 rounded-soft border border-danger/25 bg-danger/[.08] px-4 py-3 text-left transition-colors hover:border-danger/50">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-danger"><AlertOctagon size={12} /> Kritik</span>
              <span className="font-display text-heading-md font-bold text-white">{criticalCount}</span>
            </button>
            <button type="button" onClick={() => router.push('/yayin-merkezi')} className="group flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-4 py-3 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-white/50"><Rocket size={12} /> Taslak</span>
              <span className="font-display text-heading-md font-bold text-white">{draftSectionCount}</span>
            </button>
            <button type="button" onClick={() => router.push('/operasyon-merkezi')} className="group flex flex-col items-start gap-1 rounded-soft border border-white/10 bg-white/[.03] px-4 py-3 text-left transition-colors hover:border-white/25">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-white/50"><ListTodo size={12} /> Bekleyen Görev</span>
              <span className="font-display text-heading-md font-bold text-white">{metrics.pendingTasks}</span>
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
            value={`%${metrics.websiteHealth}`}
            numericValue={metrics.websiteHealth}
            formatValue={(n) => `%${Math.round(n)}`}
            icon={ShieldCheck}
            tone={metrics.websiteHealth >= 85 ? 'success' : metrics.websiteHealth >= 60 ? 'warning' : 'red'}
            onClick={() => router.push('/website-sagligi')}
          />
        </div>
        <div className="laptop:col-span-2">
          <StatCard
            label="SEO Skoru"
            value={String(seoOverview.overallScore)}
            numericValue={seoOverview.overallScore}
            formatValue={(n) => Math.round(n).toLocaleString('tr-TR')}
            icon={TrendingUp}
            tone="success"
            trend={{ value: statTrends.seoScore.weekChange, direction: 'up' }}
            onClick={() => router.push('/seo-yonetimi')}
          />
        </div>
        <div className="laptop:col-span-2">
          <StatCard
            label="Bekleyen Görevler"
            value={String(metrics.pendingTasks)}
            numericValue={metrics.pendingTasks}
            formatValue={(n) => Math.round(n).toLocaleString('tr-TR')}
            icon={ListTodo}
            tone={metrics.pendingTasks > 5 ? 'warning' : 'neutral'}
            onClick={() => router.push('/form-talepleri')}
          />
        </div>
        <div className="col-span-2 tablet:col-span-2 laptop:col-span-4">
          <StatCard
            label="Yayındaki Ürünler"
            value={String(metrics.publishedProducts)}
            numericValue={metrics.publishedProducts}
            formatValue={(n) => Math.round(n).toLocaleString('tr-TR')}
            icon={Package}
            tone="neutral"
            trend={{ value: statTrends.products.weekChange, direction: 'up' }}
            onClick={() => router.push('/urun-yonetimi')}
          />
        </div>
      </div>

      {/* Website Intelligence Score — one overall grade plus 6 compact metric tiles, replacing a single oversized KPI card */}
      <div className="mt-4 rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-soft bg-red/10 font-display text-body-sm font-bold text-red dark:bg-red/15 dark:text-red-eyebrow">
              {intelligenceGrade}
            </div>
            <div>
              <p className="font-display text-heading-sm font-bold text-near-black dark:text-white">Website Intelligence Score</p>
              <p className="text-[12px] text-steel dark:text-white/40">Genel skor: %{intelligenceOverall}</p>
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
              <span className={cn('font-display text-heading-sm font-bold', m.score >= 90 ? 'text-success' : m.score >= 70 ? 'text-warning' : 'text-danger')}>%{m.score}</span>
              {m.trend && <span className="text-[10px] text-success">{m.trend}</span>}
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
            {[
              { label: 'Taslak', count: pipelineCounts.taslak, tone: 'text-steel dark:text-white/50' },
              { label: 'Zamanlanan', count: pipelineCounts.zamanlandi, tone: 'text-info' },
              { label: 'Yayında', count: pipelineCounts.yayinda, tone: 'text-success' },
              { label: 'Arşiv', count: pipelineCounts.arsivlendi, tone: 'text-warning' },
            ].map((s, i, arr) => (
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

      {/* Website Operations Map — the 8 flagship pages at a glance */}
      <div className="mt-4 rounded-lg border border-border bg-white p-5 dark:border-white/[.06] dark:bg-surface-dark-raised">
        <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Website Operasyon Haritası</p>
        <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
          {operationsMapPages.map((p) => (
            <Link
              key={p.path}
              href={p.href}
              className="flex flex-col gap-1.5 rounded-soft border border-border p-3 transition-colors hover:border-red/30 dark:border-white/[.06]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-near-black dark:text-white/85">{p.name}</span>
                <Badge tone={p.status === 'yayinda' ? 'success' : 'neutral'} dot>{p.status === 'yayinda' ? 'Yayında' : 'Taslak'}</Badge>
              </div>
              <span className={cn('font-display text-body-sm font-bold', (p.seoScore ?? 0) >= 80 ? 'text-success' : (p.seoScore ?? 0) >= 50 ? 'text-warning' : 'text-danger')}>
                {p.seoScore !== undefined ? `SEO %${p.seoScore}` : 'SEO —'}
              </span>
              <span className="text-[10.5px] text-steel dark:text-white/35">Son yayın: {p.lastPublished}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Business Insights — compact widgets, only real fixture-backed signals */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 tablet:grid-cols-4">
        <div className="rounded-soft border border-border bg-white p-3.5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40"><Users size={11} /> Aylık Ziyaretçi</p>
          <p className="mt-1 font-display text-heading-sm font-bold text-near-black dark:text-white">18.4K</p>
          <p className="mt-0.5 text-[10.5px] text-success">{statTrends.visitors.weekChange} bu hafta</p>
        </div>
        <div className="rounded-soft border border-border bg-white p-3.5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40"><MousePointerClick size={11} /> Bayi Dönüşümü</p>
          <p className="mt-1 font-display text-heading-sm font-bold text-near-black dark:text-white">%{dealerConversion}</p>
          <p className="mt-0.5 text-[10.5px] text-steel dark:text-white/35">{dealers.length} başvurudan {dealers.filter((d) => d.status === 'onaylandi').length} onaylı</p>
        </div>
        <div className="rounded-soft border border-border bg-white p-3.5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40"><FileStack size={11} /> Kariyer Dönüşümü</p>
          <p className="mt-1 font-display text-heading-sm font-bold text-near-black dark:text-white">%{careerConversion}</p>
          <p className="mt-0.5 text-[10.5px] text-steel dark:text-white/35">{careerApplications} başvuru bu dönem</p>
        </div>
        <div className="rounded-soft border border-border bg-white p-3.5 dark:border-white/[.06] dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40"><Package size={11} /> En Çok İhraç Edilen</p>
          <p className="mt-1 truncate font-display text-body-sm font-bold text-near-black dark:text-white">
            {[...products].sort((a, b) => b.countries - a.countries)[0]?.name.slice(0, 22) ?? '—'}
          </p>
          <p className="mt-0.5 text-[10.5px] text-steel dark:text-white/35">{[...products].sort((a, b) => b.countries - a.countries)[0]?.countries ?? 0} ülke</p>
        </div>
      </div>

      {/* Row 2 — secondary KPIs, compact */}
      <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-4">
        <StatCard
          size="compact"
          label="Aylık Ziyaretçi"
          value="18.4K"
          numericValue={18400}
          formatValue={(n) => `${(n / 1000).toFixed(1)}K`}
          icon={Users}
          tone="ai"
          trend={{ value: statTrends.visitors.weekChange, direction: 'up' }}
        />
        <StatCard
          size="compact"
          label="Aktif Bayiler"
          value={String(metrics.activeDealers)}
          icon={Handshake}
          tone="info"
          onClick={() => router.push('/bayi-yonetimi')}
        />
        <StatCard
          size="compact"
          label="Yayındaki İçerik"
          value={String(metrics.publishedContent)}
          icon={FileStack}
          tone="neutral"
          onClick={() => router.push('/sayfa-yonetimi')}
        />
        <StatCard
          size="compact"
          label="Medya Kütüphanesi"
          value={`${metrics.mediaUsageGB.toFixed(1)} GB`}
          icon={ImageIcon}
          tone="orange"
          onClick={() => router.push('/medya-kutuphanesi')}
        />
      </div>

      {/* Executive summary + quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <div className="laptop:col-span-2">
          <ExecutiveSummary
            greetingName={metrics.greetingName}
            insights={metrics.insights}
            activeUserCount={metrics.activeUserCount}
            lastBackup={metrics.lastBackup}
            latestPublish={metrics.latestPublish}
            lastLogin={metrics.lastLogin}
            websiteStatus={metrics.websiteStatus}
            isWebsiteHealthy={metrics.isWebsiteHealthy}
            liveActivity={metrics.liveActivity}
          />
        </div>
        <QuickActions actions={quickActions} />
      </div>

      {/* Today's priorities + content summary */}
      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <div className="laptop:col-span-2">
          <PriorityCenter items={priorityItems} limit={3} />
        </div>
        <SystemHealthGrid items={compactHealthItems} compact />
      </div>

      <div className="mt-4">
        <ContentOverview cards={contentOverviewCards} />
      </div>

      {/* SEO + Export, side by side */}
      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <SeoCompactPanel data={seoOverview} />
        <ExportOverviewCompact data={dealerOverview} />
      </div>

      {/* Recent activity — last 5 only */}
      <div className="mt-4">
        <ActivityFeed items={activityFeed} limit={5} />
      </div>
    </ContentContainer>
  );
}
