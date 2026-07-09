'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ShieldAlert, ImageOff, FileWarning, BadgeAlert, FileX, Images, Newspaper,
  ChevronRight, HeartPulse, CalendarClock, AlertOctagon, AlertTriangle, Info, Wrench, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import {
  products, newsArticles, certificates, seoRows, mediaItems, dealers,
  homepageSections, exportSections, careerSections, aboutSections, manufacturingSections,
  dealerPageSections, supportSections, newsroomSections, productDetailSections,
  categoryTemplateSections, newsDetailSections, contactPageSections, websitePages,
} from '@/lib/mock-data';
import { resolvePublishStatus } from '@/lib/publishing-api';
import { getAllFlatSections, siteWideHealthFlags, findOrphanPages, findEmptySections, type FlatSection } from '@/lib/website-graph';

/** Maps each real health-flag tone to the Critical/Warning/Info severity tiers Website Sağlığı groups issues by. */
const severityFromTone: Record<string, 'kritik' | 'uyari' | 'bilgi'> = {
  danger: 'kritik',
  warning: 'uyari',
  neutral: 'bilgi',
};

/** Every section-backed page — the source list for the scheduled-publishing queue below. */
const ALL_SECTION_SOURCES = [
  { sections: homepageSections, route: '/ana-sayfa-olusturucu', page: 'Ana Sayfa' },
  { sections: manufacturingSections, route: '/uretim-sayfasi', page: 'Üretim' },
  { sections: aboutSections, route: '/hakkimizda-sayfasi', page: 'Hakkımızda' },
  { sections: exportSections, route: '/ihracat-sayfasi', page: 'İhracat' },
  { sections: dealerPageSections, route: '/bayi-sayfasi', page: 'Bayi Sayfası' },
  { sections: supportSections, route: '/destek-sayfasi', page: 'Destek' },
  { sections: newsroomSections, route: '/haberler-sayfasi', page: 'Newsroom' },
  { sections: careerSections, route: '/kariyer-sayfasi', page: 'Kariyer' },
  { sections: productDetailSections, route: '/urun-detay-sablonu', page: 'Ürün Detay Şablonu' },
  { sections: categoryTemplateSections, route: '/kategori-sablonu', page: 'Kategori Şablonu' },
  { sections: newsDetailSections, route: '/haber-detay-sablonu', page: 'Haber Detay Şablonu' },
  { sections: contactPageSections, route: '/iletisim-sayfasi', page: 'İletişim' },
];

interface EntityHealth {
  label: string;
  href: string;
  score: number;
  missing: string[];
}

function pct(done: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((done / total) * 100);
}

