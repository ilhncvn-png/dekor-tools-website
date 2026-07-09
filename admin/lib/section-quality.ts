/**
 * Shared section "health + score" model — the real signals behind the
 * Website Control Center's Layer 7 (health flags) and Layer 8 (content
 * score). Every number and flag here is derived from fields that already
 * exist on HomepageSection / MediaItem / SeoRow — nothing here is fabricated
 * display data, so it stays correct as the underlying fixtures change.
 *
 * Used by SectionListEditor (per-row flags/score), SectionEditorDrawer (the
 * "Sağlık & Skor" tab) and app/website-yapisi (the site-wide map) — one
 * implementation, three surfaces, per the "improve architecture, don't
 * duplicate it" directive.
 */

import { mediaItems, type HomepageSection } from './mock-data';
import { resolvePublishStatus } from './publishing-api';

/** A button href is valid when it's a real internal path, a real external URL, a real in-page anchor (e.g. `#contact`), or a real `tel:`/`mailto:` contact link (Become a Dealer's "Talk to our export team" cards genuinely link to a phone number and an email address, not a page route). */
export function isValidButtonHref(href: string): boolean {
  return Boolean(href) && (href.startsWith('/') || href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:'));
}

export interface HealthFlag {
  code: string;
  label: string;
  tone: 'danger' | 'warning' | 'neutral';
}

/** Section `lastEdited` values older than this are flagged as outdated. Freeform values like "Şimdi" are ignored (not a real date). */
const OUTDATED_BEFORE = '2026-05-01';
const isRealDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function computeSectionHealthFlags(section: HomepageSection, pageSeoScore?: number): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const status = resolvePublishStatus(section);
  const typeLower = section.type.toLowerCase();

  if (!section.visible) flags.push({ code: 'hidden', label: 'Gizli', tone: 'neutral' });
  if (status === 'taslak') flags.push({ code: 'draft', label: 'Taslak', tone: 'warning' });

  if (section.mediaType === 'gorsel' && !section.mediaName) flags.push({ code: 'missing-image', label: 'Görsel Eksik', tone: 'danger' });
  if (section.mediaType === 'video' && !section.mediaName) flags.push({ code: 'missing-video', label: 'Video Eksik', tone: 'danger' });

  if (section.languages.some((l) => !l.complete)) flags.push({ code: 'translation-missing', label: 'Çeviri Eksik', tone: 'warning' });

  if (typeof pageSeoScore === 'number' && pageSeoScore < 50) flags.push({ code: 'seo-weak', label: 'SEO Zayıf', tone: 'warning' });

  if (typeLower.includes('cta') && section.buttons.length === 0) flags.push({ code: 'cta-missing', label: 'CTA Eksik', tone: 'danger' });

  const hasBrokenLink = section.buttons.some((b) => !isValidButtonHref(b.href));
  if (hasBrokenLink) flags.push({ code: 'broken-link', label: 'Bozuk Bağlantı', tone: 'danger' });

  if (isRealDate(section.lastEdited) && section.lastEdited < OUTDATED_BEFORE) {
    flags.push({ code: 'outdated', label: 'Güncelliğini Yitirmiş', tone: 'neutral' });
  }

  if (section.mediaName) {
    const matched = mediaItems.find((m) => m.name === section.mediaName || m.title === section.mediaName);
    if (matched && matched.usageCount === 0) flags.push({ code: 'unused-asset', label: 'Kullanılmayan Varlık', tone: 'neutral' });
  }

  return flags;
}

export interface SectionScore {
  visual: number;
  seo: number;
  translation: number;
  media: number;
  accessibility: number;
  publishing: number;
  overall: number;
}

const publishingScore: Record<string, number> = { yayinda: 100, zamanlandi: 70, taslak: 40, arsivlendi: 0 };

export function computeSectionScore(section: HomepageSection, pageSeoScore?: number): SectionScore {
  const visualChecks = [
    Boolean(section.title),
    Boolean(section.description || section.subtitle),
    section.mediaType === 'yok' || Boolean(section.mediaName),
    !section.type.toLowerCase().includes('cta') || section.buttons.length > 0,
  ];
  const visual = Math.round((visualChecks.filter(Boolean).length / visualChecks.length) * 100);

  const seo = typeof pageSeoScore === 'number' ? pageSeoScore : section.seoNote ? 100 : 50;

  const translation = section.languages.length === 0
    ? 100
    : Math.round((section.languages.filter((l) => l.complete).length / section.languages.length) * 100);

  const media = section.mediaType === 'yok' || Boolean(section.mediaName) ? 100 : 0;

  const matchedMedia = section.mediaType === 'gorsel' && section.mediaName
    ? mediaItems.find((m) => m.name === section.mediaName || m.title === section.mediaName)
    : undefined;
  const accessibility = section.mediaType !== 'gorsel' ? 100 : matchedMedia?.altText ? 100 : 0;

  const publishing = publishingScore[resolvePublishStatus(section)] ?? 0;

  const overall = Math.round((visual + seo + translation + media + accessibility + publishing) / 6);

  return { visual, seo, translation, media, accessibility, publishing, overall };
}

export function scoreTone(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 80) return 'success';
  if (value >= 50) return 'warning';
  return 'danger';
}
