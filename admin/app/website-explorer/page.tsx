'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Compass, ChevronDown, Search, Globe2, Image as ImageIcon, FileText, Video, Package, FolderTree,
  Clock, AlertTriangle, X, ExternalLink, MousePointerClick, Palette, Radio, Rocket, ArrowRight,
  ArrowLeft, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionEditorDrawer } from '@/components/homepage/SectionEditorDrawer';
import {
  websitePages,
  seoRows,
  mediaItems,
  fileDocs,
  products,
  categories,
  homepageSections,
  aboutSections,
  manufacturingSections,
  exportSections,
  dealerPageSections,
  supportSections,
  newsroomSections,
  careerSections,
  productDetailSections,
  categoryTemplateSections,
  newsDetailSections,
  contactPageSections,
  productsLandingSections,
  becomeDealerSections,
  type HomepageSection,
} from '@/lib/mock-data';
import { resolvePublishStatus, resolveRevisions, publishStatusLabel, publishStatusTone } from '@/lib/publishing-api';
import { computeSectionHealthFlags, computeSectionScore, scoreTone } from '@/lib/section-quality';
import {
  findSectionByPlacement, groupButtonsByStyle, groupSectionsByColor, computePageLinks, siteWideHealthFlags,
  type FlatSection,
} from '@/lib/website-graph';
import { cn } from '@/lib/utils';

const sectionMap = {
  homepageSections,
  aboutSections,
  manufacturingSections,
  exportSections,
  dealerPageSections,
  supportSections,
  newsroomSections,
  careerSections,
  productDetailSections,
  categoryTemplateSections,
  newsDetailSections,
  contactPageSections,
  productsLandingSections,
  becomeDealerSections,
} as const;

type SectionsKey = keyof typeof sectionMap;

type ExplorerTab = 'agac' | 'medya' | 'bilesenler' | 'renkler';

const buttonStyleLabel: Record<string, string> = { birincil: 'Birincil Buton', ikincil: 'İkincil Buton', metin: 'Metin Buton' };

/**
 * Website Explorer — the connected map of the whole site: every real page,
 * every real section, every real media/file relation, in one place. Built
 * entirely on data already loaded elsewhere (websitePages, sectionsKey
 * arrays, mediaItems, fileDocs, seoRows) — no new fixture data, no
 * duplicated section editor. Selecting a section opens the same
 * SectionEditorDrawer every builder uses; selecting a page links to its
 * real builder instead of re-implementing the section grid a second time.
 */
