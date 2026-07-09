'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, ChevronDown, ImageOff, Globe2, AlertTriangle, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionEditorDrawer } from '@/components/homepage/SectionEditorDrawer';
import {
  websitePages,
  seoRows,
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
import { resolvePublishStatus, publishStatusLabel, publishStatusTone } from '@/lib/publishing-api';
import { computeSectionHealthFlags, computeSectionScore, scoreTone } from '@/lib/section-quality';
import { cn } from '@/lib/utils';

const initialSectionMap = {
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

type SectionsKey = keyof typeof initialSectionMap;

/**
 * Website Inspect Mode — the visual map of every real Decor page and its
 * real sections. Every row shows publish state, SEO/media/translation
 * status and completion at a glance, and clicking a section opens the
 * SAME SectionEditorDrawer used by every page builder — Edit → Save →
 * Preview → Publish, without leaving this screen.
 */
export default function WebsiteYapisiPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sectionsByKey, setSectionsByKey] = useState<Record<SectionsKey, HomepageSection[]>>(initialSectionMap);
  const [activeSection, setActiveSection] = useState<{ key: SectionsKey; section: HomepageSection; pageName: string; pageSeoScore?: number } | null>(null);

  function applyUpdate(updated: HomepageSection) {
    if (!activeSection) return;
    const key = activeSection.key;
    setSectionsByKey((prev) => ({
      ...prev,
      [key]: prev[key].map((s) => (s.id === updated.id ? updated : s)),
    }));
    setActiveSection({ ...activeSection, section: updated });
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Website Yapısı"
        description="dekortools.com sitesindeki tüm sayfaların ve bölümlerin görsel haritası — her bölüm yayın durumunu, eksiklerini gösterir ve tıklandığında doğrudan düzenleyiciyi açar."
      />

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {websitePages.map((page) => {
          const sections = page.sectionsKey ? sectionsByKey[page.sectionsKey as SectionsKey] : null;
          const isOpen = expanded[page.id];
          const seoRow = seoRows.find((r) => r.page === page.path);
          const avgCompletion = sections && sections.length > 0
            ? Math.round(sections.reduce((sum, s) => sum + computeSectionScore(s, seoRow?.score).overall, 0) / sections.length)
            : null;

          return (
            <Card key={page.id} className="p-0">
              <Link href={page.linkedHref} className="block p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-heading-sm text-near-black dark:text-white">{page.name}</h3>
                  <Badge tone={page.status === 'yayinda' ? 'success' : 'neutral'} dot>
                    {page.status === 'yayinda' ? 'Yayında' : 'Taslak'}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-[12px] text-steel dark:text-white/40">{page.path}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {seoRow && (
                    <Badge tone={seoRow.score >= 80 ? 'success' : seoRow.score >= 50 ? 'warning' : 'danger'}>
                      <Globe2 size={9} className="mr-0.5 inline" /> SEO %{seoRow.score}
                    </Badge>
                  )}
                  {avgCompletion !== null && (
                    <Badge tone={avgCompletion >= 90 ? 'success' : avgCompletion >= 70 ? 'warning' : 'danger'}>
                      Tamamlanma %{avgCompletion}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 dark:border-white/[.06]">
                  <span className="text-[12px] text-steel dark:text-white/50">Yönetilir: {page.linkedModule}</span>
                  <ArrowRight size={13} className="shrink-0 text-steel dark:text-white/40" />
                </div>
                <p className="mt-1 text-[11px] text-steel/70 dark:text-white/30">Son yayın: {page.lastPublished}</p>
              </Link>

              {sections && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [page.id]: !prev[page.id] }))}
                    className="flex w-full items-center justify-between border-t border-border px-5 py-2.5 text-[12px] font-medium text-steel transition-colors hover:bg-mist/50 dark:border-white/[.06] dark:text-white/50 dark:hover:bg-white/[.03]"
                  >
                    {sections.length} bölüm
                    <ChevronDown size={13} className={cn('transition-transform duration-fast', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <ul className="border-t border-border bg-mist/40 dark:border-white/[.06] dark:bg-white/[.02]">
                      {sections.map((s) => {
                        const warnings = computeSectionHealthFlags(s, seoRow?.score);
                        const completion = computeSectionScore(s, seoRow?.score).overall;
                        const status = resolvePublishStatus(s);
                        return (
                          <li key={s.id} className="border-b border-border last:border-b-0 dark:border-white/[.06]">
                            <button
                              type="button"
                              onClick={() => setActiveSection({ key: page.sectionsKey as SectionsKey, section: s, pageName: page.name, pageSeoScore: seoRow?.score })}
                              className="group flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors hover:bg-white dark:hover:bg-white/[.03]"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="truncate text-[12px] text-near-black dark:text-white/80">{s.order}. {s.name}</span>
                                  {!s.visible && <Badge tone="neutral">Gizli</Badge>}
                                </span>
                                <span className="mt-1 flex items-center gap-2">
                                  <ProgressBar value={completion} tone={scoreTone(completion)} className="w-16" />
                                  <span className="text-[10.5px] tabular-nums text-steel dark:text-white/40">%{completion}</span>
                                </span>
                              </span>
                              <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                              {warnings.length > 0 && (
                                <span title={warnings.map((w) => w.label).join(', ')} className="shrink-0 text-warning">
                                  <AlertTriangle size={13} />
                                </span>
                              )}
                              {s.mediaType !== 'yok' && !s.mediaName && (
                                <span title="Medya seçilmedi" className="shrink-0 text-danger">
                                  <ImageOff size={13} />
                                </span>
                              )}
                              <Pencil size={12} className="shrink-0 text-steel opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </Card>
          );
        })}

        <a href="https://dekortools.com" target="_blank" rel="noopener noreferrer" className="block">
          <Card interactive className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
            <ExternalLink size={20} className="text-steel dark:text-white/40" />
            <p className="text-body-sm font-medium text-near-black dark:text-white">Canlı Siteyi Görüntüle</p>
            <p className="text-[12px] text-steel dark:text-white/40">dekortools.com</p>
          </Card>
        </a>
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
