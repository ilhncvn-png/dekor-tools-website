/**
 * Shared "relationship graph" utilities for the Website Digital Twin —
 * every function here derives real connections (page ↔ section ↔ button ↔
 * media ↔ page) from data that already exists elsewhere (websitePages,
 * the per-page section arrays, mediaItems, seoRows). Nothing is
 * pre-aggregated fixture data; everything is computed live so it can never
 * drift out of sync with the actual content.
 *
 * Used by Website Explorer (the Digital Twin view) and reused by
 * SectionEditorDrawer's media-relationship block — one implementation for
 * both, per the "no duplicated logic" rule.
 */

import {
  websitePages, seoRows,
  homepageSections, aboutSections, manufacturingSections, exportSections, dealerPageSections,
  supportSections, newsroomSections, careerSections, productDetailSections, categoryTemplateSections,
  newsDetailSections, contactPageSections, productsLandingSections, becomeDealerSections,
  type WebsitePage, type HomepageSection,
} from './mock-data';
import { computeSectionHealthFlags, type HealthFlag } from './section-quality';

const ALL_SECTIONS_MAP = {
  homepageSections, aboutSections, manufacturingSections, exportSections, dealerPageSections,
  supportSections, newsroomSections, careerSections, productDetailSections, categoryTemplateSections,
  newsDetailSections, contactPageSections, productsLandingSections, becomeDealerSections,
} as const;

type AllSectionsKey = keyof typeof ALL_SECTIONS_MAP;

export interface FlatSection {
  pageId: string;
  pageName: string;
  pagePath: string;
  pageSeoScore?: number;
  section: HomepageSection;
}

/** Parses a real `usedIn`/`linkedTo` string like "Ana Sayfa — Ürün Vitrini" into its page-name part. Falls back to the whole string when there's no separator. */
export function derivePageNameFromPlacement(placement: string): string {
  const idx = placement.indexOf(' — ');
  return idx === -1 ? placement : placement.slice(0, idx);
}

/** The section-name part of the same placement string. */
export function deriveSectionNameFromPlacement(placement: string): string {
  const idx = placement.indexOf(' — ');
  return idx === -1 ? placement : placement.slice(idx + 3);
}

/** Finds the real section a media/file "usedIn" placement string refers to, so relation chips can jump straight to the editor instead of just naming a location. */
export function findSectionByPlacement(flatSections: FlatSection[], placement: string): FlatSection | null {
  const sectionNamePart = deriveSectionNameFromPlacement(placement);
  return flatSections.find((row) => row.section.name === sectionNamePart || row.section.name.includes(sectionNamePart)) ?? null;
}

export interface ButtonStyleGroup {
  style: string;
  count: number;
  placements: { pageId: string; pageName: string; sectionId: string; sectionName: string; label: string }[];
}

