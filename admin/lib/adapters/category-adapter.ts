import type { Category } from '@/lib/mock-data';
import { LANGUAGE_CODES } from '@/lib/validation/category';

// Maps a database ProductCategory (with translations) to the exact shape the
// existing Category Management UI already consumes (lib/mock-data.ts's
// `Category`). This is what lets the admin screen stay visually and
// structurally unchanged while its data source becomes real PostgreSQL.

type DbCategory = {
  id: string;
  key: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
  code: string | null;
  icon: string | null;
  showOnHomepage: boolean;
  showInNavigation: boolean;
  updatedAt: Date;
  translations: Array<{
    languageCode: string;
    name: string;
    slug: string;
    description: string | null;
    heroTitle: string | null;
    heroDescription: string | null;
    cardTitle: string | null;
    cardDescription: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
  }>;
};

function computeSeoScore(tr: DbCategory['translations'][number] | undefined): number {
  if (!tr) return 0;
  let score = 0;
  if (tr.name) score += 25;
  if (tr.description && tr.description.length >= 40) score += 25;
  if (tr.metaTitle && tr.metaTitle.length >= 10) score += 25;
  if (tr.metaDescription && tr.metaDescription.length >= 40) score += 25;
  return score;
}

export function toUiCategory(db: DbCategory): Category {
  const byLang = new Map(db.translations.map((t) => [t.languageCode, t]));
  const tr = byLang.get('tr');

  const languageStatus = LANGUAGE_CODES.map((code) => {
    const t = byLang.get(code);
    return { code, complete: Boolean(t && t.name.trim() && t.slug.trim()) };
  });

  return {
    id: db.id,
    name: tr?.name ?? db.key,
    code: db.code ?? undefined,
    slug: tr?.slug ?? db.slug,
    description: tr?.description ?? '',
    heroTitle: tr?.heroTitle ?? undefined,
    heroDescription: tr?.heroDescription ?? undefined,
    cardTitle: tr?.cardTitle ?? undefined,
    cardDescription: tr?.cardDescription ?? undefined,
    icon: db.icon ?? undefined,
    parentId: db.parentId,
    order: db.sortOrder,
    visible: db.isVisible,
    showOnHomepage: db.showOnHomepage,
    showInNavigation: db.showInNavigation,
    seoScore: computeSeoScore(tr),
    languageStatus,
    updatedAt: db.updatedAt.toISOString(),
    metaTitle: tr?.metaTitle ?? undefined,
    metaDescription: tr?.metaDescription ?? undefined,
  };
}
