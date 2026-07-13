import { z } from 'zod';

export const LANGUAGE_CODES = ['tr', 'en', 'de', 'fr', 'ru', 'az', 'ar'] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

const slugSchema = z
  .string()
  .min(1, 'Slug zorunludur.')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug yalnızca küçük harf, rakam ve tire içerebilir.');

export const categoryTranslationSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  name: z.string().min(1, 'İsim zorunludur.').max(200),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  heroTitle: z.string().max(200).optional(),
  heroDescription: z.string().max(2000).optional(),
  cardTitle: z.string().max(200).optional(),
  cardDescription: z.string().max(600).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(400).optional(),
});

export const categoryInputSchema = z.object({
  key: z
    .string()
    .min(1, 'Anahtar zorunludur.')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Anahtar yalnızca küçük harf, rakam ve tire içerebilir.'),
  parentId: z.string().cuid().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  code: z.string().max(40).nullable().optional(),
  icon: z.string().max(60).nullable().optional(),
  showOnHomepage: z.boolean().default(false),
  showInNavigation: z.boolean().default(true),
  translations: z.array(categoryTranslationSchema).min(1, 'En az bir dil için içerik gereklidir.'),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
