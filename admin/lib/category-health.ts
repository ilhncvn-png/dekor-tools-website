import {
  Paintbrush,
  Layers,
  Grid3x3,
  Slice,
  Snowflake,
  Ruler,
  ShieldCheck,
  Presentation,
  Gem,
  Sparkles,
  Star,
  FolderTree,
  type LucideIcon,
} from 'lucide-react';
import type { Category, Product } from './mock-data';

/** Placeholder icon references for Product Families — not the bespoke line-art SVGs the live site hand-draws per family, just a close-enough stand-in so the admin can show *something* real instead of a generic folder for every row. */
export const familyIconMap: Record<string, LucideIcon> = {
  painting: Paintbrush,
  plaster: Layers,
  tile: Grid3x3,
  scraper: Slice,
  insulation: Snowflake,
  measuring: Ruler,
  safety: ShieldCheck,
  stand: Presentation,
  dkr: Gem,
  special: Sparkles,
  new: Star,
};

export function getFamilyIcon(iconKey?: string): LucideIcon {
  return (iconKey && familyIconMap[iconKey]) || FolderTree;
}

export function getChildren(categories: Category[], parentId: string | null): Category[] {
  return categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);
}

/** All descendant ids at any depth — the basis for the circular-parent guard and cascade checks. */
export function getDescendantIds(categories: Category[], id: string): Set<string> {
  const result = new Set<string>();
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const child of categories.filter((c) => c.parentId === current)) {
      if (!result.has(child.id)) {
        result.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return result;
}

/** Root → leaf ancestor chain, inclusive of the category itself. */
export function getCategoryPath(categories: Category[], id: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: Category[] = [];
  let current = byId.get(id);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function getFullSlugPath(categories: Category[], id: string): string {
  return getCategoryPath(categories, id).map((c) => c.slug).join('/');
}

export function getFullNamePath(categories: Category[], id: string): string {
  return getCategoryPath(categories, id).map((c) => c.name).join(' / ');
}

export interface CategoryProductStats {
  total: number;
  published: number;
  draft: number;
  hidden: number;
}

/**
 * Real counts derived from the actual products array — a family's card/hero
 * count includes its own products AND every sub-family's, matching what
 * "96 products" means on the live Painting Tools family page. Matching
 * prefers the real `categoryId` foreign key; falls back to the legacy
 * name-string match for any product that predates that field. "Hidden" maps
 * to the arşiv product status, since Product has no separate hidden flag.
 */
export function getCategoryProductStats(category: Category, categories: Category[], products: Product[]): CategoryProductStats {
  const familyIds = new Set([category.id, ...getDescendantIds(categories, category.id)]);
  const familyNames = new Set(categories.filter((c) => familyIds.has(c.id)).map((c) => c.name));
  const matches = products.filter((p) => (p.categoryId ? familyIds.has(p.categoryId) : familyNames.has(p.category)));
  return {
    total: matches.length,
    published: matches.filter((p) => p.status === 'yayinda').length,
    draft: matches.filter((p) => p.status === 'taslak').length,
    hidden: matches.filter((p) => p.status === 'arsiv').length,
  };
}

export interface CategoryTreeRow {
  category: Category;
  depth: number;
}

// 'manual' respects the real `order` field (what the up/down reorder buttons
// mutate) — it's the default, so a reorder click is always immediately visible.
export type CategorySortKey = 'manual' | 'name' | 'seoScore' | 'updatedAt';

/**
 * Flattens the tree into display rows, preserving hierarchy — sorting is
 * applied within each sibling group (never a flat global sort), so the
 * parent/child structure can never be scrambled by a column click. Only
 * expanded parents contribute their children to the result.
 */
export function buildCategoryTree(
  categories: Category[],
  expanded: Record<string, boolean>,
  sortKey: CategorySortKey = 'manual',
  sortDir: 'asc' | 'desc' = 'asc'
): CategoryTreeRow[] {
  const rows: CategoryTreeRow[] = [];

  function sortSiblings(items: Category[]): Category[] {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'manual') return items; // already order-sorted by getChildren
    if (sortKey === 'name') return [...items].sort((a, b) => a.name.localeCompare(b.name) * dir || a.order - b.order);
    if (sortKey === 'updatedAt') return [...items].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) * dir || a.order - b.order);
    return [...items].sort((a, b) => (a.seoScore - b.seoScore) * dir || a.order - b.order);
  }

  function walk(parentId: string | null, depth: number) {
    const siblings = sortSiblings(getChildren(categories, parentId));
    for (const cat of siblings) {
      rows.push({ category: cat, depth });
      const hasChildren = categories.some((c) => c.parentId === cat.id);
      if (hasChildren && expanded[cat.id]) {
        walk(cat.id, depth + 1);
      }
    }
  }

  walk(null, 0);
  return rows;
}

/** Same tree walk, but always fully expanded — used for search matching and for the parent-selector option list. */
export function flattenAll(categories: Category[]): CategoryTreeRow[] {
  const rows: CategoryTreeRow[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const cat of getChildren(categories, parentId)) {
      rows.push({ category: cat, depth });
      walk(cat.id, depth + 1);
    }
  }
  walk(null, 0);
  return rows;
}

/** Swaps a category's order with its previous/next sibling — the real (non-drag) reorder mechanism. */
export function reorderSibling(categories: Category[], id: string, direction: 'up' | 'down'): Category[] {
  const target = categories.find((c) => c.id === id);
  if (!target) return categories;
  const siblings = getChildren(categories, target.parentId);
  const index = siblings.findIndex((c) => c.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return categories;
  const swapWith = siblings[swapIndex];
  return categories.map((c) => {
    if (c.id === target.id) return { ...c, order: swapWith.order };
    if (c.id === swapWith.id) return { ...c, order: target.order };
    return c;
  });
}

export interface CategoryValidationInput {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  visible: boolean;
  showOnHomepage: boolean;
  showInNavigation: boolean;
}

/** Every check a Save must pass — run before any category create/update is committed. */
export function validateCategory(form: CategoryValidationInput, categories: Category[]): string[] {
  const errors: string[] = [];
  const others = categories.filter((c) => c.id !== form.id);

  if (!form.name.trim()) errors.push('Kategori adı boş olamaz.');
  if (!form.slug.trim()) errors.push('Slug boş olamaz.');

  if (form.parentId === form.id) {
    errors.push('Bir kategori kendi üst kategorisi olamaz.');
  } else if (form.parentId) {
    const parentExists = categories.some((c) => c.id === form.parentId);
    if (!parentExists) errors.push('Seçilen üst kategori bulunamadı.');
    else if (getDescendantIds(categories, form.id).has(form.parentId)) {
      errors.push('Döngüsel hiyerarşi: bir kategori kendi alt kategorisinin altına taşınamaz.');
    }
  }

  const duplicateSibling = others.some(
    (c) => c.parentId === form.parentId && c.name.trim().toLowerCase() === form.name.trim().toLowerCase()
  );
  if (duplicateSibling) errors.push('Aynı üst kategori altında bu isimde başka bir kategori zaten var.');

  const wouldBePath = form.parentId
    ? `${getFullSlugPath(categories, form.parentId)}/${form.slug}`
    : form.slug;
  const duplicatePath = others.some((c) => getFullSlugPath(categories, c.id) === wouldBePath);
  if (duplicatePath) errors.push(`Bu URL zaten kullanılıyor: /${wouldBePath}`);

  if (!form.visible && (form.showOnHomepage || form.showInNavigation)) {
    errors.push('Gizli bir kategori ana sayfada veya menüde gösterilemez — önce görünür yapın.');
  }

  return errors;
}
