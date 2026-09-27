// "Ana sayfada öne çıkan ürünler" (home-page featured products) rules.
// Membership is the product's `featured` flag (product drawer / wizard / showcase
// screen). The display order lives in a ProductCollection row under
// HOME_FEATURED_KEY — a curated list, not a catalogue family, so the snapshot
// builder must keep it out of the category listings.

/** ProductCollection key holding the home showcase order. */
export const HOME_FEATURED_KEY = 'home-featured';

export interface FeaturedCandidate {
  id: string;
  sku: string;
  featured: boolean;
  sortOrder: number;
}

export interface FeaturedOrderRow {
  productId: string;
  collectionKey: string;
  sortOrder: number;
}

/**
 * Ordered SKUs for the home showcase: featured products with an explicit showcase
 * position first (by that position), then any other featured products by their
 * catalogue order — so a product flagged elsewhere still appears, at the end.
 */
export function orderFeatured(products: FeaturedCandidate[], rows: FeaturedOrderRow[]): string[] {
  const pos = new Map(rows.filter((r) => r.collectionKey === HOME_FEATURED_KEY).map((r) => [r.productId, r.sortOrder]));
  return products
    .filter((p) => p.featured)
    .map((p, i) => ({ sku: p.sku, rank: pos.has(p.id) ? pos.get(p.id)! : Number.MAX_SAFE_INTEGER, order: p.sortOrder, i }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order || a.i - b.i)
    .map((p) => p.sku);
}