export default function WebsiteExplorerPage() {
  const [tab, setTab] = useState<ExplorerTab>('agac');
  const [query, setQuery] = useState('');
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [sectionsByKey, setSectionsByKey] = useState<Record<SectionsKey, HomepageSection[]>>(sectionMap);
  const [activeSection, setActiveSection] = useState<{ pageId: string; pageName: string; pageSeoScore?: number; section: HomepageSection } | null>(null);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);

  const flatSections = useMemo<FlatSection[]>(() => {
    const rows: FlatSection[] = [];
    for (const page of websitePages) {
      if (!page.sectionsKey) continue;
      const sections = sectionsByKey[page.sectionsKey as SectionsKey];
      const seoScore = seoRows.find((r) => r.page === page.path)?.score;
      for (const section of sections) {
        rows.push({ pageId: page.id, pageName: page.name, pagePath: page.path, pageSeoScore: seoScore, section });
      }
    }
    return rows;
  }, [sectionsByKey]);

  function applyUpdate(updated: HomepageSection) {
    if (!activeSection) return;
    const page = websitePages.find((p) => p.id === activeSection.pageId);
    if (!page?.sectionsKey) return;
    const key = page.sectionsKey as SectionsKey;
    setSectionsByKey((prev) => ({
      ...prev,
      [key]: prev[key].map((s) => (s.id === updated.id ? updated : s)),
    }));
    setActiveSection({ ...activeSection, section: updated });
  }

  function openSection(row: FlatSection) {
    setActiveSection({ pageId: row.pageId, pageName: row.pageName, pageSeoScore: row.pageSeoScore, section: row.section });
  }

  // Site-wide rollups — all computed live from real section data, nothing pre-aggregated in fixtures.
  const totalSections = flatSections.length;
  const avgScore = totalSections > 0
    ? Math.round(flatSections.reduce((sum, r) => sum + computeSectionScore(r.section, r.pageSeoScore).overall, 0) / totalSections)
    : 0;
  const draftSections = flatSections.filter((r) => resolvePublishStatus(r.section) !== 'yayinda').length;
  const scheduledSections = flatSections.filter((r) => resolvePublishStatus(r.section) === 'zamanlandi').length;
  const siteHealthEntries = siteWideHealthFlags(flatSections);
  const brokenLinkCount = siteHealthEntries.filter((e) => e.flag.code === 'broken-link').length;
  const missingMediaCount = siteHealthEntries.filter((e) => e.flag.code === 'missing-image' || e.flag.code === 'missing-video').length;
  const unusedAssetCount = mediaItems.filter((m) => m.usageCount === 0).length;
  const avgSeoScore = seoRows.length > 0 ? Math.round(seoRows.reduce((sum, r) => sum + r.score, 0) / seoRows.length) : 0;
  const translationAvg = totalSections > 0
    ? Math.round(flatSections.reduce((sum, r) => sum + computeSectionScore(r.section, r.pageSeoScore).translation, 0) / totalSections)
    : 0;
  const ogMissingPages = websitePages.filter((p) => {
    const row = seoRows.find((r) => r.page === p.path);
    return row ? !row.ogImage : false;
  });

  const recentChanges = flatSections
    .map((r) => ({ row: r, latest: resolveRevisions(r.section).slice(-1)[0] }))
    .filter((r): r is { row: FlatSection; latest: NonNullable<ReturnType<typeof resolveRevisions>[number]> } => Boolean(r.latest))
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date))
    .slice(0, 12);

  const recentPublications = flatSections
    .filter((r) => r.section.lastPublishedAt)
    .sort((a, b) => (b.section.lastPublishedAt ?? '').localeCompare(a.section.lastPublishedAt ?? ''))
    .slice(0, 8);

  const buttonGroups = groupButtonsByStyle(flatSections);
  const colorGroups = groupSectionsByColor(flatSections);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = trimmedQuery.length === 0 ? null : {
    pages: websitePages.filter((p) => p.name.toLowerCase().includes(trimmedQuery)),
    sections: flatSections.filter((r) => r.section.name.toLowerCase().includes(trimmedQuery) || r.section.title.toLowerCase().includes(trimmedQuery) || r.section.type.toLowerCase().includes(trimmedQuery)),
    media: mediaItems.filter((m) => m.name.toLowerCase().includes(trimmedQuery) || m.title.toLowerCase().includes(trimmedQuery)),
    files: fileDocs.filter((f) => f.name.toLowerCase().includes(trimmedQuery)),
    products: products.filter((p) => p.name.toLowerCase().includes(trimmedQuery)),
    categories: categories.filter((c) => c.name.toLowerCase().includes(trimmedQuery)),
  };
  const searchResultCount = searchResults
    ? searchResults.pages.length + searchResults.sections.length + searchResults.media.length + searchResults.files.length + searchResults.products.length + searchResults.categories.length
    : 0;

  const selectedPage = selectedPageId ? websitePages.find((p) => p.id === selectedPageId) ?? null : null;
  const selectedPageSections = selectedPage?.sectionsKey ? sectionsByKey[selectedPage.sectionsKey as SectionsKey] : null;
  const selectedPageSeoRow = selectedPage ? seoRows.find((r) => r.page === selectedPage.path) : undefined;
  const selectedPageSeoScore = selectedPageSeoRow?.score;
  const selectedPageLinks = selectedPage ? computePageLinks(selectedPage, flatSections, websitePages) : null;

  return (
    <ContentContainer>
      <PageHeader
        title="Website Explorer"
        description="dekortools.com'un tamamı — sayfalar, bölümler, medya ve dosyalar tek bir bağlantılı haritada. Bir bölüme tıklamak doğrudan gerçek düzenleyiciyi açar."
      />

      {/* Website graph health widget — one glance at the whole connected map's condition */}
      <Card className="mb-4 flex flex-wrap items-center gap-6 p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#D32027 ${avgScore * 3.6}deg, rgba(211,32,39,0.12) 0deg)` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[13px] font-bold text-near-black dark:bg-surface-dark-raised dark:text-white">
              %{avgScore}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Graf Sağlığı</p>
            <p className="text-body-sm font-medium text-near-black dark:text-white">{websitePages.length} sayfa · {totalSections} bölüm</p>
          </div>
        </div>
        <div className="h-10 w-px bg-border dark:bg-white/10" />
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: 'Bozuk Bağlantı', value: brokenLinkCount, danger: brokenLinkCount > 0 },
            { label: 'Eksik Medya', value: missingMediaCount, danger: missingMediaCount > 0 },
            { label: 'Kullanılmayan Varlık', value: unusedAssetCount, danger: false },
            { label: 'OG Görseli Eksik', value: ogMissingPages.length, danger: ogMissingPages.length > 0 },
            { label: 'Zamanlanmış', value: scheduledSections, danger: false },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={cn('font-display text-heading-sm font-bold', s.danger ? 'text-danger' : 'text-near-black dark:text-white')}>{s.value}</p>
              <p className="mt-0.5 max-w-[86px] text-[10px] leading-tight text-steel dark:text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-[360px_1fr]">
        {/* Left: search + tree/media navigator */}
        <div className="flex flex-col gap-4">
          <Card className="p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel dark:text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bölüm, medya, buton, ürün, kategori, sayfa ara…"
                className="w-full rounded-soft border border-border bg-transparent py-2 pl-8 pr-8 text-body-sm text-near-black outline-none placeholder:text-steel focus:border-red dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Aramayı temizle">
                  <X size={14} />
                </button>
              )}
            </div>
          </Card>

          {!searchResults && (
            <Card className="p-0">
              <div className="flex border-b border-border dark:border-white/[.06]">
                <button
                  type="button"
                  onClick={() => setTab('agac')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                    tab === 'agac' ? 'border-b-2 border-red text-near-black dark:text-white' : 'text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white'
                  )}
                >
                  <FolderTree size={13} /> Website Ağacı
                </button>
                <button
                  type="button"
                  onClick={() => setTab('medya')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                    tab === 'medya' ? 'border-b-2 border-red text-near-black dark:text-white' : 'text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white'
                  )}
                >
                  <ImageIcon size={13} /> Medya & Varlıklar
                </button>
                <button
                  type="button"
                  onClick={() => setTab('bilesenler')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                    tab === 'bilesenler' ? 'border-b-2 border-red text-near-black dark:text-white' : 'text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white'
                  )}
                >
                  <MousePointerClick size={13} /> Bileşenler
                </button>
                <button
                  type="button"
                  onClick={() => setTab('renkler')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                    tab === 'renkler' ? 'border-b-2 border-red text-near-black dark:text-white' : 'text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white'
                  )}
                >
                  <Palette size={13} /> Renkler
                </button>
              </div>

              {tab === 'agac' && (
                <div className="max-h-[70vh] overflow-y-auto p-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPageId(null)}
                    className={cn(
                      'mb-1 flex w-full items-center gap-2 rounded-soft px-2.5 py-2 text-left text-body-sm font-semibold transition-colors',
                      selectedPageId === null ? 'bg-mist text-near-black dark:bg-white/[.06] dark:text-white' : 'text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]'
                    )}
                  >
                    <Compass size={14} className="shrink-0 text-red" /> Website
                  </button>
                  <ul className="ml-2 border-l border-border pl-2 dark:border-white/[.08]">
                    {websitePages.filter((p) => p.sectionsKey).map((p) => {
                      const isOpen = expandedPages[p.id];
                      const sections = sectionsByKey[p.sectionsKey as SectionsKey];
                      const pageSeoScoreForTree = seoRows.find((r) => r.page === p.path)?.score;
                      const pageCriticalCount = sections.reduce((sum, s) => sum + computeSectionHealthFlags(s, pageSeoScoreForTree).filter((f) => f.tone === 'danger').length, 0);
                      return (
                        <li key={p.id} className="mb-0.5">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => setExpandedPages((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                              className="flex h-6 w-6 shrink-0 items-center justify-center text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white"
                              aria-label={isOpen ? 'Daralt' : 'Genişlet'}
                            >
                              <ChevronDown size={13} className={cn('transition-transform', isOpen && 'rotate-180')} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPageId(p.id)}
                              className={cn(
                                'flex flex-1 items-center gap-1.5 rounded-soft px-2 py-1.5 text-left text-[13px] font-medium transition-colors',
                                selectedPageId === p.id ? 'bg-mist text-near-black dark:bg-white/[.06] dark:text-white' : 'text-near-black hover:bg-mist dark:text-white/85 dark:hover:bg-white/[.04]'
                              )}
                            >
                              {p.name}
                              <Badge tone={p.status === 'yayinda' ? 'success' : 'neutral'} dot>{p.status === 'yayinda' ? 'Yayında' : 'Taslak'}</Badge>
                              {pageCriticalCount > 0 && <Badge tone="danger">{pageCriticalCount} kritik</Badge>}
                            </button>
                          </div>
                          {isOpen && (
                            <ul className="ml-6 border-l border-border pl-2 dark:border-white/[.08]">
                              {sections.map((s) => {
                                const sFlags = computeSectionHealthFlags(s, seoRows.find((r) => r.page === p.path)?.score);
                                const hasCritical = sFlags.some((f) => f.tone === 'danger');
                                const hasWarning = sFlags.some((f) => f.tone === 'warning');
                                return (
                                  <li key={s.id}>
                                    <button
                                      type="button"
                                      onClick={() => openSection({ pageId: p.id, pageName: p.name, pagePath: p.path, pageSeoScore: seoRows.find((r) => r.page === p.path)?.score, section: s })}
                                      className="flex w-full items-center justify-between gap-1.5 truncate rounded-soft px-2 py-1 text-left text-[12.5px] text-steel transition-colors hover:bg-mist hover:text-near-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                                    >
                                      <span className="truncate">{s.name}</span>
                                      {(hasCritical || hasWarning) && (
                                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', hasCritical ? 'bg-danger' : 'bg-warning')} title={sFlags[0]?.label} />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {tab === 'medya' && (
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Medya Kütüphanesi ({mediaItems.length})</p>
                  <ul className="mb-4 flex flex-col gap-1.5">
                    {mediaItems.map((m) => (
                      <li key={m.id} className="rounded-soft border border-border p-2.5 dark:border-white/[.06]">
                        <div className="flex items-center gap-2">
                          {m.type === 'video' ? <Video size={13} className="shrink-0 text-steel dark:text-white/50" /> : <ImageIcon size={13} className="shrink-0 text-steel dark:text-white/50" />}
                          <p className="truncate text-[12.5px] font-medium text-near-black dark:text-white">{m.title}</p>
                        </div>
                        {m.usedIn.length === 0 ? (
                          <p className="mt-1 text-[11px] text-steel dark:text-white/40">Henüz hiçbir yerde kullanılmıyor.</p>
                        ) : (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.usedIn.map((place) => {
                              const match = findSectionByPlacement(flatSections, place);
                              return match ? (
                                <button
                                  key={place}
                                  type="button"
                                  onClick={() => openSection(match)}
                                  className="rounded-soft border border-border bg-mist/60 px-1.5 py-0.5 text-[10.5px] text-near-black transition-colors hover:border-red hover:text-red dark:border-white/10 dark:bg-white/[.04] dark:text-white/70"
                                >
                                  {place}
                                </button>
                              ) : (
                                <span key={place} className="rounded-soft border border-border bg-mist/60 px-1.5 py-0.5 text-[10.5px] text-steel dark:border-white/10 dark:bg-white/[.04] dark:text-white/40">
                                  {place}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Dosya Merkezi ({fileDocs.length})</p>
                  <ul className="flex flex-col gap-1.5">
                    {fileDocs.map((f) => (
                      <li key={f.id} className="rounded-soft border border-border p-2.5 dark:border-white/[.06]">
                        <div className="flex items-center gap-2">
                          <FileText size={13} className="shrink-0 text-steel dark:text-white/50" />
                          <p className="truncate text-[12.5px] font-medium text-near-black dark:text-white">{f.name}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-steel dark:text-white/40">{f.linkedTo ?? 'Bağlantılı içerik yok'}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === 'bilesenler' && (
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <p className="mb-3 text-[11.5px] text-steel dark:text-white/40">
                    Sitede ayrı bir bileşen kütüphanesi olmadığı için bu görünüm, her butonun gerçek stil alanına (birincil/ikincil/metin) göre nerede kullanıldığını gösterir.
                  </p>
                  {buttonGroups.map((group) => (
                    <div key={group.style} className="mb-4">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-near-black dark:text-white">
                        <MousePointerClick size={12} /> {buttonStyleLabel[group.style] ?? group.style} <Badge tone="neutral">{group.count}</Badge>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {group.placements.map((p, i) => (
                          <button
                            key={`${p.sectionId}-${i}`}
                            type="button"
                            onClick={() => setSelectedPageId(p.pageId)}
                            className="rounded-soft border border-border bg-mist/60 px-1.5 py-0.5 text-[10.5px] text-near-black transition-colors hover:border-red hover:text-red dark:border-white/10 dark:bg-white/[.04] dark:text-white/70"
                            title={`"${p.label}" — ${p.sectionName}`}
                          >
                            {p.pageName}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'renkler' && (
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <p className="mb-3 text-[11.5px] text-steel dark:text-white/40">
                    Bölümlerin gerçek arka plan renklerine göre kullanım dağılımı — ayrı bir tasarım token sistemi olmadığından, doğrudan gerçek hex değerleri üzerinden gruplanır.
                  </p>
                  {colorGroups.map((group) => (
                    <div key={group.color} className="mb-3 flex items-center gap-2.5 rounded-soft border border-border p-2.5 dark:border-white/[.06]">
                      <span className="h-8 w-8 shrink-0 rounded-soft border border-border dark:border-white/10" style={{ backgroundColor: group.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[12px] font-medium text-near-black dark:text-white">{group.color} <span className="text-steel dark:text-white/40">×{group.count}</span></p>
                        <p className="truncate text-[11px] text-steel dark:text-white/40">{group.pages.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {searchResults && (
            <Card className="max-h-[75vh] overflow-y-auto p-3">
              <p className="mb-2 text-[11.5px] text-steel dark:text-white/40">{searchResultCount} sonuç bulundu</p>
              <div className="flex flex-col gap-4">
                {searchResults.sections.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Bölümler</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.sections.map((r) => (
                        <li key={r.section.id}>
                          <button type="button" onClick={() => openSection(r)} className="flex w-full flex-col items-start rounded-soft px-2 py-1.5 text-left hover:bg-mist dark:hover:bg-white/[.04]">
                            <span className="text-[12.5px] font-medium text-near-black dark:text-white">{r.section.name}</span>
                            <span className="text-[11px] text-steel dark:text-white/40">{r.pageName} → {r.section.type}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.pages.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Sayfalar</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.pages.map((p) => (
                        <li key={p.id}>
                          <button type="button" onClick={() => { setSelectedPageId(p.id); setTab('agac'); setQuery(''); }} className="flex w-full items-center justify-between rounded-soft px-2 py-1.5 text-left text-[12.5px] font-medium text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]">
                            {p.name} <span className="font-mono text-[11px] text-steel dark:text-white/40">{p.path}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.media.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Medya</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.media.map((m) => (
                        <li key={m.id}>
                          <Link href="/medya-kutuphanesi" className="flex items-center gap-1.5 rounded-soft px-2 py-1.5 text-[12.5px] font-medium text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]">
                            <ImageIcon size={12} /> {m.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.files.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Dosyalar</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.files.map((f) => (
                        <li key={f.id}>
                          <Link href="/dosya-merkezi" className="flex items-center gap-1.5 rounded-soft px-2 py-1.5 text-[12.5px] font-medium text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]">
                            <FileText size={12} /> {f.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.products.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Ürünler</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.products.map((p) => (
                        <li key={p.id}>
                          <Link href="/urun-yonetimi" className="flex items-center gap-1.5 rounded-soft px-2 py-1.5 text-[12.5px] font-medium text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]">
                            <Package size={12} /> {p.name} <span className="text-[11px] font-normal text-steel dark:text-white/40">— Ürün Yönetimi&apos;nde aç</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.categories.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">Kategoriler</p>
                    <ul className="flex flex-col gap-1">
                      {searchResults.categories.map((c) => (
                        <li key={c.id}>
                          <Link href="/kategori-yonetimi" className="flex items-center gap-1.5 rounded-soft px-2 py-1.5 text-[12.5px] font-medium text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/[.04]">
                            <FolderTree size={12} /> {c.name} <span className="text-[11px] font-normal text-steel dark:text-white/40">— Kategori Yönetimi&apos;nde aç</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResultCount === 0 && (
                  <p className="py-6 text-center text-[12.5px] text-steel dark:text-white/40">Sonuç bulunamadı.</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right: overview / selected page detail */}
        <div className="flex flex-col gap-4">
          {!selectedPage && (
            <>
              {/* Website Overview — a live dashboard of the whole ecosystem, not just one page */}
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Website Sağlığı</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">%{avgScore}</p>
                  <ProgressBar value={avgScore} tone={scoreTone(avgScore)} className="mt-2" />
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">SEO</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">%{avgSeoScore}</p>
                  <ProgressBar value={avgSeoScore} tone={scoreTone(avgSeoScore)} className="mt-2" />
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Çeviri</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">%{translationAvg}</p>
                  <ProgressBar value={translationAvg} tone={scoreTone(translationAvg)} className="mt-2" />
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Medya</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">{mediaItems.length + fileDocs.length}</p>
                  <p className="mt-1 text-[11px] text-steel dark:text-white/40">{unusedAssetCount} kullanılmayan</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Taslak Değişiklik</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">{draftSections}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Zamanlanan</p>
                  <p className="mt-1 font-display text-heading-md text-near-black dark:text-white">{scheduledSections}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Bozuk Bağlantı</p>
                  <p className={cn('mt-1 font-display text-heading-md', brokenLinkCount > 0 ? 'text-danger' : 'text-near-black dark:text-white')}>{brokenLinkCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Eksik Görsel/Video</p>
                  <p className={cn('mt-1 font-display text-heading-md', missingMediaCount > 0 ? 'text-danger' : 'text-near-black dark:text-white')}>{missingMediaCount}</p>
                </Card>
              </div>

              {/* Website Intelligence — every real health flag site-wide, itemized and jump-to-fix */}
              <Card className="p-0">
                <button
                  type="button"
                  onClick={() => setIntelligenceOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-mist/50 dark:hover:bg-white/[.03]"
                >
                  <span className="flex items-center gap-2 text-body-sm font-medium text-near-black dark:text-white/85">
                    <Sparkles size={14} className="text-warning" /> Website İstihbaratı
                    <Badge tone={siteHealthEntries.length > 0 ? 'warning' : 'success'}>{siteHealthEntries.length} bulgu</Badge>
                  </span>
                  <ChevronDown size={14} className={cn('text-steel transition-transform dark:text-white/40', intelligenceOpen && 'rotate-180')} />
                </button>
                {intelligenceOpen && (
                  <div className="max-h-96 overflow-y-auto border-t border-border dark:border-white/[.06]">
                    {ogMissingPages.length > 0 && (
                      <div className="border-b border-border px-4 py-2.5 dark:border-white/[.06]">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">OpenGraph Görseli Eksik</p>
                        {ogMissingPages.map((p) => (
                          <p key={p.id} className="text-[12.5px] text-near-black dark:text-white/80">Bu sayfada OpenGraph görseli yok: <span className="font-medium">{p.name}</span></p>
                        ))}
                      </div>
                    )}
                    {siteHealthEntries.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12.5px] text-steel dark:text-white/50">Site genelinde açık bir sağlık bulgusu yok.</p>
                    ) : (
                      <ul className="divide-y divide-border dark:divide-white/[.06]">
                        {siteHealthEntries.map(({ row, flag }, i) => (
                          <li key={`${row.section.id}-${flag.code}-${i}`}>
                            <button type="button" onClick={() => openSection(row)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-mist/50 dark:hover:bg-white/[.03]">
                              <span className="min-w-0 flex-1 truncate text-[12.5px] text-near-black dark:text-white/80">
                                {row.pageName} → {row.section.name}
                              </span>
                              <Badge tone={flag.tone}>{flag.label}</Badge>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <Card className="p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                    <Clock size={14} /> Son Değişiklikler
                  </p>
                  {recentChanges.length === 0 ? (
                    <p className="text-[12.5px] text-steel dark:text-white/50">Henüz kayıtlı bir değişiklik yok.</p>
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {recentChanges.map(({ row, latest }) => (
                        <li key={row.section.id} className="flex items-start justify-between gap-3 border-b border-border pb-2.5 last:border-b-0 last:pb-0 dark:border-white/[.06]">
                          <button type="button" onClick={() => openSection(row)} className="min-w-0 flex-1 text-left">
                            <p className="text-[12.5px] text-near-black dark:text-white/85">
                              <span className="font-medium">{latest.author}</span> — {row.pageName} → {row.section.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11.5px] text-steel dark:text-white/40">{latest.changeSummary}</p>
                          </button>
                          <span className="shrink-0 font-mono text-[11px] text-steel dark:text-white/40">{latest.date}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card className="p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
                    <Rocket size={14} /> Son Yayınlananlar
                  </p>
                  {recentPublications.length === 0 ? (
                    <p className="text-[12.5px] text-steel dark:text-white/50">Henüz yayınlanan bölüm yok.</p>
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {recentPublications.map((row) => (
                        <li key={row.section.id} className="flex items-start justify-between gap-3 border-b border-border pb-2.5 last:border-b-0 last:pb-0 dark:border-white/[.06]">
                          <button type="button" onClick={() => openSection(row)} className="min-w-0 flex-1 text-left">
                            <p className="text-[12.5px] text-near-black dark:text-white/85">{row.pageName} → {row.section.name}</p>
                          </button>
                          <span className="shrink-0 font-mono text-[11px] text-steel dark:text-white/40">{row.section.lastPublishedAt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11.5px] text-steel dark:border-white/[.06] dark:text-white/40">
                    <Radio size={12} /> Ziyaretçi verisi — <Badge tone="neutral">Yakında</Badge>
                  </p>
                </Card>
              </div>
            </>
          )}

          {selectedPage && selectedPageSections && (
            <>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-heading-sm text-near-black dark:text-white">{selectedPage.name}</p>
                      <Badge tone={selectedPage.status === 'yayinda' ? 'success' : 'neutral'} dot>{selectedPage.status === 'yayinda' ? 'Yayında' : 'Taslak'}</Badge>
                    </div>
                    <p className="mt-0.5 font-mono text-[12px] text-steel dark:text-white/40">dekortools.com{selectedPage.path}</p>
                    <p className="mt-0.5 text-[11.5px] text-steel dark:text-white/40">Son yayın: {selectedPage.lastPublished} · Yönetilir: {selectedPage.linkedModule}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedPageSeoScore !== undefined && (
                      <Badge tone={selectedPageSeoScore >= 80 ? 'success' : selectedPageSeoScore >= 50 ? 'warning' : 'danger'}>
                        <Globe2 size={9} className="mr-0.5 inline" /> SEO %{selectedPageSeoScore}
                      </Badge>
                    )}
                    {selectedPageSeoRow && !selectedPageSeoRow.ogImage && (
                      <Badge tone="warning">OG Görseli Yok</Badge>
                    )}
                    <Link href={selectedPage.linkedHref}>
                      <span className="flex items-center gap-1.5 rounded-soft border border-border px-3 py-1.5 text-[12.5px] font-medium text-near-black transition-colors hover:bg-mist dark:border-white/10 dark:text-white dark:hover:bg-white/5">
                        <ExternalLink size={12} /> Tam Oluşturucuyu Aç
                      </span>
                    </Link>
                  </div>
                </div>
              </Card>

              {selectedPageLinks && (selectedPageLinks.outgoing.length > 0 || selectedPageLinks.incoming.length > 0) && (
                <Card className="p-4">
                  <p className="mb-3 text-body-sm font-medium text-near-black dark:text-white/85">Sayfa Bağımlılıkları</p>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                        <ArrowRight size={11} /> Giden Bağlantılar ({selectedPageLinks.outgoing.length})
                      </p>
                      {selectedPageLinks.outgoing.length === 0 ? (
                        <p className="text-[12px] text-steel dark:text-white/40">Bu sayfadan çıkan buton bağlantısı yok.</p>
                      ) : (
                        <ul className="flex flex-col gap-1.5">
                          {selectedPageLinks.outgoing.map((link, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 text-[12.5px]">
                              <span className="truncate text-near-black dark:text-white/80">{link.label} <span className="text-steel dark:text-white/40">({link.sectionName})</span></span>
                              {link.targetPage ? (
                                <button type="button" onClick={() => setSelectedPageId(link.targetPage!.id)} className="shrink-0 font-medium text-red hover:underline dark:text-red-eyebrow">
                                  {link.targetPage.name}
                                </button>
                              ) : (
                                <span className="shrink-0 font-mono text-[11px] text-steel dark:text-white/40">{link.href}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                        <ArrowLeft size={11} /> Gelen Bağlantılar ({selectedPageLinks.incoming.length})
                      </p>
                      {selectedPageLinks.incoming.length === 0 ? (
                        <p className="text-[12px] text-steel dark:text-white/40">Başka sayfadan bu sayfaya yönlendiren buton yok.</p>
                      ) : (
                        <ul className="flex flex-col gap-1.5">
                          {selectedPageLinks.incoming.map((link, i) => (
                            <li key={i} className="text-[12.5px]">
                              <button type="button" onClick={() => setSelectedPageId(link.pageId)} className="font-medium text-red hover:underline dark:text-red-eyebrow">
                                {link.pageName}
                              </button>
                              <span className="text-steel dark:text-white/40"> — &quot;{link.buttonLabel}&quot; ({link.sectionName})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-0">
                <ul className="divide-y divide-border dark:divide-white/[.06]">
                  {selectedPageSections.map((s) => {
                    const score = computeSectionScore(s, selectedPageSeoScore);
                    const flags = computeSectionHealthFlags(s, selectedPageSeoScore);
                    const status = resolvePublishStatus(s);
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => openSection({ pageId: selectedPage.id, pageName: selectedPage.name, pagePath: selectedPage.path, pageSeoScore: selectedPageSeoScore, section: s })}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mist/50 dark:hover:bg-white/[.03]"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-soft bg-mist font-mono text-[11px] font-semibold text-steel dark:bg-white/[.06] dark:text-white/60">{s.order}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13px] font-medium text-near-black dark:text-white">{s.name}</span>
                              <Badge tone="neutral">{s.type}</Badge>
                            </span>
                          </span>
                          <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                          <Badge tone={scoreTone(score.overall)}>%{score.overall}</Badge>
                          {flags.length > 0 && <AlertTriangle size={13} className="shrink-0 text-warning" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>

      <SectionEditorDrawer
        section={activeSection?.section ?? null}
        onClose={() => setActiveSection(null)}
        onUpdate={applyUpdate}
        pageName={activeSection?.pageName}
        pageSeoScore={activeSection?.pageSeoScore}
      />
    </ContentContainer>
  );
}
