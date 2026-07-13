import type { GlobalBanner } from '@/lib/mock-data';
import type { BannerInput } from '@/lib/validation/banner';

// Maps a database Banner (with translations) to the exact `GlobalBanner` shape
// the Global Components screen consumes, and back. Mirrors the other adapters.

type DbBanner = {
  id: string;
  key: string;
  name: string;
  bannerType: string;
  placement: string;
  placements: string[];
  status: string;
  translations: { languageCode: string; headline: string | null; body: string | null; ctaLabel: string | null; ctaUrl: string | null }[];
};

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return (
    input
      .trim()
      .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'banner'
  );
}

export function toUiBanner(db: DbBanner): GlobalBanner {
  const tr = db.translations.find((t) => t.languageCode === 'tr');
  return {
    id: db.id,
    name: db.name || db.key,
    type: db.bannerType === 'CTA' ? 'CTA' : 'Banner',
    message: tr?.headline ?? tr?.body ?? '',
    buttonLabel: tr?.ctaLabel ?? '',
    buttonHref: tr?.ctaUrl ?? '',
    placements: db.placements,
    active: db.status === 'PUBLISHED',
  };
}

export function toBannerInput(ui: GlobalBanner): BannerInput {
  return {
    key: slugifyTr(ui.name || ui.id),
    // Primary placement kept for the fast published-by-placement query; the full
    // set lives in `placements`.
    placement: slugifyTr(ui.placements[0] ?? 'genel'),
    name: ui.name,
    bannerType: ui.type,
    placements: ui.placements,
    translations: [
      {
        languageCode: 'tr',
        headline: ui.message || undefined,
        ctaLabel: ui.buttonLabel || undefined,
        ctaUrl: ui.buttonHref || undefined,
      },
    ],
    slideMediaIds: [],
  };
}