/** Groups every real button across the whole site by its visual style ("birincil"/"ikincil"/"metin") — the honest stand-in for "Component Relationships" since buttons aren't modeled as a separate component library. */
export function groupButtonsByStyle(flatSections: FlatSection[]): ButtonStyleGroup[] {
  const map = new Map<string, ButtonStyleGroup>();
  for (const row of flatSections) {
    for (const b of row.section.buttons) {
      if (!map.has(b.style)) map.set(b.style, { style: b.style, count: 0, placements: [] });
      const group = map.get(b.style)!;
      group.count += 1;
      group.placements.push({ pageId: row.pageId, pageName: row.pageName, sectionId: row.section.id, sectionName: row.section.name, label: b.label });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export interface ColorUsageGroup {
  color: string;
  count: number;
  pages: string[];
}

/** Groups every real section background color across the site — the honest stand-in for a "Color Design Token" impact graph, since colors are stored as hex values per section, not as named tokens referenced by components. */
export function groupSectionsByColor(flatSections: FlatSection[]): ColorUsageGroup[] {
  const map = new Map<string, { count: number; pages: Set<string> }>();
  for (const row of flatSections) {
    const color = row.section.backgroundColor;
    if (!map.has(color)) map.set(color, { count: 0, pages: new Set() });
    const group = map.get(color)!;
    group.count += 1;
    group.pages.add(row.pageName);
  }
  return Array.from(map.entries())
    .map(([color, g]) => ({ color, count: g.count, pages: Array.from(g.pages) }))
    .sort((a, b) => b.count - a.count);
}

export interface PageLinkInfo {
  outgoing: { label: string; href: string; sectionName: string; targetPage: WebsitePage | null }[];
  incoming: { pageId: string; pageName: string; sectionName: string; buttonLabel: string }[];
}

/** For a given page, finds every real outgoing button link (and which of those resolve to another known public page) and every real incoming link from other pages' sections — genuine Page Dependencies, derived from button hrefs vs. real page paths, not a fabricated link graph. */
export function computePageLinks(page: WebsitePage, flatSections: FlatSection[], allPages: WebsitePage[]): PageLinkInfo {
  const matchesPath = (href: string, path: string) => href === path || (href.includes('#') && href.split('#')[0] === path);

  const outgoing = flatSections
    .filter((r) => r.pageId === page.id)
    .flatMap((r) => r.section.buttons.map((b) => ({
      label: b.label,
      href: b.href,
      sectionName: r.section.name,
      targetPage: allPages.find((p) => matchesPath(b.href, p.path)) ?? null,
    })));

  const incoming = flatSections
    .filter((r) => r.pageId !== page.id)
    .flatMap((r) => r.section.buttons
      .filter((b) => matchesPath(b.href, page.path))
      .map((b) => ({ pageId: r.pageId, pageName: r.pageName, sectionName: r.section.name, buttonLabel: b.label })));

  return { outgoing, incoming };
}

export interface SiteHealthEntry {
  row: FlatSection;
  flag: HealthFlag;
}

/** Flattens every real per-section health flag across the whole site into one itemized list — the data behind a "Website Intelligence" panel, each entry pointing back to its real section so it can be fixed in one click. */
export function siteWideHealthFlags(flatSections: FlatSection[]): SiteHealthEntry[] {
  return flatSections.flatMap((row) => computeSectionHealthFlags(row.section, row.pageSeoScore).map((flag) => ({ row, flag })));
}

/**
 * The canonical, read-only flattened section list for the whole real site —
 * one implementation shared by every screen that needs "all sections across
 * all pages" (Website Sağlığı, Operasyon Merkezi) instead of each screen
 * re-declaring its own copy of the 14-array section map. Screens that need
 * to *edit* sections (Website Explorer, Canlı Website) still keep their own
 * `useState` copy seeded from these same arrays, since this function returns
 * a fresh snapshot, not shared mutable state.
 */
export function getAllFlatSections(): FlatSection[] {
  const rows: FlatSection[] = [];
  for (const page of websitePages) {
    if (!page.sectionsKey) continue;
    const sections = ALL_SECTIONS_MAP[page.sectionsKey as AllSectionsKey];
    const seoScore = seoRows.find((r) => r.page === page.path)?.score;
    for (const section of sections) {
      rows.push({ pageId: page.id, pageName: page.name, pagePath: page.path, pageSeoScore: seoScore, section });
    }
  }
  return rows;
}

/** Pages with zero real incoming links from any other page's buttons (and that aren't the homepage) — a genuine, derived "Orphan Page" signal. */
export function findOrphanPages(flatSections: FlatSection[], allPages: WebsitePage[]): WebsitePage[] {
  return allPages.filter((p) => {
    if (p.path === '/' || !p.sectionsKey) return false;
    const { incoming } = computePageLinks(p, flatSections, allPages);
    return incoming.length === 0;
  });
}

/** Sections with no title, no description, and no media — genuinely empty content blocks, not just low-scoring ones. */
export function findEmptySections(flatSections: FlatSection[]): FlatSection[] {
  return flatSections.filter((row) => !row.section.title && !row.section.description && row.section.mediaType === 'yok');
}
