import { z } from 'zod';

export const DEALER_SOURCES = ['basvuru', 'manuel'] as const;

export const dealerInputSchema = z.object({
  company: z.string().min(1, 'Firma adı zorunludur.').max(200),
  country: z.string().min(1, 'Ülke zorunludur.').max(100),
  region: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  contactName: z.string().max(160).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  phone: z.string().max(60).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  volume: z.string().max(120).nullable().optional(),
  assignedTo: z.string().max(160).nullable().optional(),
  listedOnWebsite: z.boolean().default(false),
  contractSigned: z.boolean().default(false),
  notes: z.string().max(2000).nullable().optional(),
  logoMediaId: z.string().nullable().optional(),
  source: z.enum(DEALER_SOURCES).default('manuel'),
  categories: z.array(z.string().max(80)).default([]),
  partnerSince: z.string().max(40).nullable().optional(),
  directoryStatus: z.string().max(60).nullable().optional(),
});

export type DealerInput = z.infer<typeof dealerInputSchema>;
