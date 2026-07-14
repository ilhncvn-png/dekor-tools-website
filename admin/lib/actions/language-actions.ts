'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { LanguageRow } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

export async function getAdminLanguages(): Promise<LanguageRow[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'translations.manage');

  const [languages, totalProducts, totalNews, totalPages, totalCats] = await Promise.all([
    prisma.language.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.newsArticle.count({ where: { deletedAt: null } }),
    prisma.page.count({ where: { deletedAt: null } }),
    prisma.productCategory.count({ where: { deletedAt: null } }),
  ]);
  const totalContent = totalProducts + totalNews + totalPages + totalCats;

  const rows = await Promise.all(
    languages.map(async (lang) => {
      const [prodT, newsT, pageT, catT] = await Promise.all([
        prisma.productTranslation.count({ where: { languageCode: lang.code } }),
        prisma.newsArticleTranslation.count({ where: { languageCode: lang.code } }),
        prisma.pageTranslation.count({ where: { languageCode: lang.code } }),
        prisma.productCategoryTranslation.count({ where: { languageCode: lang.code } }),
      ]);
      const translated = prodT + newsT + pageT + catT;
      const completion = totalContent > 0 ? Math.round((translated / totalContent) * 100) : (lang.isDefault ? 100 : 0);
      return {
        id: lang.code,
        name: lang.label,
        code: lang.code,
        completion,
        isDefault: lang.isDefault,
        active: lang.isActive,
        pagesTranslated: pageT,
        pagesTotal: totalPages,
        contentBreakdown: [
          { type: 'Ürünler', translated: prodT, total: totalProducts },
          { type: 'Haberler', translated: newsT, total: totalNews },
          { type: 'Sayfalar', translated: pageT, total: totalPages },
          { type: 'Kategoriler', translated: catT, total: totalCats },
        ],
        untranslatedPages: [],
      } satisfies LanguageRow;
    })
  );
  return rows;
}

export async function setLanguageActive(code: string, active: boolean): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'translations.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const lang = await prisma.language.findUnique({ where: { code } });
  if (lang?.isDefault && !active) return { success: false, error: 'Varsayılan dil devre dışı bırakılamaz.' };
  await prisma.language.update({ where: { code }, data: { isActive: active } });
  await recordAuditLog({ actorId: user!.id, action: 'language.toggle', entityType: 'language', entityId: code, newData: { active } });
  revalidatePath('/dil-yonetimi');
  return { success: true };
}

export async function setDefaultLanguage(code: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'translations.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.$transaction([
    prisma.language.updateMany({ data: { isDefault: false } }),
    prisma.language.update({ where: { code }, data: { isDefault: true, isActive: true } }),
  ]);
  await recordAuditLog({ actorId: user!.id, action: 'language.set_default', entityType: 'language', entityId: code });
  revalidatePath('/dil-yonetimi');
  return { success: true };
}
