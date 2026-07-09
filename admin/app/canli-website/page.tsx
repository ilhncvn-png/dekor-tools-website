'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Monitor, Tablet, Smartphone, ChevronDown, ChevronRight, Pencil, Copy, Eye, EyeOff, History,
  Rocket, Loader2, Image as ImageIcon, Video, FileText, Settings2, ExternalLink, AlertTriangle,
  PanelLeft, Languages,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Badge } from '@/components/ui/Badge';
import { Popover } from '@/components/ui/Popover';
import { SectionEditorDrawer } from '@/components/homepage/SectionEditorDrawer';
import {
  websitePages,
  seoRows,
  mediaItems,
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
import { publishSection, resolvePublishStatus, resolveRevisions, publishStatusLabel, publishStatusTone } from '@/lib/publishing-api';
import { computeSectionHealthFlags, computeSectionScore, scoreTone, isValidButtonHref } from '@/lib/section-quality';
import { cn } from '@/lib/utils';

const CURRENT_ACTOR = 'Selin Arslan';

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
type Device = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<Device, string> = { desktop: '100%', tablet: '768px', mobile: '390px' };
const deviceIcons: Record<Device, typeof Monitor> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

/** Picks legible text color for a real section background — the canvas renders actual bg colors (light mist/white included), so white-on-white would be invisible without this. */
function textColorFor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0E0F11' : '#FFFFFF';
}

const overlayIconBtnClass = 'flex h-8 w-8 items-center justify-center rounded-soft text-white/85 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30';

/**
 * Live Website — the canvas-first editing experience. Instead of a table of
 * section records, this renders the selected page's real sections stacked
 * at a real device width, using their actual title/subtitle/description/
 * button/background data. Hovering a section reveals quick actions;
 * clicking Edit opens the exact same SectionEditorDrawer every other
 * builder uses. Nothing here is a screenshot or an iframe of a live URL —
 * there is no deployed public site this admin can fetch — so this is the
 * honest equivalent: a reactive render of the real content that updates
 * the instant a drawer edit lands in state, with no page refresh.
 */
