import type { Product } from '@/lib/mock-data';
import type { ProductInput } from '@/lib/validation/product';

// Maps a database Product (with relations) to the exact shape the existing
// Product Management UI already consumes (lib/mock-data.ts's `Product`), and
// back again — so the admin screen stays visually/structurally unchanged while
// its data source becomes real PostgreSQL. Mirrors the Category adapter.

type DbProductTranslation = {
  languageCode: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

type DbProduct = {
  id: string;
  sku: string;
  slug: string;
  status: string;
  categoryId: string | null;
  featured: boolean;
  stockState: string;
  price: string | null;
  weightKg: number | null;
  exportCountries: number;
  swatch: string | null;
  videoMediaId: string | null;
  documentId: string | null;
  ogImageMediaId: string | null;
  relatedProductIds: string[];
  updatedAt: Date;
  translations: DbProductTranslation[];
  category: { key: string; translations: { languageCode: string; name: string }[] } | null;
  media: { mediaId: string; role: string; sortOrder: number }[];
  specs: { languageCode: string; label: string; value: string; sortOrder: number }[];
};

const DB_TO_UI_STATUS: Record<string, Product['status']> = {
  PUBLISHED: 'yayinda',
  ARCHIVED: 'arsiv',
  // UNPUBLISHED = "was live, taken down" — closer to a draft than an archive,
  // and it lets the drawer's "taslak" selection round-trip via unpublishProduct.
  UNPUBLISHED: 'taslak',
  DRAFT: 'taslak',
  IN_REVIEW: 'taslak',
  SCHEDULED: 'taslak',
};

const DB_TO_UI_STOCK: Record<string, Product['stock']> = {
  IN_STOCK: 'stokta',
  LOW_STOCK: 'az-stok',
  OUT_OF_STOCK: 'tukendi',
};

const UI_TO_DB_STOCK: Record<Product['stock'], ProductInput['stockState']> = {
  stokta: 'IN_STOCK',
  'az-stok': 'LOW_STOCK',
  tukendi: 'OUT_OF_STOCK',
};

// Turkish-aware slug: transliterate ç/ğ/ı/ö/ş/ü before stripping non-ascii, so
// a Turkish product name yields a valid `[a-z0-9-]` slug (the naive path would
// drop those letters or produce an invalid slug the validator rejects).
export function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return input
    .trim()
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function computeProductSeo(tr: DbProductTranslation | undefined): number {
  if (!tr) return 0;
  let score = 0;
  if (tr.name) score += 20;
  if (tr.description && tr.description.length >= 40) score += 20;
  if (tr.metaTitle && tr.metaTitle.length >= 10) score += 20;
  if (tr.metaDescription && tr.metaDescription.length >= 40) score += 20;
  if (tr.slug) score += 20;
  return score;
}

export function toUiProduct(db: DbProduct): Product {
  const byLang = new Map(db.translations.map((t) => [t.languageCode, t]));
  const tr = byLang.get('tr');
  const catName = db.category?.translations.find((t) => t.languageCode === 'tr')?.name ?? db.category?.key ?? '';
  const gallery = [...db.media].sort((a, b) => a.sortOrder - b.sortOrder).map((m) => m.mediaId);
  const specifications = [...db.specs]
    .filter((s) => s.languageCode === 'tr')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({ label: s.label, value: s.value }));

  return {
    id: db.id,
    name: tr?.name ?? db.sku,
    sku: db.sku,
    category: catName,
    categoryId: db.categoryId ?? undefined,
    status: DB_TO_UI_STATUS[db.status] ?? 'taslak',
    countries: db.exportCountries,
    updatedAt: db.updatedAt.toISOString().slice(0, 10),
    seoScore: computeProductSeo(tr),
    stock: DB_TO_UI_STOCK[db.stockState] ?? 'stokta',
    price: db.price ?? '',
    description: tr?.description ?? '',
    weightKg: db.weightKg ?? 0,
    swatch: db.swatch ?? '#0E0F11',
    featured: db.featured,
    relatedProductIds: db.relatedProductIds,
    gallery,
    video: db.videoMediaId,
    document: db.documentId,
    ogImage: db.ogImageMediaId,
    specifications,
    slug: tr?.slug ?? db.slug,
    metaTitle: tr?.metaTitle ?? undefined,
    metaDescription: tr?.metaDescription ?? undefined,
  };
}

// Reverse map: the UI Product (edited in ProductDrawer) -> the server
// ProductInput saveProduct expects. Status is intentionally NOT included:
// status is owned by the publish/unpublish/archive transitions, never by the
// content save (the page reconciles it separately after saving).
export function toProductInput(ui: Product): ProductInput {
  const slug = ui.slug && ui.slug.trim() ? ui.slug : slugifyTr(ui.name);
  return {
    sku: ui.sku,
    categoryId: ui.categoryId ?? null,
    featured: ui.featured,
    stockState: UI_TO_DB_STOCK[ui.stock] ?? 'IN_STOCK',
    price: ui.price || null,
    weightKg: Number.isFinite(ui.weightKg) ? ui.weightKg : null,
    exportCountries: ui.countries ?? 0,
    swatch: ui.swatch || null,
    videoMediaId: ui.video ?? null,
    documentId: ui.document ?? null,
    ogImageMediaId: ui.ogImage ?? null,
    relatedProductIds: ui.relatedProductIds ?? [],
    translations: [
      {
        languageCode: 'tr',
        name: ui.name,
        slug,
        description: ui.description || undefined,
        metaTitle: ui.metaTitle || undefined,
        metaDescription: ui.metaDescription || undefined,
      },
    ],
    features: [],
    specs: (ui.specifications ?? []).map((s, i) => ({
      languageCode: 'tr' as const,
      label: s.label,
      value: s.value,
      sortOrder: i,
    })),
    mediaIds: ui.gallery ?? [],
  };
}

// Maps the UI status back to the transition the page should run after a save
// when the drawer's status Select was changed. Returns null when no transition
// is needed (status unchanged or still a draft-family state).
export function uiStatusToTransition(status: Product['status']): 'publish' | 'unpublish' | 'archive' | null {
  if (status === 'yayinda') return 'publish';
  if (status === 'arsiv') return 'archive';
  return null;
}
