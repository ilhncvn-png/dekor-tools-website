'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { SeoRow } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

// The public routes managed for SEO, with human labels.
const SEO_PAGES: { path: string; name: string }[] = [
  { path: '/', name: 'Ana Sayfa' }, { path: '/urunler', name: 'Ürünler' },
  { path: '/hakkimizda', name: 'Hakkımızda' }, { path: '/hikayemiz', name: 'Hikayemiz' },
  { path: '/vizyon-misyon', name: 'Vizyon & Misyon' }, { path: '/kalite-surdurulebilirlik', name: 'Kalite & Sürdürülebilirlik' },
  { path: '/ar-ge-merkezi', name: 'Ar-Ge Merkezi' }, { path: '/uretim', name: 'Üretim' },
  { path: '/ihracat', name: 'İhracat' }, { path: '/satis', name: 'Satış' },
  { path: '/bayi-ol', name: 'Bayi Ol' }, { path: '/bayi-kaynaklari', name: 'Bayi Kaynakları' },
  { path: '/b2b-portal', name: 'B2B Portal' }, { path: '/haberler', name: 'Haberler' },
  { path: '/kariyer', name: 'Kariyer' }, { path: '/iletisim', name: 'İletişim' },
  { path: '/destek', name: 'Destek' }, { path: '/online-odeme', name: 'Online Ödeme' },
  { path: '/site-haritasi', name: 'Site Haritası' }, { path: '/cerez-politikasi', name: 'Çerez Politikası' },
  { path: '/gizlilik-politikasi', name: 'Gizlilik Politikası' }, { path: '/kullanim-kosullari', name: 'Kullanım Koşulları' },
];

type DbSeoEntry = {
  path: string;
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageId: string | null;
  robotsIndex: boolean;
  twitterCardEnabled: boolean;
  schemaPresent: boolean;
  keywords: string[];
  updatedAt: Date;
};

function scoreFor(e: DbSeoEntry): number {
  let s = 0;
  if (e.title && e.title.length >= 10) s += 25;
  if (e.metaDescription && e.metaDescription.length >= 40) s += 25;
  if (e.canonicalUrl) s += 20;
  if (e.schemaPresent) s += 15;
  if (e.robotsIndex) s += 15;
  return s;
}

function recommendationsFor(e: DbSeoEntry): string[] {
  const r: string[] = [];
  if (!e.title || e.title.length < 10) r.push('Sayfa başlığı ekleyin (en az 10 karakter).');
  if (!e.metaDescription || e.metaDescription.length < 40) r.push('Meta açıklaması ekleyin (en az 40 karakter).');
  if (!e.canonicalUrl) r.push('Canonical URL tanımlayın.');
  if (!e.schemaPresent) r.push('Yapısal veri (schema) ekleyin.');
  return r;
}

function toSeoRow(path: string, name: string, e: DbSeoEntry | null): SeoRow {
  const entry: DbSeoEntry = e ?? {
    path, title: null, metaDescription: null, canonicalUrl: null, ogImageId: null,
    robotsIndex: true, twitterCardEnabled: true, schemaPresent: false, keywords: [], updatedAt: new Date(0),
  };
  const score = scoreFor(entry);
  const status: SeoRow['status'] = score >= 80 ? 'iyi' : score >= 50 ? 'uyari' : 'eksik';
  return {
    id: path,
    page: `${name} (${path})`,
    title: entry.title ?? '',
    metaDescription: entry.metaDescription ?? '',
    score,
    status,
    lastAudit: e ? entry.updatedAt.toISOString().slice(0, 10) : 'Hiç',
    h1Present: true,
    altMissingCount: 0,
    schemaPresent: entry.schemaPresent,
    recommendations: recommendationsFor(entry),
    canonicalUrl: entry.canonicalUrl ?? '',
    ogImage: entry.ogImageId,
    twitterCardEnabled: entry.twitterCardEnabled,
    robotsIndex: entry.robotsIndex,
    keywords: entry.keywords,
  };
}

export async function getAdminSeo(): Promise<SeoRow[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'seo.manage');

  const entries = await prisma.seoEntry.findMany();
  const byPath = new Map(entries.map((e) => [e.path, e]));
  return SEO_PAGES.map(({ path, name }) => toSeoRow(path, name, byPath.get(path) ?? null));
}

const seoInputSchema = z.object({
  path: z.string().min(1).max(200),
  title: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(400).nullable().optional(),
  canonicalUrl: z.string().max(400).nullable().optional(),
  ogImageId: z.string().nullable().optional(),
  robotsIndex: z.boolean().default(true),
  twitterCardEnabled: z.boolean().default(true),
  schemaPresent: z.boolean().default(false),
  keywords: z.array(z.string().max(60)).default([]),
});

export type SeoEntryInput = z.infer<typeof seoInputSchema>;

export async function saveSeoEntry(input: SeoEntryInput): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'seo.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const parsed = seoInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Doğrulama hatası.' };
  const d = parsed.data;

  try {
    const data = {
      title: d.title ?? null, metaDescription: d.metaDescription ?? null, canonicalUrl: d.canonicalUrl ?? null,
      ogImageId: d.ogImageId ?? null, robotsIndex: d.robotsIndex, twitterCardEnabled: d.twitterCardEnabled,
      schemaPresent: d.schemaPresent, keywords: d.keywords,
    };
    const entry = await prisma.seoEntry.upsert({
      where: { path: d.path },
      update: data,
      create: { path: d.path, ...data },
    });
    await recordAuditLog({ actorId: user!.id, action: 'seo.update', entityType: 'seo_entry', entityId: entry.id, newData: { path: d.path } });
    revalidatePath('/seo-yonetimi');
    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}
