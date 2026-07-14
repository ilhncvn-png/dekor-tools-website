'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import type { CmsPage } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

const DB_TO_UI: Record<string, CmsPage['status']> = {
  PUBLISHED: 'yayinda', DRAFT: 'taslak', IN_REVIEW: 'inceleme',
  SCHEDULED: 'taslak', UNPUBLISHED: 'taslak', ARCHIVED: 'taslak',
};
const UI_TO_DB: Record<CmsPage['status'], 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW'> = {
  yayinda: 'PUBLISHED', taslak: 'DRAFT', inceleme: 'IN_REVIEW',
};

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return input.trim().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sayfa';
}

type DbPage = {
  id: string; slug: string; status: string; path: string | null; template: string;
  showInNavigation: boolean; ogImageId: string | null; scheduledAt: Date | null; updatedAt: Date;
  author: { name: string } | null;
  translations: { languageCode: string; title: string; slug: string }[];
  seo: { metaTitle: string | null; metaDescription: string | null; canonicalUrl: string | null } | null;
  _count: { sections: number; revisions: number };
};

function seoScore(seo: DbPage['seo']): number {
  if (!seo) return 0;
  let s = 0;
  if (seo.metaTitle) s += 40;
  if (seo.metaDescription && seo.metaDescription.length >= 40) s += 40;
  if (seo.canonicalUrl) s += 20;
  return s;
}

function toUiPage(db: DbPage): CmsPage {
  const tr = db.translations.find((t) => t.languageCode === 'tr') ?? db.translations[0];
  return {
    id: db.id,
    title: tr?.title ?? '(başlıksız)',
    path: db.path ?? `/${tr?.slug ?? db.slug}`,
    slug: tr?.slug ?? db.slug,
    status: DB_TO_UI[db.status] ?? 'taslak',
    author: db.author?.name ?? 'Sistem',
    updatedAt: db.updatedAt.toISOString().slice(0, 10),
    language: 'tr',
    template: db.template,
    sectionCount: db._count.sections,
    seoScore: seoScore(db.seo),
    showInNavigation: db.showInNavigation,
    metaComplete: Boolean(db.seo?.metaTitle && db.seo?.metaDescription),
    revisionCount: db._count.revisions,
    ogImage: db.ogImageId,
    scheduledAt: db.scheduledAt ? db.scheduledAt.toISOString().slice(0, 10) : null,
  };
}

const pageInputSchema = z.object({
  title: z.string().min(1, 'Başlık zorunludur.').max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Geçersiz slug.'),
  path: z.string().max(200).nullable().optional(),
  template: z.string().max(80).default('standard'),
  showInNavigation: z.boolean().default(true),
  ogImageId: z.string().nullable().optional(),
});
export type PageInput = z.infer<typeof pageInputSchema>;

export async function getAdminPages(): Promise<CmsPage[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'pages.manage');
  const rows = await prisma.page.findMany({
    where: { deletedAt: null },
    include: { author: { select: { name: true } }, translations: true, seo: true, _count: { select: { sections: true, revisions: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map((r) => toUiPage(r as unknown as DbPage));
}

export async function savePage(pageId: string | null, input: PageInput, uiStatus: CmsPage['status']): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'pages.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const parsed = pageInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const d = parsed.data;

  const dup = await prisma.pageTranslation.findFirst({
    where: { languageCode: 'tr', slug: d.slug, pageId: pageId ? { not: pageId } : undefined },
  });
  if (dup) return { success: false, error: `"${d.slug}" slug'ı zaten kullanılıyor.` };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const common = { path: d.path ?? `/${d.slug}`, template: d.template, showInNavigation: d.showInNavigation, ogImageId: d.ogImageId ?? null, status: UI_TO_DB[uiStatus] };
      const page = pageId
        ? await tx.page.update({ where: { id: pageId }, data: { ...common, editorId: user!.id, publishedAt: uiStatus === 'yayinda' ? new Date() : undefined } })
        : await tx.page.create({ data: { key: `${slugifyTr(d.slug)}-${Date.now().toString(36)}`, slug: d.slug, authorId: user!.id, ...common, publishedAt: uiStatus === 'yayinda' ? new Date() : null } });

      await tx.pageTranslation.upsert({
        where: { pageId_languageCode: { pageId: page.id, languageCode: 'tr' } },
        update: { title: d.title, slug: d.slug },
        create: { pageId: page.id, languageCode: 'tr', title: d.title, slug: d.slug },
      });

      await tx.contentRevision.create({ data: { entityType: 'page', entityId: page.id, action: pageId ? 'UPDATE' : 'CREATE', authorId: user!.id } });
      return page;
    });

    await recordAuditLog({ actorId: user!.id, action: pageId ? 'page.update' : 'page.create', entityType: 'page', entityId: result.id, newData: { slug: d.slug } });
    await recordActivity({ actorId: user!.id, actorName: user!.name, summary: `${user!.name} "${d.title}" sayfasını ${pageId ? 'güncelledi' : 'oluşturdu'}.`, entityType: 'page', entityId: result.id });
    revalidatePath('/sayfa-yonetimi');
    revalidateTag('pages');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}

export async function setPageStatus(pageId: string, uiStatus: CmsPage['status']): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'pages.publish');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const dbStatus = UI_TO_DB[uiStatus];
  await prisma.$transaction(async (tx) => {
    await tx.page.update({ where: { id: pageId }, data: { status: dbStatus, publishedAt: dbStatus === 'PUBLISHED' ? new Date() : undefined } });
    await tx.contentRevision.create({ data: { entityType: 'page', entityId: pageId, action: dbStatus === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE', authorId: user!.id } });
  });
  await recordAuditLog({ actorId: user!.id, action: `page.${uiStatus}`, entityType: 'page', entityId: pageId });
  revalidatePath('/sayfa-yonetimi');
  revalidateTag('pages');
  return { success: true };
}

export async function softDeletePage(pageId: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'pages.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.page.update({ where: { id: pageId }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'page.delete', entityType: 'page', entityId: pageId });
  revalidatePath('/sayfa-yonetimi');
  revalidateTag('pages');
  return { success: true };
}
