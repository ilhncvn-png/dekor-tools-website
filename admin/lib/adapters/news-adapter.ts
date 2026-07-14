import type { NewsArticle } from '@/lib/mock-data';
import type { NewsInput } from '@/lib/validation/news';

// Maps a database NewsArticle (with translations) to the exact `NewsArticle`
// shape the Newsroom UI consumes, and back. Mirrors the other adapters.

type DbNews = {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
  categoryKey: string;
  tags: string[];
  readingTime: string | null;
  displayDate: Date | null;
  galleryMediaIds: string[];
  createdAt: Date;
  translations: {
    languageCode: string;
    title: string;
    slug: string;
    excerpt: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
};

const CATEGORIES = ['News', 'Trade Shows', 'Training Academy', 'Company Life'] as const;
type NewsCat = NewsArticle['category'];

function normalizeCategory(key: string): NewsCat {
  return (CATEGORIES as readonly string[]).includes(key) ? (key as NewsCat) : 'News';
}

export function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return (
    input
      .trim()
      .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'makale'
  );
}

export function toUiNews(db: DbNews): NewsArticle {
  const tr = db.translations.find((t) => t.languageCode === 'tr') ?? db.translations[0];
  const date = (db.displayDate ?? db.createdAt).toISOString().slice(0, 10);
  return {
    id: db.id,
    slug: tr?.slug ?? db.slug,
    category: normalizeCategory(db.categoryKey),
    date,
    readingTime: db.readingTime ?? '1 min read',
    title: tr?.title ?? '(başlıksız)',
    excerpt: tr?.excerpt ?? '',
    featured: db.featured,
    status: db.status === 'PUBLISHED' ? 'yayinda' : 'taslak',
    gallery: db.galleryMediaIds,
    tags: db.tags,
    metaTitle: tr?.metaTitle ?? undefined,
    metaDescription: tr?.metaDescription ?? undefined,
  };
}

export function toNewsInput(ui: NewsArticle): NewsInput {
  const slug = ui.slug && ui.slug.trim() ? ui.slug : slugifyTr(ui.title);
  return {
    categoryKey: ui.category,
    featured: ui.featured,
    tags: ui.tags ?? [],
    readingTime: ui.readingTime || null,
    displayDate: ui.date || null,
    galleryMediaIds: ui.gallery ?? [],
    translations: [
      {
        languageCode: 'tr',
        title: ui.title,
        slug,
        excerpt: ui.excerpt || undefined,
        metaTitle: ui.metaTitle || undefined,
        metaDescription: ui.metaDescription || undefined,
      },
    ],
  };
}
