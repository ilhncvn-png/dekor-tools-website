/** Category-wizard shared types + constants (plain module — not 'use server'). */

export const CAT_WIZARD_LANGUAGES = ['tr', 'en', 'de', 'fr', 'ru', 'az', 'ar'] as const;

export interface CatWizardTranslation {
  name: string; slug: string; shortDescription: string; longDescription: string;
  heroTitle: string; heroDescription: string; metaTitle: string; metaDescription: string;
}
export interface CatWizardStat { value: string; label: string; sortOrder: number; }
export interface CatWizardFilterOption { value: string; label: string; sortOrder: number; }
export interface CatWizardFilter { key: string; label: string; type: string; active: boolean; sortOrder: number; options: CatWizardFilterOption[]; }

export interface WizardCategory {
  id: string | null;
  code: string;
  parentId: string | null;
  status: 'yayinda' | 'taslak' | 'inceleme' | 'arsiv';
  isVisible: boolean;
  showInNavigation: boolean;
  showOnHomepage: boolean;
  icon: string;
  sortOrder: number;
  translations: Record<string, CatWizardTranslation>;
  stats: CatWizardStat[];
  filters: CatWizardFilter[];
}

export function emptyCatTr(): CatWizardTranslation {
  return { name: '', slug: '', shortDescription: '', longDescription: '', heroTitle: '', heroDescription: '', metaTitle: '', metaDescription: '' };
}
