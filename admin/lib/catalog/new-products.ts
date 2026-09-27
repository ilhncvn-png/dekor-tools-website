// "Yeni Ürünler" (new products) collection rules.
// A product joins the collection when its "Yeni" flag is switched on in the product
// wizard; the ProductCollection row's createdAt marks the start of its new-product
// window. After the window the product is dropped from the collection listing only —
// it always stays in its own primary category.

/** Family key of the Yeni Ürünler collection category. */
export const NEW_PRODUCTS_KEY = 'fam-11';

/** Wizard flag that controls Yeni Ürünler membership. */
export const NEW_FLAG = 'new';

const DEFAULT_WINDOW_DAYS = 180;
const DAY_MS = 86_400_000;

/** Days a product stays listed as new. Override with the NEW_PRODUCT_DAYS env var. */
export function newProductWindowDays(): number {
  const days = Number(process.env.NEW_PRODUCT_DAYS);
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_WINDOW_DAYS;
}

/** End of the new-product window for a product added to the collection at `addedAt`. */
export function newUntil(addedAt: Date, days: number = newProductWindowDays()): Date {
  return new Date(addedAt.getTime() + days * DAY_MS);
}
