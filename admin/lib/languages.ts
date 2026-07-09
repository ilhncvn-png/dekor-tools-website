/**
 * Language options for the (prepared, non-functional) language switch.
 * Matches docs/architecture/10_MULTI_LANGUAGE_PLAN.md — Turkish is the
 * default/source locale, English is the first additional locale. This
 * switch affects PUBLIC CONTENT language once the CMS exists; the admin
 * UI chrome itself stays Turkish-only regardless of this selection
 * (docs/engineering/02_ENGINEERING_STANDARDS.md §2 item 7).
 */

export interface LanguageOption {
  code: 'tr' | 'en';
  label: string;
  isDefault: boolean;
  isActive: boolean;
}

export const languageOptions: LanguageOption[] = [
  { code: 'tr', label: 'Türkçe', isDefault: true, isActive: true },
  { code: 'en', label: 'English', isDefault: false, isActive: false },
];
