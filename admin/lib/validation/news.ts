import { z } from 'zod';
import { LANGUAGE_CODES } from './category';

const slugSchema = z
  .string()
  .min(1, 'Slug zorunludur.')
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug yalnızca küçük harf, rakam ve tire içerebilir.');

export const NEWS_CATEGORIES = ['News', 'Trade Shows', 'Training Academy', 'Company Life'] as const;

export const newsTranslationSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  title: z.string().min(1, 'Başlık zorunludur.').max(300),
  slug: slugSchema,
  excerpt: z.string().max(600).optional(),
  body: z.string().max(20000).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(400).optional(),
});

export const newsInputSchema = z.object({
  categoryKey: z.enum(NEWS_CATEGORIES).default('News'),
  featured: z.boolean().default(false),
  tags: z.array(z.string().max(60)).default([]),
  readingTime: z.string().max(40).nullable().optional(),
  displayDate: z.string().nullable().optional(),
  galleryMediaIds: z.array(z.string()).default([]),
  translations: z.array(newsTranslationSchema).min(1, 'En az bir dil için içerik gereklidir.'),
});

export type NewsInput = z.infer<typeof newsInputSchema>;