export default function CanliWebsitePage() {
  const pagesWithSections = websitePages.filter((p) => p.sectionsKey);
  const [selectedPageId, setSelectedPageId] = useState(pagesWithSections[0]?.id ?? '');
  const [device, setDevice] = useState<Device>('desktop');
  const [structureOpen, setStructureOpen] = useState(true);
  const [expandedTreePages, setExpandedTreePages] = useState<Record<string, boolean>>({ [pagesWithSections[0]?.id ?? '']: true });
  const [sectionsByKey, setSectionsByKey] = useState<Record<SectionsKey, HomepageSection[]>>(sectionMap);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<{ pageId: string; pageName: string; pageSeoScore?: number; section: HomepageSection; initialTab?: 'icerik' | 'medya' | 'yayin' | 'saglik' | 'gelismis' } | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedPage = websitePages.find((p) => p.id === selectedPageId) ?? null;
  const selectedSections = selectedPage?.sectionsKey ? sectionsByKey[selectedPage.sectionsKey as SectionsKey] : [];
  const selectedPageSeoScore = selectedPage ? seoRows.find((r) => r.page === selectedPage.path)?.score : undefined;

  useEffect(() => {
    if (!pendingScroll) return;
    const el = sectionRefs.current[pendingScroll];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(pendingScroll);
      setPendingScroll(null);
    }
  }, [pendingScroll, selectedPageId]);

  function selectFromTree(pageId: string, sectionId: string) {
    if (pageId !== selectedPageId) setSelectedPageId(pageId);
    setPendingScroll(sectionId);
  }

  function openSection(section: HomepageSection, initialTab?: 'icerik' | 'medya' | 'yayin' | 'saglik' | 'gelismis') {
    if (!selectedPage) return;
    setActiveSection({ pageId: selectedPage.id, pageName: selectedPage.name, pageSeoScore: selectedPageSeoScore, section, initialTab });
    setHighlightedId(section.id);
  }

  function applyUpdate(updated: HomepageSection) {
    if (!activeSection || !selectedPage?.sectionsKey) return;
    const key = selectedPage.sectionsKey as SectionsKey;
    setSectionsByKey((prev) => ({ ...prev, [key]: prev[key].map((s) => (s.id === updated.id ? updated : s)) }));
    setActiveSection({ ...activeSection, section: updated });
  }

  function mutateSelected(fn: (sections: HomepageSection[]) => HomepageSection[]) {
    if (!selectedPage?.sectionsKey) return;
    const key = selectedPage.sectionsKey as SectionsKey;
    setSectionsByKey((prev) => ({ ...prev, [key]: fn(prev[key]) }));
  }

  function toggleVisible(id: string) {
    mutateSelected((sections) => sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  function duplicate(id: string) {
    mutateSelected((sections) => {
      const source = sections.find((s) => s.id === id);
      if (!source) return sections;
      const copy: HomepageSection = { ...source, id: `${source.id}-copy-${Date.now()}`, name: `${source.name} (Kopya)`, lastEdited: 'Şimdi' };
      const index = sections.findIndex((s) => s.id === id);
      const next = [...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  async function publishOne(section: HomepageSection) {
    setPublishingIds((prev) => new Set(prev).add(section.id));
    try {
      const { section: updated } = await publishSection({ section, actor: CURRENT_ACTOR });
      mutateSelected((sections) => sections.map((s) => (s.id === updated.id ? updated : s)));
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
  }

  function findMediaMatch(section: HomepageSection) {
    if (section.mediaType !== 'gorsel' && section.mediaType !== 'video') return null;
    return mediaItems.find((m) => m.name === section.mediaName || m.title === section.mediaName) ?? null;
  }

  // Page-level status rollup (Layer 7) — computed live from the selected page's real sections.
  const pageScores = selectedSections.map((s) => computeSectionScore(s, selectedPageSeoScore));
  const pageHealthFlags = selectedSections.map((s) => computeSectionHealthFlags(s, selectedPageSeoScore));
  const avgHealthScore = pageScores.length > 0 ? Math.round(pageScores.reduce((sum, s) => sum + s.overall, 0) / pageScores.length) : 0;
  const missingAssets = selectedSections.filter((s) => s.mediaType !== 'yok' && !s.mediaName).length;
  const brokenLinks = selectedSections.filter((s) => s.buttons.some((b) => !isValidButtonHref(b.href))).length;
  const draftCount = selectedSections.filter((s) => resolvePublishStatus(s) !== 'yayinda').length;
  const translationComplete = selectedSections.length > 0
    ? Math.round((selectedSections.filter((s) => s.languages.every((l) => l.complete)).length / selectedSections.length) * 100)
    : 100;
  const lastEditor = selectedSections
    .map((s) => resolveRevisions(s).slice(-1)[0])
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.author;

  return (
    <ContentContainer>
      <PageHeader
        title="Canlı Website"
        description="Sitenin kendisi — düzenleme burada bir form doldurmak değil, doğrudan sayfa üzerinde çalışmaktır. Bir bölümün üzerine gelin, Düzenle'ye tıklayın."
      />

      {/* Workspace shell — dark Webflow-style editor chrome: floating toolbar + layers panel + canvas, all one workspace */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0c0e]">
        {/* Floating toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#111316] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStructureOpen((v) => !v)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-soft transition-colors',
                structureOpen ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
              title={structureOpen ? 'Katmanları Gizle' : 'Katmanları Göster'}
            >
              <PanelLeft size={15} />
            </button>
            <div className="h-5 w-px bg-white/10" />
            <select
              value={selectedPageId}
              onChange={(e) => { setSelectedPageId(e.target.value); setHighlightedId(null); }}
              className="rounded-soft border border-white/10 bg-white/[.04] px-3 py-1.5 text-body-sm text-white outline-none focus:border-red"
            >
              {pagesWithSections.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#16181b] text-white">{p.name}</option>
              ))}
            </select>
            <Badge tone={selectedPage?.status === 'yayinda' ? 'success' : 'neutral'} dot>
              {selectedPage?.status === 'yayinda' ? 'Yayında' : 'Taslak'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[.03] p-1">
              {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => {
                const Icon = deviceIcons[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                      device === d ? 'bg-red text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                    )}
                    aria-label={d}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
            {selectedPage && (
              <button
                type="button"
                onClick={() => window.open(`https://dekortools.com${selectedPage.path}`, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-1.5 rounded-full bg-white/[.06] px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-white/10"
              >
                <ExternalLink size={13} /> Sitede Aç
              </button>
            )}
          </div>
        </div>

        {/* Compact health strip — pill chips, not a bulky metric grid */}
        {selectedPage && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#0e1013] px-4 py-2.5">
            {[
              { label: 'Sağlık', value: `%${avgHealthScore}`, danger: avgHealthScore < 60 },
              { label: 'SEO', value: selectedPageSeoScore !== undefined ? `%${selectedPageSeoScore}` : '—', danger: false },
              { label: 'Çeviri', value: `%${translationComplete}`, danger: translationComplete < 60 },
              { label: 'Eksik Varlık', value: String(missingAssets), danger: missingAssets > 0 },
              { label: 'Bozuk Bağlantı', value: String(brokenLinks), danger: brokenLinks > 0 },
              { label: 'Taslak', value: String(draftCount), danger: false },
            ].map((chip) => (
              <span
                key={chip.label}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]',
                  chip.danger ? 'border-danger/30 bg-danger/10 text-danger' : 'border-white/10 bg-white/[.03] text-white/70'
                )}
              >
                <span className="text-white/40">{chip.label}</span>
                <span className="font-semibold">{chip.value}</span>
              </span>
            ))}
            <span className="ml-auto text-[11px] text-white/35">Son düzenleyen: <span className="text-white/60">{lastEditor ?? '—'}</span></span>
          </div>
        )}

        <div className={cn('grid grid-cols-1', structureOpen && 'laptop:grid-cols-[260px_1fr]')}>
          {structureOpen && (
            <div className="max-h-[80vh] overflow-y-auto border-r border-white/10 bg-[#0e1013] p-2">
              <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-white/30">Katmanlar</p>
              {pagesWithSections.map((p) => {
                const isTreeOpen = expandedTreePages[p.id] ?? p.id === selectedPageId;
                const sections = sectionsByKey[p.sectionsKey as SectionsKey];
                return (
                  <div key={p.id} className="mb-1">
                    <button
                      type="button"
                      onClick={() => setExpandedTreePages((prev) => ({ ...prev, [p.id]: !isTreeOpen }))}
                      className="flex w-full items-center gap-1.5 rounded-soft px-2 py-1.5 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-white/85 hover:bg-white/[.05]"
                    >
                      {isTreeOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {p.name}
                    </button>
                    {isTreeOpen && (
                      <ul className="ml-4 border-l border-white/10 pl-2">
                        {sections.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => selectFromTree(p.id, s.id)}
                              className={cn(
                                'flex w-full items-center gap-1.5 truncate rounded-soft px-2 py-1 text-left text-[12.5px] transition-colors hover:bg-white/[.06] hover:text-white',
                                highlightedId === s.id && p.id === selectedPageId ? 'bg-red/15 font-medium text-white' : 'text-white/50'
                              )}
                            >
                              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', highlightedId === s.id && p.id === selectedPageId ? 'bg-red' : 'bg-white/15')} />
                              <span className="truncate">{s.name}</span>
                              {!s.visible && <Badge tone="neutral">Gizli</Badge>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Website Canvas */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#0e1013] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-2 flex-1 truncate rounded-full bg-white/[.06] px-3 py-1 text-center font-mono text-[11.5px] text-white/50">
                dekortools.com{selectedPage?.path}
              </span>
            </div>
            <div className="flex justify-center overflow-x-auto bg-[#050607] p-8">
              <div
                className="flex flex-col overflow-hidden rounded-soft shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-all duration-slow ease-premium"
                style={{ width: deviceWidths[device] }}
              >
              {selectedSections.map((section, i) => {
                const textColor = textColorFor(section.backgroundColor);
                const status = resolvePublishStatus(section);
                const flags = computeSectionHealthFlags(section, selectedPageSeoScore);
                const score = computeSectionScore(section, selectedPageSeoScore);
                const isPublishing = publishingIds.has(section.id);
                const mediaMatch = findMediaMatch(section);
                const MediaIcon = section.mediaType === 'video' ? Video : section.mediaType === 'belge' ? FileText : ImageIcon;
                const revisions = resolveRevisions(section);
                return (
                  <div
                    key={section.id}
                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-3 px-6 py-14 text-center transition-shadow',
                      highlightedId === section.id && 'z-10 ring-4 ring-inset ring-red shadow-[0_0_0_6px_rgba(211,32,39,0.15)]',
                      !section.visible && 'opacity-40'
                    )}
                    style={{ backgroundColor: section.backgroundColor }}
                  >
                    {highlightedId === section.id && (
                      <span className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-red px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-white shadow-elevation-floating">
                        <Pencil size={10} /> Düzenleniyor
                      </span>
                    )}
                    {section.eyebrow && (
                      <span className="font-mono text-[11px] uppercase tracking-[2px]" style={{ color: textColor, opacity: 0.6 }}>{section.eyebrow}</span>
                    )}
                    {section.title && (
                      <h2 className="max-w-2xl text-heading-md font-bold" style={{ color: textColor }}>{section.title}</h2>
                    )}
                    {section.subtitle && (
                      <p className="max-w-xl text-body-md" style={{ color: textColor, opacity: 0.75 }}>{section.subtitle}</p>
                    )}
                    {section.description && (
                      <p className="max-w-xl text-body-sm" style={{ color: textColor, opacity: 0.6 }}>{section.description}</p>
                    )}
                    {section.buttons.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                        {section.buttons.map((b, bi) => (
                          <span
                            key={bi}
                            className={cn(
                              'rounded-sharp px-4 py-2 text-[13px] font-medium',
                              b.style === 'birincil' ? 'bg-red text-white' : 'border'
                            )}
                            style={b.style !== 'birincil' ? { borderColor: textColor, color: textColor } : undefined}
                          >
                            {b.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {section.mediaType !== 'yok' && (
                      <button
                        type="button"
                        onClick={() => mediaMatch ? window.open(`/medya-kutuphanesi?asset=${mediaMatch.id}`, '_self') : openSection(section, 'medya')}
                        className="mt-2 flex h-20 w-36 items-center justify-center gap-1.5 rounded-soft border border-dashed text-[11px] transition-colors hover:opacity-80"
                        style={{ borderColor: textColor, color: textColor, opacity: 0.55 }}
                        title={mediaMatch ? 'Medya Kütüphanesinde aç' : 'Medya seçilmedi — düzenleyiciyi aç'}
                      >
                        <MediaIcon size={14} /> {section.mediaName || 'Medya yok'}
                      </button>
                    )}

                    {/* section badge strip */}
                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1">
                      <Badge tone={publishStatusTone[status]} dot>{publishStatusLabel[status]}</Badge>
                      <Badge tone={scoreTone(score.overall)}>%{score.overall}</Badge>
                      {flags.length > 0 && <AlertTriangle size={13} className="text-warning" />}
                    </div>
                    <span className="absolute right-3 top-3 font-mono text-[10.5px] opacity-40" style={{ color: textColor }}>#{i + 1} {section.name}</span>

                    {/* hover overlay — click to edit */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                      <p className="text-[13px] font-semibold text-white">{section.name}</p>
                      <div className="flex flex-wrap items-center justify-center gap-1 rounded-soft bg-black/40 p-1.5">
                        <button type="button" onClick={() => openSection(section, 'icerik')} className={overlayIconBtnClass} aria-label="Düzenle" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => duplicate(section.id)} className={overlayIconBtnClass} aria-label="Çoğalt" title="Çoğalt">
                          <Copy size={15} />
                        </button>
                        <button type="button" onClick={() => toggleVisible(section.id)} className={overlayIconBtnClass} aria-label={section.visible ? 'Gizle' : 'Göster'} title={section.visible ? 'Gizle' : 'Göster'}>
                          {section.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button type="button" onClick={() => openSection(section, 'medya')} className={overlayIconBtnClass} aria-label="Medya" title="Medya">
                          <ImageIcon size={15} />
                        </button>
                        <button type="button" onClick={() => openSection(section, 'gelismis')} className={overlayIconBtnClass} aria-label="SEO ve Ayarlar" title="SEO ve Ayarlar">
                          <Settings2 size={15} />
                        </button>
                        <Popover
                          align="end"
                          width={260}
                          trigger={({ toggle }) => (
                            <button type="button" onClick={toggle} className={overlayIconBtnClass} aria-label="Revizyonlar" title="Revizyonlar">
                              <History size={15} />
                            </button>
                          )}
                        >
                          <div className="max-h-64 overflow-y-auto p-1">
                            {[...revisions].reverse().slice(0, 3).map((rev) => (
                              <div key={rev.id} className="px-2.5 py-2 text-[12px]">
                                <p className="font-medium text-near-black dark:text-white/85">
                                  <span className="font-mono text-[10.5px] text-steel dark:text-white/40">{rev.versionLabel}</span> · {rev.author}
                                </p>
                                <p className="text-steel dark:text-white/40">{rev.date}</p>
                                <p className="mt-0.5 text-steel dark:text-white/50">{rev.changeSummary}</p>
                              </div>
                            ))}
                          </div>
                        </Popover>
                        {status !== 'yayinda' && (
                          <button
                            type="button"
                            onClick={() => publishOne(section)}
                            disabled={isPublishing}
                            className={overlayIconBtnClass}
                            aria-label="Yayınla"
                            title="Yayınla"
                          >
                            {isPublishing ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />}
                          </button>
                        )}
                        {selectedPage && (
                          <button
                            type="button"
                            onClick={() => window.open(`https://dekortools.com${selectedPage.path}`, '_blank', 'noopener,noreferrer')}
                            className={overlayIconBtnClass}
                            aria-label="Sitede Görüntüle"
                            title="Sitede Görüntüle"
                          >
                            <ExternalLink size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {selectedSections.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
                  <Languages size={20} className="text-steel dark:text-white/30" />
                  <p className="text-body-sm text-steel dark:text-white/40">Bu sayfa için henüz bölüm yok.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <SectionEditorDrawer
        section={activeSection?.section ?? null}
        onClose={() => setActiveSection(null)}
        onUpdate={applyUpdate}
        pageName={activeSection?.pageName}
        pagePath={selectedPage?.path}
        pageSeoScore={activeSection?.pageSeoScore}
        initialTab={activeSection?.initialTab}
      />
    </ContentContainer>
  );
}
