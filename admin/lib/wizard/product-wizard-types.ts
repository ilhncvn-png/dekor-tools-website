/**
 * Product-wizard shared types + constants. This is a plain module (NOT a
 * 'use server' file) so it can safely export non-async values — a 'use server'
 * module may only export async functions, and exporting the WIZARD_LANGUAGES
 * const / interfaces from the actions file broke the server-action module at
 * runtime (getProductWizard 500'd). They live here and are imported by both the
 * server actions and the client wizard page.
 */

export const WIZARD_LANGUAGES = ['tr', 'en', 'de', 'fr', 'ru', 'az', 'ar'] as const;
export type WizardLang = (typeof WIZARD_LANGUAGES)[number];

export interface WizardTranslation {
  name: string; slug: string; eyebrow: string; heroSubtitle: string; shortDescription: string;
  description: string; materialLabel: string; badgeText: string; metaTitle: string;
  metaDescription: string; ogTitle: string; ogDescription: string;
}
export interface WizardVariant { sku: string; material: string; width: string; length: string; thickness: string; pack: string; isDefault: boolean; sortOrder: number; }
export interface WizardKV { label: string; value: string; sortOrder: number; }
export interface WizardFeature { label: string; sortOrder: number; }
export interface WizardApplication { title: string; description: string; eyebrow: string; iconMediaId: string | null; mediaId: string | null; sortOrder: number; }
export interface WizardGalleryItem { mediaId: string; itemType: string; altText: string; caption: string; sortOrder: number; }
export interface WizardDocument { mediaId: string | null; type: string; title: string; fileSizeLabel: string; isActive: boolean; sortOrder: number; }
export interface WizardVideo { provider: string; url: string; blobMediaId: string | null; posterMediaId: string | null; durationLabel: string; title: string; description: string; isPrimary: boolean; sortOrder: number; }
export interface WizardDrawing { mediaId: string | null; title: string; drawingCode: string; revisionCode: string; widthLabel: string; heightLabel: string; notes: string; }

export interface WizardProduct {
  id: string | null;
  sku: string;
  categoryId: string | null;
  status: 'yayinda' | 'taslak' | 'inceleme' | 'arsiv';
  featured: boolean;
  flags: string[];
  materialSummary: string;
  sortOrder: number;
  translations: Record<string, WizardTranslation>;
  variants: WizardVariant[];
  features: WizardFeature[];
  specs: WizardKV[];
  applications: WizardApplication[];
  gallery: WizardGalleryItem[];
  documents: WizardDocument[];
  videos: WizardVideo[];
  drawing: WizardDrawing | null;
  relatedProductIds: string[];
}
