'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Gauge, Rocket, ImageIcon, Globe2, Inbox, Package, Languages, Search, HeartPulse,
  Pencil, FileText, MessageSquare, ExternalLink, AlertOctagon, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Badge } from '@/components/ui/Badge';
import {
  seoRows, mediaItems, fileDocs, products, categories, formSubmissions, newsArticles, websitePages, systemHealthGrid,
} from '@/lib/mock-data';
import { resolvePublishStatus, resolveRevisions } from '@/lib/publishing-api';
import { computeSectionScore, scoreTone } from '@/lib/section-quality';
import { getAllFlatSections, siteWideHealthFlags } from '@/lib/website-graph';
import { cn } from '@/lib/utils';

type FeedItem = {
  id: string;
  date: string;
  icon: typeof Pencil;
  text: string;
  href: string;
};

/**
 * Operasyon Merkezi — Mission Control. The first screen a person operating
 * dekortools.com day-to-day should see: live status across every real
 * subsystem (publishing, media, SEO, forms, products, translations, search
 * index, content health) plus one unified chronological Operation Feed.
 * Every number here is computed from data already loaded elsewhere — no
 * separate "operations" dataset was invented for this screen.
 */
export default function OperasyonMerkeziPage() {
  const flatSections = useMemo(() => getAllFlatSections(), []);

  const avgScore = flatSections.length > 0
    ? Math.round(flatSections.reduce((sum, r) => sum + computeSectionScore(r.section, r.pageSeoScore).overall, 0) / flatSections.length)
    : 0;
  const translationAvg = flatSections.length > 0
    ? Math.round(flatSections.reduce((sum, r) => sum + computeSectionScore(r.section, r.pageSeoScore).translation, 0) / flatSections.length)
    : 0;

  const draftCount = flatSections.filter((r) => resolvePublishStatus(r.section) === 'taslak').length;
  const scheduledCount = flatSections.filter((r) => resolvePublishStatus(r.section) === 'zamanlandi').length;
  const publishedCount = flatSections.filter((r) => resolvePublishStatus(r.section) === 'yayinda').length;

  const unusedMedia = mediaItems.filter((m) => m.usageCount === 0).length;
  const avgSeoScore = seoRows.length > 0 ? Math.round(seoRows.reduce((sum, r) => sum + r.score, 0) / seoRows.length) : 0;
  const indexablePages = seoRows.filter((r) => r.robotsIndex).length;

  const newFormSubmissions = formSubmissions.filter((s) => s.status === 'yeni').length;
  const draftProducts = products.filter((p) => p.status === 'taslak').length;

  const searchableCount = flatSections.length + mediaItems.length + fileDocs.length + products.length + categories.length;

  const operationFeed = useMemo<FeedItem[]>(() => {
    const sectionEvents: FeedItem[] = flatSections
      .map((r) => ({ row: r, latest: resolveRevisions(r.section).slice(-1)[0] }))
      .filter((r): r is { row: typeof flatSections[number]; latest: NonNullable<ReturnType<typeof resolveRevisions>[number]> } => Boolean(r.latest))
      .map(({ row, latest }) => ({
        id: `section-${row.section.id}`,
        date: latest.date,
        icon: Pencil,
        text: `${latest.author} — ${row.pageName} → ${row.section.name}: ${latest.changeSummary}`,
        href: '/website-explorer',
      }));

    const formEvents: FeedItem[] = formSubmissions.slice(0, 10).map((s) => ({
      id: `form-${s.id}`,
      date: s.submittedAt,
      icon: MessageSquare,
      text: `Yeni form kaydı — ${s.sourceForm}: "${s.subject}"`,
      href: '/form-talepleri',
    }));

    const newsEvents: FeedItem[] = newsArticles.slice(0, 10).map((a) => ({
      id: `news-${a.id}`,
      date: a.date,
      icon: FileText,
      text: `${a.status === 'yayinda' ? 'Yayınlandı' : 'Taslak oluşturuldu'} — "${a.title}"`,
      href: '/haberler',
    }));

    return [...sectionEvents, ...formEvents, ...newsEvents]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20);
  }, [flatSections]);

  // Critical — real danger-tone health flags (missing CTA, broken link, missing media), deduped per section.
  const criticalItems = useMemo(() => {
    const flagged = siteWideHealthFlags(flatSections).filter((e) => e.flag.tone === 'danger');
    const bySection = new Map<string, typeof flagged>();
    flagged.forEach((e) => {
      const key = e.row.section.id;
      bySection.set(key, [...(bySection.get(key) ?? []), e]);
    });
    return Array.from(bySection.values()).map((entries) => ({
      row: entries[0].row,
      labels: entries.map((e) => e.flag.label),
    }));
  }, [flatSections]);

  // Ready to Publish — real draft sections that carry zero critical flags, i.e. safe to publish right now.
  const readyToPublish = useMemo(() => {
    const criticalIds = new Set(criticalItems.map((c) => c.row.section.id));
    return flatSections.filter((r) => resolvePublishStatus(r.section) === 'taslak' && !criticalIds.has(r.section.id));
  }, [flatSections, criticalItems]);

  // İnceleme Bekliyor — real form submissions still marked "yeni" (unreviewed).
  const needsReview = formSubmissions.filter((s) => s.status === 'yeni');

  // Sistem Notları — real non-healthy system-health rows (uyarı/kritik only, not the 8 healthy systems).
  const systemNotes = systemHealthGrid.filter((s) => s.status !== 'saglikli');

  return (
    <ContentContainer>
      <PageHeader
        title="Operasyon Merkezi"
        description="dekortools.com'u günlük olarak işletmek için ihtiyaç duyulan her sinyal tek ekranda — yayın, medya, SEO, formlar, ürünler, diller, arama ve genel sağlık."
      />

      {/* Command ticker — dense horizontal strip, distinct personality from the bento dashboard: every subsystem as one scannable row */}
      <div className="flex items-stretch divide-x divide-border overflow-x-auto rounded-lg border border-border bg-white dark:divide-white/[.06] dark:border-white/[.06] dark:bg-surface-dark-raised">
        {[
          { href: '/website-sagligi', icon: Gauge, label: 'Website', value: `%${avgScore}`, sub: null, tone: scoreTone(avgScore) },
          { href: '/yayin-merkezi', icon: Rocket, label: 'Yayın', value: String(publishedCount), sub: `${draftCount} taslak`, tone: 'success' as const },
          { href: '/medya-kutuphanesi', icon: ImageIcon, label: 'Medya', value: String(mediaItems.length + fileDocs.length), sub: `${unusedMedia} boşta`, tone: 'neutral' as const },
          { href: '/seo-yonetimi', icon: Globe2, label: 'SEO', value: `%${avgSeoScore}`, sub: null, tone: scoreTone(avgSeoScore) },
          { href: '/form-talepleri', icon: Inbox, label: 'Formlar', value: String(newFormSubmissions), sub: 'yeni', tone: newFormSubmissions > 0 ? 'warning' as const : 'neutral' as const },
          { href: '/urun-yonetimi', icon: Package, label: 'Ürünler', value: String(products.length), sub: `${draftProducts} taslak`, tone: 'neutral' as const },
          { href: '/dil-yonetimi', icon: Languages, label: 'Diller', value: `%${translationAvg}`, sub: null, tone: scoreTone(translationAvg) },
          { href: '/website-explorer', icon: Search, label: 'İndeks', value: String(searchableCount), sub: `${indexablePages} sayfa`, tone: 'neutral' as const },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-w-[140px] flex-1 flex-col gap-1 px-4 py-3 transition-colors hover:bg-mist dark:hover:bg-white/[.03]"
          >
            <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
              <item.icon size={11} /> {item.label}
            </span>
            <span className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-display text-heading-sm font-bold tabular-nums',
                  item.tone === 'danger' ? 'text-danger' : item.tone === 'warning' ? 'text-warning' : 'text-near-black dark:text-white'
                )}
              >
                {item.value}
              </span>
              {item.sub && <span className="truncate text-[10.5px] text-steel dark:text-white/35">{item.sub}</span>}
            </span>
          </Link>
        ))}
      </div>

      {/* Daily operations cockpit — 5 explicit columns, every item carries a visible action. */}
      <div className="mt-4 grid grid-cols-1 gap-3 laptop:grid-cols-5">
        {/* Kritik */}
        <div className="flex flex-col rounded-lg border-t-2 border-danger bg-white dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 border-b border-border px-3.5 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-danger dark:border-white/[.06]">
            <AlertOctagon size={13} /> Kritik <Badge tone="danger">{criticalItems.length}</Badge>
          </p>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {criticalItems.length === 0 ? (
              <p className="text-[12px] text-steel dark:text-white/40">Kritik sorun yok.</p>
            ) : (
              criticalItems.slice(0, 6).map(({ row, labels }) => {
                const targetPage = websitePages.find((p) => p.id === row.pageId);
                return (
                  <Link
                    key={row.section.id}
                    href={targetPage?.linkedHref ?? '/website-explorer'}
                    className="rounded-soft border border-danger/20 bg-danger/[.05] px-2.5 py-2 text-[11.5px] transition-colors hover:border-danger/40"
                  >
                    <p className="truncate text-near-black dark:text-white/80">{row.pageName} → {row.section.name}</p>
                    <p className="mt-1 flex items-center justify-between text-danger">
                      <span className="truncate">{labels[0]}{labels.length > 1 ? ` +${labels.length - 1}` : ''}</span>
                      <span className="shrink-0 font-medium">Düzelt →</span>
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* İnceleme Bekliyor */}
        <div className="flex flex-col rounded-lg border-t-2 border-warning bg-white dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 border-b border-border px-3.5 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-warning dark:border-white/[.06]">
            <Inbox size={13} /> İnceleme Bekliyor <Badge tone="warning">{needsReview.length}</Badge>
          </p>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {needsReview.length === 0 ? (
              <p className="text-[12px] text-steel dark:text-white/40">Bekleyen inceleme yok.</p>
            ) : (
              needsReview.slice(0, 6).map((s) => (
                <Link key={s.id} href="/form-talepleri" className="rounded-soft border border-warning/20 bg-warning/[.05] px-2.5 py-2 text-[11.5px] transition-colors hover:border-warning/40">
                  <p className="truncate text-near-black dark:text-white/80">{s.subject}</p>
                  <p className="mt-1 flex items-center justify-between text-warning">
                    <span className="truncate">{s.sourceForm}</span>
                    <span className="shrink-0 font-medium">İncele →</span>
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Yayına Hazır */}
        <div className="flex flex-col rounded-lg border-t-2 border-success bg-white dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 border-b border-border px-3.5 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-success dark:border-white/[.06]">
            <CheckCircle2 size={13} /> Yayına Hazır <Badge tone="success">{readyToPublish.length}</Badge>
          </p>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {readyToPublish.length === 0 ? (
              <p className="text-[12px] text-steel dark:text-white/40">Bekleyen taslak yok.</p>
            ) : (
              readyToPublish.slice(0, 6).map((row) => {
                const targetPage = websitePages.find((p) => p.id === row.pageId);
                return (
                  <Link
                    key={row.section.id}
                    href={targetPage?.linkedHref ?? '/website-explorer'}
                    className="rounded-soft border border-success/20 bg-success/[.05] px-2.5 py-2 text-[11.5px] transition-colors hover:border-success/40"
                  >
                    <p className="truncate text-near-black dark:text-white/80">{row.pageName} → {row.section.name}</p>
                    <p className="mt-1 flex items-center justify-between text-success">
                      <span>taslak</span>
                      <span className="shrink-0 font-medium">Yayınla →</span>
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Son İşler */}
        <div className="flex flex-col rounded-lg border-t-2 border-info bg-white dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 border-b border-border px-3.5 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-info dark:border-white/[.06]">
            <HeartPulse size={13} /> Son İşler
          </p>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {operationFeed.length === 0 ? (
              <p className="text-[12px] text-steel dark:text-white/40">Henüz kayıtlı işlem yok.</p>
            ) : (
              operationFeed.slice(0, 6).map((item) => (
                <Link key={item.id} href={item.href} className="flex items-start gap-2 rounded-soft border border-border px-2.5 py-2 text-[11.5px] transition-colors hover:border-info/40 dark:border-white/[.06]">
                  <item.icon size={12} className="mt-0.5 shrink-0 text-steel dark:text-white/40" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-near-black dark:text-white/80">{item.text}</span>
                    <span className="mt-0.5 block font-mono text-[10.5px] text-steel dark:text-white/35">{item.date}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sistem Notları */}
        <div className="flex flex-col rounded-lg border-t-2 border-steel/40 bg-white dark:border-white/20 dark:bg-surface-dark-raised">
          <p className="flex items-center gap-1.5 border-b border-border px-3.5 py-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-steel dark:border-white/[.06] dark:text-white/50">
            <Gauge size={13} /> Sistem Notları <Badge tone="neutral">{systemNotes.length}</Badge>
          </p>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {systemNotes.length === 0 ? (
              <p className="text-[12px] text-steel dark:text-white/40">Tüm sistemler sağlıklı.</p>
            ) : (
              systemNotes.map((s) => (
                <div key={s.id} className={cn('rounded-soft border px-2.5 py-2 text-[11.5px]', s.status === 'kritik' ? 'border-danger/20 bg-danger/[.05]' : 'border-warning/20 bg-warning/[.05]')}>
                  <p className="truncate text-near-black dark:text-white/80">{s.label}</p>
                  <p className={cn('mt-1 truncate', s.status === 'kritik' ? 'text-danger' : 'text-warning')}>{s.detail}</p>
                </div>
              ))
            )}
            <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-2.5 dark:border-white/[.06]">
              <Link href="/canli-website" className="flex items-center gap-1.5 text-[11.5px] text-steel transition-colors hover:text-red dark:text-white/40"><ExternalLink size={11} /> Canlı Website</Link>
              <Link href="/website-explorer" className="flex items-center gap-1.5 text-[11.5px] text-steel transition-colors hover:text-red dark:text-white/40"><Search size={11} /> Website Explorer</Link>
              <Link href="/yayin-merkezi" className="flex items-center gap-1.5 text-[11.5px] text-steel transition-colors hover:text-red dark:text-white/40"><Rocket size={11} /> Yayın Merkezi</Link>
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
