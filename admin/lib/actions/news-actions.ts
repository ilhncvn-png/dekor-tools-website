'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { newsInputSchema, type NewsInput } from '@/lib/validation/news';
import { toUiNews, slugifyTr } from '@/lib/adapters/news-adapter';
import type { NewsArticle } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

const NEWS_INCLUDE = { translations: true };

export async function saveNews(articleId: string | null, input: NewsInput): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'news.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = newsInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const data = parsed.data;
  const trSlug = data.translations.find((t) => t.languageCode === 'tr')?.slug ?? data.translations[0].slug;

  // Slug uniqueness per language, excluding the current article.
  for (const t of data.translations) {
    const existing = await prisma.newsArticleTranslation.findFirst({
      where: { languageCode: t.languageCode, slug: t.slug, articleId: articleId ? { not: articleId } : undefined },
    });
    if (existing) return { success: false, error: `"${t.slug}" slug'ı (${t.languageCode}) zaten kullanılıyor.` };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = articleId
        ? await tx.newsArticle.findUnique({ where: { id: articleId }, include: NEWS_INCLUDE })
        : null;

      const articleData = {
        featured: data.featured,
        categoryKey: data.categoryKey,
        tags: data.tags,
        readingTime: data.readingTime ?? null,
        displayDate: data.displayDate ? new Date(data.displayDate) : null,
        galleryMediaIds: data.galleryMediaIds,
      };
      const article = articleId
        ? await tx.newsArticle.update({ where: { id: articleId }, data: articleData })
        : await tx.newsArticle.create({ data: { slug: trSlug, authorId: user!.id, ...articleData } });

      for (const t of data.translations) {
        const trData = {
          title: t.title, slug: t.slug, excerpt: t.excerpt, body: t.body,
          metaTitle: t.metaTitle, metaDescription: t.metaDescription,
        };
        await tx.newsArticleTranslation.upsert({
          where: { articleId_languageCode: { articleId: article.id, languageCode: t.languageCode } },
          update: trData,
          create: { articleId: article.id, languageCode: t.languageCode, ...trData },
        });
      }

      await tx.newsRevision.create({
        data: {
          articleId: article.id,
          snapshot: JSON.parse(JSON.stringify({ ...article, translations: data.translations })),
          action: articleId ? 'UPDATE' : 'CREATE',
          authorId: user!.id,
        },
      });
      await tx.contentRevision.create({
        data: {
          entityType: 'news_article', entityId: article.id, action: articleId ? 'UPDATE' : 'CREATE',
          previousData: existing ? JSON.parse(JSON.stringify(existing)) : undefined, authorId: user!.id,
        },
      });
      return article;
    });

    await recordAuditLog({ actorId: user!.id, action: articleId ? 'news.update' : 'news.create', entityType: 'news_article', entityId: result.id, newData: { slug: result.slug } });
    await recordActivity({
      actorId: user!.id, actorName: user!.name,
      summary: `${user!.name} "${data.translations.find((t) => t.languageCode === 'tr')?.title}" makalesini ${articleId ? 'güncelledi' : 'oluşturdu'}.`,
      entityType: 'news_article', entityId: result.id,
    });

    revalidatePath('/haberler');
    revalidateTag('news');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}

async function transitionNews(articleId: string, status: 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED', action: 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE'): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'news.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const article = await prisma.newsArticle.findUnique({ where: { id: articleId }, include: { translations: true } });
  if (!article) return { success: false, error: 'Makale bulunamadı.' };
  if (action === 'PUBLISH') {
    const tr = article.translations.find((t) => t.languageCode === 'tr');
    if (!tr || !tr.title) return { success: false, error: 'Yayınlamadan önce Türkçe içerik gereklidir.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.newsArticle.update({ where: { id: articleId }, data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : article.publishedAt } });
    await tx.contentRevision.create({ data: { entityType: 'news_article', entityId: articleId, action, authorId: user!.id } });
  });
  await recordAuditLog({ actorId: user!.id, action: `news.${action.toLowerCase()}`, entityType: 'news_article', entityId: articleId });
  revalidatePath('/haberler');
  revalidateTag('news');
  return { success: true };
}

export const publishNews = (id: string) => transitionNews(id, 'PUBLISHED', 'PUBLISH');
export const unpublishNews = (id: string) => transitionNews(id, 'UNPUBLISHED', 'UNPUBLISH');
export const archiveNews = (id: string) => transitionNews(id, 'ARCHIVED', 'ARCHIVE');

export async function softDeleteNews(articleId: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'news.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.newsArticle.update({ where: { id: articleId }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'news.delete', entityType: 'news_article', entityId: articleId });
  revalidatePath('/haberler');
  revalidateTag('news');
  return { success: true };
}

export async function getAdminNews(): Promise<NewsArticle[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'news.manage');

  const rows = await prisma.newsArticle.findMany({
    where: { deletedAt: null },
    include: { translations: true },
    orderBy: [{ displayDate: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(toUiNews);
}

// Re-export for callers that build inputs.
export { slugifyTr };
