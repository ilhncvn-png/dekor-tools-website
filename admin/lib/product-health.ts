import { mediaItems, type Product } from './mock-data';

export interface ProductChecks {
  missingGallery: boolean;
  missingDocument: boolean;
  missingSeoTitle: boolean;
  missingMetaDescription: boolean;
  missingCategory: boolean;
  missingRelated: boolean;
  missingAltText: boolean;
  outOfStock: boolean;
}

/** Every check reads a real field already on the Product / MediaItem records — no fabricated flags. */
export function getProductChecks(product: Product): ProductChecks {
  return {
    missingGallery: product.gallery.length === 0,
    missingDocument: product.document === null,
    missingSeoTitle: !product.metaTitle,
    missingMetaDescription: !product.metaDescription,
    missingCategory: !product.category,
    missingRelated: product.relatedProductIds.length === 0,
    missingAltText: product.gallery.some((id) => !mediaItems.find((m) => m.id === id)?.altText),
    outOfStock: product.stock === 'tukendi',
  };
}

export type WorkflowStage = 'taslak' | 'icerik-hazir' | 'medya-hazir' | 'seo-hazir' | 'inceleme' | 'yayinda' | 'arsiv';

export const workflowStageLabel: Record<WorkflowStage, string> = {
  taslak: 'Taslak',
  'icerik-hazir': 'İçerik Hazır',
  'medya-hazir': 'Medya Hazır',
  'seo-hazir': 'SEO Hazır',
  inceleme: 'İncelemede',
  yayinda: 'Yayında',
  arsiv: 'Arşiv',
};

export const workflowStageOrder: WorkflowStage[] = ['taslak', 'icerik-hazir', 'medya-hazir', 'seo-hazir', 'inceleme', 'yayinda'];

/** Single shared tone map — table badges and the drawer header both read from this so the workflow vocabulary only has one visual mapping. */
export const workflowStageTone: Record<WorkflowStage, 'neutral' | 'info' | 'warning' | 'success'> = {
  taslak: 'neutral',
  'icerik-hazir': 'info',
  'medya-hazir': 'info',
  'seo-hazir': 'warning',
  inceleme: 'warning',
  yayinda: 'success',
  arsiv: 'neutral',
};

export function getSeoTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

/**
 * Derives where a product sits on the Draft → Content Ready → Media Ready →
 * SEO Ready → Review → Published path. Purely computed from real fields —
 * there is no separate stored "stage" value to drift out of sync.
 */
export function getWorkflowStage(product: Product, checks: ProductChecks): WorkflowStage {
  if (product.status === 'arsiv') return 'arsiv';
  if (product.status === 'yayinda') return 'yayinda';

  const contentReady = Boolean(product.name && product.description && !checks.missingCategory && product.price);
  const mediaReady = contentReady && !checks.missingGallery && !checks.missingAltText && !checks.missingDocument;
  const seoReady = mediaReady && !checks.missingSeoTitle && !checks.missingMetaDescription && product.seoScore >= 50;
  const reviewReady = seoReady && !checks.missingRelated;

  if (reviewReady) return 'inceleme';
  if (seoReady) return 'seo-hazir';
  if (mediaReady) return 'medya-hazir';
  if (contentReady) return 'icerik-hazir';
  return 'taslak';
}

export function countActiveChecks(checks: ProductChecks): number {
  return Object.values(checks).filter(Boolean).length;
}

/**
 * One plain-language sentence for "what do I need to do next" — derived from
 * the same checks/stage already computed above, in the order the workflow
 * actually requires them. Nothing new is tracked; this just narrates it.
 */
export function getNextStep(product: Product, checks: ProductChecks, stage: WorkflowStage): string {
  if (stage === 'yayinda') return 'Bu ürün yayında.';
  if (stage === 'arsiv') return 'Bu ürün arşivde.';
  if (stage === 'inceleme') return 'Sıradaki adım: inceleyip yayınlayın.';

  if (stage === 'taslak') {
    if (checks.missingCategory) return 'Sıradaki adım: kategori seçin.';
    return 'Sıradaki adım: açıklama ve fiyat bilgisini tamamlayın.';
  }
  if (stage === 'icerik-hazir') {
    if (checks.missingGallery) return 'Sıradaki adım: ürün galerisine görsel ekleyin.';
    if (checks.missingAltText) return 'Sıradaki adım: galeri görsellerine ALT metni ekleyin.';
    if (checks.missingDocument) return 'Sıradaki adım: teknik doküman veya PDF ekleyin.';
    return 'Sıradaki adım: medya içeriğini tamamlayın.';
  }
  if (stage === 'medya-hazir') {
    if (checks.missingSeoTitle) return 'Sıradaki adım: SEO başlığı ekleyin.';
    if (checks.missingMetaDescription) return 'Sıradaki adım: meta açıklama ekleyin.';
    return 'Sıradaki adım: SEO skorunu %50 üzerine çıkarın.';
  }
  if (stage === 'seo-hazir') {
    return 'Sıradaki adım: en az bir ilişkili ürün ekleyin.';
  }
  return 'Sıradaki adım: ürün bilgilerini tamamlayın.';
}
