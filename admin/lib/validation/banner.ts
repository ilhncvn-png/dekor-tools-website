import { z } from 'zod';
import { LANGUAGE_CODES } from './category';

export const bannerTranslationSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  headline: z.string().max(200).optional(),
  body: z.string().max(1000).optional(),
  ctaLabel: z.string().max(80).optional(),
  ctaUrl: z.string().max(500).optional(),
});

export const bannerInputSchema = z.object({
  key: z
    .string()
    .min(1, 'Anahtar zorunludur.')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Anahtar yalnızca küçük harf, rakam ve tire içerebilir.'),
  placement: z.string().min(1, 'Yerleşim zorunludur.').max(120),
  translations: z.array(bannerTranslationSchema).min(1, 'En az bir dil için içerik gereklidir.'),
  slideMediaIds: z.array(z.string().cuid()).default([]),
});

export type BannerInput = z.infer<typeof bannerInputSchema>;
