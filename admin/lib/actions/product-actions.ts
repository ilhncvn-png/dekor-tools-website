'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { productInputSchema, type ProductInput } from '@/lib/validation/product';
import { toUiProduct } from '@/lib/adapters/product-adapter';
import type { Product } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

export async function saveProduct(productId: string | null, input: ProductInput): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, productId ? 'products.update' : 'products.create');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const data = parsed.data;

  const skuOwner = await prisma.product.findFirst({ where: { sku: data.sku, id: productId ? { not: productId } : undefined } });
  if (skuOwner) {
    return { success: false, error: `"${data.sku}" ürün kodu zaten kullanılıyor.` };
  }

  for (const t of data.translations) {
    const existing = await prisma.productTranslation.findFirst({
      where: { languageCode: t.languageCode, slug: t.slug, productId: productId ? { not: productId } : undefined },
    });
    if (existing) {
      return { success: false, error: `"${t.slug}" slug'ı (${t.languageCode}) zaten kullanılıyor.` };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingProduct = productId
        ? await tx.product.findUnique({ where: { id: productId }, include: { translations: true, features: true, specs: true, media: true } })
        : null;

      const commerce = {
        featured: data.featured,
        stockState: data.stockState,
        price: data.price ?? null,
        weightKg: data.weightKg ?? null,
        exportCountries: data.exportCountries,
        swatch: data.swatch ?? null,
        videoMediaId: data.videoMediaId ?? null,
        documentId: data.documentId ?? null,
        ogImageMediaId: data.ogImageMediaId ?? null,
        relatedProductIds: data.relatedProductIds,
      };
      const product = productId
        ? await tx.product.update({
            where: { id: productId },
            data: { sku: data.sku, categoryId: data.categoryId ?? null, editorId: user!.id, ...commerce },
          })
        : await tx.product.create({
            data: {
              sku: data.sku,
              slug: data.translations.find((t) => t.languageCode === 'tr')!.slug,
              categoryId: data.categoryId ?? null,
              authorId: user!.id,
              ...commerce,
            },
          });

      for (const t of data.translations) {
        const trData = {
          name: t.name,
          slug: t.slug,
          shortDescription: t.shortDescription,
          description: t.description,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        };
        await tx.productTranslation.upsert({
          where: { productId_languageCode: { productId: product.id, languageCode: t.languageCode } },
          update: trData,
          create: { productId: product.id, languageCode: t.languageCode, ...trData },
        });
      }

      await tx.productFeature.deleteMany({ where: { productId: product.id } });
      if (data.features.length) {
        await tx.productFeature.createMany({
          data: data.features.map((f) => ({ productId: product.id, languageCode: f.languageCode, label: f.label, sortOrder: f.sortOrder })),
        });
      }

      await tx.productTechnicalSpecification.deleteMany({ where: { productId: product.id } });
      if (data.specs.length) {
        await tx.productTechnicalSpecification.createMany({
          data: data.specs.map((s) => ({ productId: product.id, languageCode: s.languageCode, label: s.label, value: s.value, sortOrder: s.sortOrder })),
        });
      }

      await tx.productMedia.deleteMany({ where: { productId: product.id } });
      if (data.mediaIds.length) {
        await tx.productMedia.createMany({
          data: data.mediaIds.map((mediaId, i) => ({ productId: product.id, mediaId, role: i === 0 ? 'primary' : 'gallery', sortOrder: i })),
        });
      }

      await tx.productRevision.create({
        data: {
          productId: product.id,
          snapshot: JSON.parse(JSON.stringify({ ...product, translations: data.translations, features: data.features, specs: data.specs })),
          action: productId ? 'UPDATE' : 'CREATE',
          authorId: user!.id,
        },
      });
      await tx.contentRevision.create({
        data: {
          entityType: 'product',
          entityId: product.id,
          action: productId ? 'UPDATE' : 'CREATE',
          previousData: existingProduct ? JSON.parse(JSON.stringify(existingProduct)) : undefined,
          authorId: user!.id,
        },
      });

      return product;
    });

    await recordAuditLog({ actorId: user!.id, action: productId ? 'product.update' : 'product.create', entityType: 'product', entityId: result.id, newData: { sku: result.sku } });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} "${data.translations.find((t) => t.languageCode === 'tr')?.name}" ürününü ${productId ? 'güncelledi' : 'oluşturdu'}.`,
      entityType: 'product',
      entityId: result.id,
    });

    revalidatePath('/urun-yonetimi');
    revalidateTag('products');
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kaydetme başarısız oldu.';
    return { success: false, error: message };
  }
}

async function transitionProductStatus(
  productId: string,
  status: 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED',
  action: 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE',
  permission: string
): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, permission);
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, include: { translations: true } });
  if (!product) return { success: false, error: 'Ürün bulunamadı.' };

  if (action === 'PUBLISH') {
    const trTranslation = product.translations.find((t) => t.languageCode === 'tr');
    if (!trTranslation || !trTranslation.name) {
      return { success: false, error: 'Yayınlamadan önce Türkçe içerik gereklidir.' };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : product.publishedAt },
    });
    await tx.contentRevision.create({
      data: { entityType: 'product', entityId: productId, action, authorId: user!.id },
    });
  });

  await recordAuditLog({ actorId: user!.id, action: `product.${action.toLowerCase()}`, entityType: 'product', entityId: productId });
  revalidatePath('/urun-yonetimi');
  revalidateTag('products');
  return { success: true };
}

export const publishProduct = (id: string) => transitionProductStatus(id, 'PUBLISHED', 'PUBLISH', 'products.publish');
export const unpublishProduct = (id: string) => transitionProductStatus(id, 'UNPUBLISHED', 'UNPUBLISH', 'products.publish');
export const archiveProduct = (id: string) => transitionProductStatus(id, 'ARCHIVED', 'ARCHIVE', 'products.delete');

export async function softDeleteProduct(productId: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'products.delete');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.product.update({ where: { id: productId }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'product.delete', entityType: 'product', entityId: productId });
  revalidatePath('/urun-yonetimi');
  revalidateTag('products');
  return { success: true };
}

export async function listProducts(params: {
  query?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
  page?: number;
  pageSize?: number;
}) {
  const user = await resolveCurrentUser();
  requirePermission(user, 'products.view');

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;

  const where = {
    deletedAt: null,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.query ? { translations: { some: { name: { contains: params.query, mode: 'insensitive' as const } } } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { translations: true, category: { include: { translations: true } }, media: { include: { media: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

/**
 * UI-shaped read used by the Product Management screen. Returns every non-deleted
 * product mapped to the exact `Product` shape the existing table/drawer consume,
 * so the page renders unchanged while reading real PostgreSQL.
 */
export async function getAdminProducts(): Promise<Product[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'products.view');

  const rows = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      translations: true,
      category: { include: { translations: true } },
      media: true,
      specs: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(toUiProduct);
}
