'use server';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { categoryInputSchema, type CategoryInput } from '@/lib/validation/category';
import { toUiCategory } from '@/lib/adapters/category-adapter';
import type { Category } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function assertNoParentLoop(categoryId: string | null, parentId: string | null): Promise<boolean> {
  if (!parentId || !categoryId) return true;
  let current: string | null = parentId;
  const seen = new Set<string>();
  while (current) {
    if (current === categoryId) return false; // would create a cycle
    if (seen.has(current)) return false;
    seen.add(current);
    const parent: { parentId: string | null } | null = await prisma.productCategory.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = parent?.parentId ?? null;
  }
  return true;
}

export async function saveCategory(categoryId: string | null, input: CategoryInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const data = parsed.data;

  if (!(await assertNoParentLoop(categoryId, data.parentId ?? null))) {
    return { success: false, error: 'Seçilen üst kategori döngü oluşturuyor.' };
  }

  // Slug collision check per language, excluding the record being edited.
  for (const t of data.translations) {
    const existing = await prisma.productCategoryTranslation.findFirst({
      where: { languageCode: t.languageCode, slug: t.slug, categoryId: categoryId ? { not: categoryId } : undefined },
    });
    if (existing) {
      return { success: false, error: `"${t.slug}" slug'ı (${t.languageCode}) zaten kullanılıyor.` };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingCategory = categoryId
        ? await tx.productCategory.findUnique({ where: { id: categoryId }, include: { translations: true } })
        : null;

      const commonData = {
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder,
        isVisible: data.isVisible,
        code: data.code ?? null,
        icon: data.icon ?? null,
        showOnHomepage: data.showOnHomepage,
        showInNavigation: data.showInNavigation,
      };
      const category = categoryId
        ? await tx.productCategory.update({ where: { id: categoryId }, data: commonData })
        : await tx.productCategory.create({
            data: { key: data.key, slug: data.translations.find((t) => t.languageCode === 'tr')!.slug, ...commonData },
          });

      for (const t of data.translations) {
        const translationData = {
          name: t.name,
          slug: t.slug,
          description: t.description,
          heroTitle: t.heroTitle,
          heroDescription: t.heroDescription,
          cardTitle: t.cardTitle,
          cardDescription: t.cardDescription,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        };
        await tx.productCategoryTranslation.upsert({
          where: { categoryId_languageCode: { categoryId: category.id, languageCode: t.languageCode } },
          update: translationData,
          create: { categoryId: category.id, languageCode: t.languageCode, ...translationData },
        });
      }

      await tx.contentRevision.create({
        data: {
          entityType: 'product_category',
          entityId: category.id,
          action: categoryId ? 'UPDATE' : 'CREATE',
          previousData: existingCategory ? JSON.parse(JSON.stringify(existingCategory)) : undefined,
          newData: JSON.parse(JSON.stringify({ ...category, translations: data.translations })),
          authorId: user!.id,
        },
      });

      return category;
    });

    await recordAuditLog({
      actorId: user!.id,
      action: categoryId ? 'category.update' : 'category.create',
      entityType: 'product_category',
      entityId: result.id,
      newData: { key: result.key },
    });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} "${data.translations.find((t) => t.languageCode === 'tr')?.name}" kategorisini ${categoryId ? 'güncelledi' : 'oluşturdu'}.`,
      entityType: 'product_category',
      entityId: result.id,
    });

    revalidatePath('/kategori-yonetimi');
    revalidateTag('categories');
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kaydetme başarısız oldu.';
    return { success: false, error: message };
  }
}

export async function publishCategory(categoryId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const category = await prisma.productCategory.findUnique({ where: { id: categoryId }, include: { translations: true } });
  if (!category) return { success: false, error: 'Kategori bulunamadı.' };
  if (category.translations.length === 0) {
    return { success: false, error: 'Yayınlamadan önce en az bir dil için içerik gereklidir.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.productCategory.update({ where: { id: categoryId }, data: { isVisible: true } });
    await tx.contentRevision.create({
      data: { entityType: 'product_category', entityId: categoryId, action: 'PUBLISH', authorId: user!.id },
    });
  });

  await recordAuditLog({ actorId: user!.id, action: 'category.publish', entityType: 'product_category', entityId: categoryId });
  revalidatePath('/kategori-yonetimi');
  revalidateTag('categories');
  return { success: true };
}

export async function softDeleteCategory(categoryId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const productCount = await prisma.product.count({ where: { categoryId, deletedAt: null } });
  if (productCount > 0) {
    return { success: false, error: `Bu kategoride ${productCount} ürün var. Önce ürünleri taşıyın veya silin.` };
  }

  await prisma.productCategory.update({ where: { id: categoryId }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'category.delete', entityType: 'product_category', entityId: categoryId });
  revalidatePath('/kategori-yonetimi');
  revalidateTag('categories');
  return { success: true };
}

export async function restoreCategory(categoryId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  await prisma.productCategory.update({ where: { id: categoryId }, data: { deletedAt: null } });
  await recordAuditLog({ actorId: user!.id, action: 'category.restore', entityType: 'product_category', entityId: categoryId });
  revalidatePath('/kategori-yonetimi');
  revalidateTag('categories');
  return { success: true };
}

export async function listCategories(params: { query?: string; includeDeleted?: boolean } = {}) {
  const user = await getCurrentUser();
  requirePermission(user, 'categories.manage');

  return prisma.productCategory.findMany({
    where: {
      deletedAt: params.includeDeleted ? undefined : null,
      ...(params.query
        ? { translations: { some: { name: { contains: params.query, mode: 'insensitive' as const } } } }
        : {}),
    },
    include: { translations: true, _count: { select: { products: true, children: true } } },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Read categories already mapped to the exact shape the Category Management
 * UI consumes (lib/mock-data.ts's `Category`). This is the drop-in
 * replacement for the page's mock `categories` import — same shape, real
 * PostgreSQL data.
 */
export async function getAdminCategories(): Promise<Category[]> {
  const user = await getCurrentUser();
  requirePermission(user, 'categories.manage');

  const rows = await prisma.productCategory.findMany({
    where: { deletedAt: null },
    include: { translations: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map(toUiCategory);
}

/** Persists a new sibling order for reorder controls. */
export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productCategory.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  await recordAuditLog({ actorId: user!.id, action: 'category.reorder', entityType: 'product_category', newData: { orderedIds } });
  revalidatePath('/kategori-yonetimi');
  revalidateTag('categories');
  return { success: true };
}
