import { z } from 'zod';
import { LANGUAGE_CODES } from './category';

const slugSchema = z
  .string()
  .min(1, 'Slug zorunludur.')
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug yalnızca küçük harf, rakam ve tire içerebilir.');

export const productTranslationSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  name: z.string().min(1, 'İsim zorunludur.').max(200),
  slug: slugSchema,
  shortDescription: z.string().max(400).optional(),
  description: z.string().max(5000).optional(),
});

export const productFeatureSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  label: z.string().min(1).max(200),
  sortOrder: z.number().int().min(0).default(0),
});

export const productSpecSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(300),
  sortOrder: z.number().int().min(0).default(0),
});

export const productInputSchema = z.object({
  sku: z
    .string()
    .min(1, 'Ürün kodu zorunludur.')
    .max(60)
    .regex(/^[A-Za-z0-9._-]+$/, 'Ürün kodu yalnızca harf, rakam, nokta ve tire içerebilir.'),
  categoryId: z.string().cuid().nullable().optional(),
  translations: z.array(productTranslationSchema).min(1, 'En az bir dil için içerik gereklidir.'),
  features: z.array(productFeatureSchema).default([]),
  specs: z.array(productSpecSchema).default([]),
  mediaIds: z.array(z.string().cuid()).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