/** Site-wide inspection — not just editing, but detecting what's missing across every real module, with one-click navigation to fix it. */
export default function WebsiteSagligiPage() {
  const entities = useMemo<EntityHealth[]>(() => {
    const homepageMissing = homepageSections.filter((s) => s.publicationStatus !== 'yayinda').map((s) => `${s.name} taslak durumda`);
    const homepageScore = pct(homepageSections.length - homepageMissing.length, homepageSections.length);

    const productIssues: string[] = [];
    products.forEach((p) => {
      if (p.gallery.length === 0) productIssues.push(`${p.name} — galeri görseli yok`);
      if (!p.ogImage) productIssues.push(`${p.name} — Open Graph görseli eksik`);
      if (p.specifications.length === 0) productIssues.push(`${p.name} — teknik özellik tanımlanmamış`);
    });
    const productChecks = products.length * 3;
    const productScore = pct(productChecks - productIssues.length, productChecks);

    const exportMissing = exportSections.filter((s) => s.publicationStatus !== 'yayinda').map((s) => `${s.name} taslak durumda`);
    const exportScore = pct(exportSections.length - exportMissing.length, exportSections.length);

    const careerMissing = careerSections.filter((s) => s.publicationStatus !== 'yayinda').map((s) => `${s.name} taslak durumda`);
    const careerScore = pct(careerSections.length - careerMissing.length, careerSections.length);

    const aboutMissing = aboutSections.filter((s) => s.publicationStatus !== 'yayinda').map((s) => `${s.name} taslak durumda`);
    const aboutScore = pct(aboutSections.length - aboutMissing.length, aboutSections.length);

    const manufacturingMissing = manufacturingSections.filter((s) => s.publicationStatus !== 'yayinda').map((s) => `${s.name} taslak durumda`);
    const manufacturingScore = pct(manufacturingSections.length - manufacturingMissing.length, manufacturingSections.length);

    const newsIssues: string[] = [];
    newsArticles.forEach((a) => {
      if (a.status === 'taslak') newsIssues.push(`"${a.title}" taslak durumda`);
      if (a.gallery.length === 0) newsIssues.push(`"${a.title}" — galeri görseli yok`);
    });
    const newsChecks = newsArticles.length * 2;
    const newsScore = pct(newsChecks - newsIssues.length, newsChecks);

    const seoIssues = seoRows.filter((r) => r.status !== 'iyi').map((r) => `${r.page} — SEO skoru ${r.score}`);
    const seoScore = pct(seoRows.length - seoIssues.length, seoRows.length);

    return [
      { label: 'Ana Sayfa', href: '/ana-sayfa-olusturucu', score: homepageScore, missing: homepageMissing },
      { label: 'Ürünler', href: '/urun-yonetimi', score: productScore, missing: productIssues },
      { label: 'İhracat', href: '/ihracat-sayfasi', score: exportScore, missing: exportMissing },
      { label: 'Hakkımızda', href: '/hakkimizda-sayfasi', score: aboutScore, missing: aboutMissing },
      { label: 'Üretim', href: '/uretim-sayfasi', score: manufacturingScore, missing: manufacturingMissing },
      { label: 'Kariyer', href: '/kariyer-sayfasi', score: careerScore, missing: careerMissing },
      { label: 'Haberler', href: '/haberler', score: newsScore, missing: newsIssues },
      { label: 'SEO', href: '/seo-yonetimi', score: seoScore, missing: seoIssues },
    ];
  }, []);

  const missingAlt = mediaItems.filter((m) => m.type === 'image' && !m.altText);
  const unusedMedia = mediaItems.filter((m) => m.usageCount === 0);
  const expiredCerts = certificates.filter((c) => c.status === 'suresi-doldu' || c.status === 'yenileniyor');
  const duplicateSeoTitles = (() => {
    const counts = new Map<string, number>();
    seoRows.forEach((r) => counts.set(r.title, (counts.get(r.title) ?? 0) + 1));
    return seoRows.filter((r) => (counts.get(r.title) ?? 0) > 1);
  })();
  const draftProducts = products.filter((p) => p.status === 'taslak');
  const draftNews = newsArticles.filter((a) => a.status === 'taslak');
  const dealersMissingLogo = dealers.filter((d) => d.listedOnWebsite && !d.logo);
  const seoCritical = seoRows.filter((r) => r.status === 'eksik');

  const scheduledQueue = ALL_SECTION_SOURCES.flatMap(({ sections, route, page }) =>
    sections
      .filter((s) => resolvePublishStatus(s) === 'zamanlandi')
      .map((s) => ({ id: s.id, name: s.name, page, route, scheduledAt: s.scheduledAt ?? '—' }))
  ).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const totalScore = Math.round(entities.reduce((sum, e) => sum + e.score, 0) / entities.length);
  const totalWarnings = missingAlt.length + expiredCerts.length + draftProducts.length + draftNews.length + dealersMissingLogo.length + seoCritical.length + unusedMedia.length + duplicateSeoTitles.length;

  // Section-level issues grouped by real severity (Critical/Warning/Info) — reuses the
  // same health-flag engine every other Website Control screen is built on, extended
  // here with two new checks (Orphan Pages, Empty Sections) that only make sense site-wide.
  const flatSections = useMemo<FlatSection[]>(() => getAllFlatSections(), []);
  const siteFlags = useMemo(() => siteWideHealthFlags(flatSections), [flatSections]);
  const orphanPages = useMemo(() => findOrphanPages(flatSections, websitePages), [flatSections]);
  const emptySections = useMemo(() => findEmptySections(flatSections), [flatSections]);

  const severityGroups = {
    kritik: siteFlags.filter((e) => severityFromTone[e.flag.tone] === 'kritik'),
    uyari: siteFlags.filter((e) => severityFromTone[e.flag.tone] === 'uyari'),
    bilgi: siteFlags.filter((e) => severityFromTone[e.flag.tone] === 'bilgi'),
  };

  function scoreTone(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Website Sağlığı"
        description="Tüm site üzerinde eksik, yayında olmayan veya tamamlanmamış içerikleri tarayan otomatik denetim — her uyarı ilgili modüle bağlıdır."
      />

      {/* Hero score — the one number that answers "how healthy is the site right now?" */}
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 p-6 tablet:p-8"
        style={{ background: 'radial-gradient(120% 140% at 92% 0%, #241417 0%, #14100f 45%, #0a0b0c 100%)' }}
      >
        <div className="relative flex flex-col gap-6 laptop:flex-row laptop:items-center laptop:justify-between">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                'flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 font-display text-heading-lg font-bold tabular-nums text-white',
                totalScore >= 90 ? 'border-success/60' : totalScore >= 70 ? 'border-warning/60' : 'border-danger/60'
              )}
            >
              %{totalScore}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">Genel Site Sağlığı</p>
              <p className="mt-1 font-display text-heading-lg font-bold text-white">
                {severityGroups.kritik.length > 0 ? `${severityGroups.kritik.length} kritik sorun acil düzeltme bekliyor.` : 'Kritik sorun yok.'}
              </p>
              <p className="mt-1.5 text-[13px] text-white/50">{totalWarnings} uyarı · {severityGroups.uyari.length} bölüm düzeyinde bulgu</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-soft border border-danger/25 bg-danger/[.08] px-4 py-3 text-center">
              <p className="font-display text-heading-md font-bold text-white">{severityGroups.kritik.length}</p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.04em] text-danger">Kritik</p>
            </div>
            <div className="rounded-soft border border-warning/25 bg-warning/[.08] px-4 py-3 text-center">
              <p className="font-display text-heading-md font-bold text-white">{severityGroups.uyari.length}</p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.04em] text-warning">Uyarı</p>
            </div>
            <div className="rounded-soft border border-white/10 bg-white/[.03] px-4 py-3 text-center">
              <p className="font-display text-heading-md font-bold text-white">{severityGroups.bilgi.length}</p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.04em] text-white/50">Bilgi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <StatCard label="Toplam Uyarı" value={String(totalWarnings)} icon={ShieldAlert} tone="warning" />
        <StatCard label="Eksik ALT Metni" value={String(missingAlt.length)} icon={ImageOff} tone="neutral" />
        <StatCard label="Kritik SEO Sorunu" value={String(seoCritical.length)} icon={FileWarning} tone="red" />
        <StatCard label="Boş Bölüm" value={String(emptySections.length)} icon={AlertTriangle} tone="warning" />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Bölüm Düzeyinde Bulgular — Önem Sırasına Göre</h2>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
          {(
            [
              { key: 'kritik' as const, label: 'Kritik', icon: AlertOctagon, tone: 'danger' as const },
              { key: 'uyari' as const, label: 'Uyarı', icon: AlertTriangle, tone: 'warning' as const },
              { key: 'bilgi' as const, label: 'Bilgi', icon: Info, tone: 'neutral' as const },
            ]
          ).map(({ key, label, icon: Icon, tone }) => {
            const items = severityGroups[key];
            return (
              <div
                key={key}
                className={cn(
                  'rounded-soft border p-3.5',
                  tone === 'danger' ? 'border-danger/25 bg-danger/[.03]' : tone === 'warning' ? 'border-warning/25 bg-warning/[.03]' : 'border-border dark:border-white/[.06]'
                )}
              >
                <p className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                  <Icon size={14} className={tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-steel dark:text-white/40'} />
                  {label} <Badge tone={tone}>{items.length}</Badge>
                </p>
                {items.length === 0 ? (
                  <p className="text-[12px] text-steel dark:text-white/40">Bu seviyede bulgu yok.</p>
                ) : (
                  <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
                    {items.slice(0, 20).map(({ row, flag }, i) => {
                      const targetPage = websitePages.find((p) => p.id === row.pageId);
                      return (
                        <li key={`${row.section.id}-${flag.code}-${i}`} className="rounded-soft border border-border/60 px-2 py-1.5 dark:border-white/[.06]">
                          <p className="truncate text-[12px] text-near-black dark:text-white/80">{row.pageName} → {row.section.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-steel dark:text-white/40">{flag.label}</span>
                            <div className="flex items-center gap-1">
                              <Link
                                href={targetPage?.linkedHref ?? '#'}
                                className="flex items-center gap-1 rounded-soft bg-red px-2 py-1 text-[10.5px] font-medium text-white transition-opacity hover:opacity-90"
                              >
                                <Wrench size={10} /> Şimdi Düzelt
                              </Link>
                              <Link
                                href="/canli-website"
                                className="flex items-center gap-1 rounded-soft border border-border px-2 py-1 text-[10.5px] font-medium text-steel transition-colors hover:border-red/30 hover:text-near-black dark:border-white/10 dark:text-white/50 dark:hover:text-white"
                              >
                                <Eye size={10} /> Canvas'ta Aç
                              </Link>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {(orphanPages.length > 0 || emptySections.length > 0) && (
          <div className="mt-4 grid grid-cols-1 gap-3 tablet:grid-cols-2 border-t border-border pt-4 dark:border-white/[.06]">
            {orphanPages.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Yetim Sayfalar ({orphanPages.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {orphanPages.map((p) => (
                    <Link key={p.id} href={p.linkedHref} className="rounded-soft border border-border bg-mist/60 px-2 py-1 text-[11.5px] text-near-black hover:border-red hover:text-red dark:border-white/10 dark:bg-white/[.04] dark:text-white/70">
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {emptySections.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Boş Bölümler ({emptySections.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {emptySections.map((row) => {
                    const targetPage = websitePages.find((p) => p.id === row.pageId);
                    return (
                      <Link key={row.section.id} href={targetPage?.linkedHref ?? '#'} className="rounded-soft border border-border bg-mist/60 px-2 py-1 text-[11.5px] text-near-black hover:border-red hover:text-red dark:border-white/10 dark:bg-white/[.04] dark:text-white/70">
                        {row.pageName} → {row.section.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Health heatmap — every page as one colored cell, darkest/reddest cells need attention first */}
      <Card className="mt-4 p-5">
        <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Sayfa Sağlık Isı Haritası</h2>
        <div className="grid grid-cols-4 gap-2.5 tablet:grid-cols-8">
          {entities.map((e) => (
            <Link
              key={`heat-${e.label}`}
              href={e.href}
              className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-soft text-center transition-transform hover:scale-[1.04]"
              style={{
                backgroundColor: e.score >= 90 ? 'rgba(34,197,94,0.16)' : e.score >= 70 ? 'rgba(234,179,8,0.18)' : 'rgba(239,68,68,0.2)',
                border: `1px solid ${e.score >= 90 ? 'rgba(34,197,94,0.4)' : e.score >= 70 ? 'rgba(234,179,8,0.4)' : 'rgba(239,68,68,0.45)'}`,
              }}
              title={`${e.label}: %${e.score}`}
            >
              <span className={cn('font-display text-heading-sm font-bold', e.score >= 90 ? 'text-success' : e.score >= 70 ? 'text-warning' : 'text-danger')}>%{e.score}</span>
              <span className="truncate px-1 text-[10px] text-near-black/70 dark:text-white/60">{e.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">İçerik Tamamlanma Durumu</h2>
          <div className="flex flex-col gap-4">
            {entities.map((e) => (
              <Link key={e.label} href={e.href} className="group block rounded-soft border border-border px-3.5 py-3 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white">
                    {e.label}
                    <ChevronRight size={13} className="text-steel opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40" />
                  </span>
                  <span className="tabular-nums text-body-sm font-medium text-near-black dark:text-white">%{e.score}</span>
                </div>
                <ProgressBar value={e.score} tone={scoreTone(e.score)} className="mt-2" />
                {e.missing.length > 0 && (
                  <p className="mt-1.5 text-[11.5px] text-steel dark:text-white/40">{e.missing.length} eksik alan bulundu</p>
                )}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Eyleme Geçirilebilir Uyarılar</h2>
          <div className="flex flex-col gap-2">
            <Link href="/medya-kutuphanesi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <ImageOff size={13} className="text-warning" /> {missingAlt.length} görselde ALT metni eksik
              </span>
              <Badge tone="warning">{missingAlt.length}</Badge>
            </Link>
            <Link href="/medya-kutuphanesi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <Images size={13} className="text-steel dark:text-white/40" /> {unusedMedia.length} kullanılmayan medya dosyası
              </span>
              <Badge tone="neutral">{unusedMedia.length}</Badge>
            </Link>
            <Link href="/sertifikalar" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <BadgeAlert size={13} className="text-danger" /> {expiredCerts.length} sertifika süresi doldu / yenileniyor
              </span>
              <Badge tone="danger">{expiredCerts.length}</Badge>
            </Link>
            <Link href="/urun-yonetimi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <FileX size={13} className="text-warning" /> {draftProducts.length} ürün taslak durumda
              </span>
              <Badge tone="warning">{draftProducts.length}</Badge>
            </Link>
            <Link href="/haberler" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <Newspaper size={13} className="text-warning" /> {draftNews.length} haber makalesi taslak durumda
              </span>
              <Badge tone="warning">{draftNews.length}</Badge>
            </Link>
            <Link href="/bayi-yonetimi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <BadgeAlert size={13} className="text-warning" /> {dealersMissingLogo.length} listelenen bayinin logosu eksik
              </span>
              <Badge tone="warning">{dealersMissingLogo.length}</Badge>
            </Link>
            <Link href="/seo-yonetimi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <FileWarning size={13} className="text-danger" /> {seoCritical.length} sayfada kritik SEO eksikliği
              </span>
              <Badge tone="danger">{seoCritical.length}</Badge>
            </Link>
            <Link href="/seo-yonetimi" className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30">
              <span className="flex items-center gap-2 text-[12.5px] text-near-black dark:text-white/85">
                <FileWarning size={13} className="text-warning" /> {duplicateSeoTitles.length} sayfa aynı meta başlığı paylaşıyor
              </span>
              <Badge tone="warning">{duplicateSeoTitles.length}</Badge>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="mb-4 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
          <CalendarClock size={16} /> Zamanlanmış Yayınlar
        </h2>
        {scheduledQueue.length === 0 ? (
          <p className="text-body-sm text-steel dark:text-white/50">Şu anda zamanlanmış bir bölüm yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {scheduledQueue.map((item) => (
              <Link
                key={item.id}
                href={item.route}
                className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-near-black dark:text-white/85">
                  {item.name} — <span className="text-steel dark:text-white/40">{item.page}</span>
                </span>
                <Badge tone="info">{item.scheduledAt}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </ContentContainer>
  );
}
