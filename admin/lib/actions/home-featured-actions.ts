'use server';

import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { HOME_FEATURED_KEY, orderFeatured } from '@/lib/catalog/home-featured';
import type { ActionResult } from './category-actions';

// "Ana Sayfa Vitrini" — manages the home-page "Öne Çıkan Ürünler" slider.
// Membership = Product.featured; order = ProductCollection rows under
// HOME_FEATURED_KEY. Only those two things are ever written here: no product is
// deleted, no id changes, and no other collection key is touched.

const PAGE_PATH = '/ana-sayfa-vitrini';
const LANG = 'tr';
const MAX_SHOWCASE = 500;

export type HomeFeaturedStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface HomeFeaturedItem {
  id: string;
  sku: string;
  name: string;
  categoryName: string | null;
  status: HomeFeaturedStatus;
  thumbnailUrl: string | null;
  variantCount: number;
  /** Turkish reasons this product should not be showcased (empty = healthy). */
  warnings: string[];
}

export interface HomeFeaturedData {
  featured: HomeFeaturedItem[];
  candidates: HomeFeaturedItem[];
}

const productIdSchema = z.string().trim().min(1, 'Ürün seçilmedi.').max(64);
const reorderSchema = z
  .array(productIdSchema)
  .min(1, 'Sıralanacak ürün yok.')
  .max(MAX_SHOWCASE)
  .refine((ids) => new Set(ids).size === ids.length, 'Aynı ürün listede birden fazla kez geçiyor.');

const productInclude = {
  translations: { where: { languageCode: LANG } },
  category: { include: { translations: { where: { languageCode: LANG } } } },
  media: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
  _count: { select: { variants: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Primary photo first; otherwise the first product photo the public card would use. */
function pickThumbnail(p: ProductRow): string | null {
  const usable = p.media.filter((m) => !m.media.deletedAt && m.media.url);
  const primary = usable.find((m) => m.role === 'primary');
  const photo = primary ?? usable.find((m) => (m.itemType ?? '') !== 'APPLICATION' && m.role !== 'spec-sheet');
  return photo?.media.url ?? null;
}

function toItem(p: ProductRow): HomeFeaturedItem {
  const thumbnailUrl = pickThumbnail(p);
  const variantCount = p._count.variants;
  const warnings: string[] = [];
  if (p.status !== 'PUBLISHED') warnings.push('Yayında değil — sitede görünmez');
  if (!thumbnailUrl) warnings.push('Fotoğraf yok');
  if (variantCount === 0) warnings.push('Varyant yok');
  return {
    id: p.id,
    sku: p.sku,
    name: p.translations[0]?.name ?? p.sku,
    categoryName: p.category?.translations[0]?.name ?? null,
    status: p.status,
    thumbnailUrl,
    variantCount,
    warnings,
  };
}

type Tx = Prisma.TransactionClient;

/** Featured, non-deleted products in showcase order (same rule the snapshot uses). */
async function loadOrderedFeatured(db: Tx | typeof prisma): Promise<{ id: string; sku: string }[]> {
  const products = await db.product.findMany({
    where: { deletedAt: null, featured: true },
    select: { id: true, sku: true, featured: true, sortOrder: true },
    orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }],
  });
  const rows = await db.productCollection.findMany({
    where: { collectionKey: HOME_FEATURED_KEY, productId: { in: products.map((p) => p.id) } },
    select: { productId: true, collectionKey: true, sortOrder: true },
  });
  const bySku = new Map(products.map((p) => [p.sku, p]));
  return orderFeatured(products, rows).flatMap((sku) => {
    const p = bySku.get(sku);
    return p ? [{ id: p.id, sku: p.sku }] : [];
  });
}

/** Writes sortOrder = index for every id, only under HOME_FEATURED_KEY. */
async function writeOrder(tx: Tx, productIds: string[]): Promise<void> {
  for (const [index, productId] of productIds.entries()) {
    await tx.productCollection.upsert({
      where: { productId_collectionKey: { productId, collectionKey: HOME_FEATURED_KEY } },
      update: { sortOrder: index },
      create: { productId, collectionKey: HOME_FEATURED_KEY, sortOrder: index },
    });
  }
}

async function authorize(permission: string) {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, permission);
  } catch {
    return null;
  }
  return user;
}

const FORBIDDEN: ActionResult = { success: false, error: 'Bu işlem için yetkiniz yok.' };

export async function getHomeFeatured(): Promise<HomeFeaturedData> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'products.view');

  const [ordered, rows] = await Promise.all([
    loadOrderedFeatured(prisma),
    prisma.product.findMany({
      where: { deletedAt: null },
      include: productInclude,
      orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }],
    }),
  ]);
  const byId = new Map(rows.map((p) => [p.id, p]));
  const featured = ordered.flatMap(({ id }) => {
    const p = byId.get(id);
    return p ? [toItem(p)] : [];
  });
  const candidates = rows.filter((p) => !p.featured).map(toItem);
  return { featured, candidates };
}

export async function addHomeFeatured(productId: string): Promise<ActionResult> {
  const user = await authorize('products.update');
  if (!user) return FORBIDDEN;
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz ürün.' };
  const id = parsed.data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const target = await tx.product.findFirst({ where: { id, deletedAt: null }, include: { translations: { where: { languageCode: LANG } } } });
      if (!target) throw new Error('Ürün bulunamadı.');
      if (target.featured) throw new Error('Bu ürün zaten vitrinde.');
      const current = await loadOrderedFeatured(tx);
      await tx.product.update({ where: { id }, data: { featured: true, editorId: user.id } });
      // Materialise the whole order so the new product lands at the very end,
      // after any product flagged elsewhere without an explicit position.
      await writeOrder(tx, [...current.map((p) => p.id), id]);
      return { sku: target.sku, name: target.translations[0]?.name ?? target.sku, position: current.length };
    });

    await recordAuditLog({ actorId: user.id, action: 'product.home_featured.add', entityType: 'product', entityId: id, previousData: { featured: false }, newData: { featured: true, sku: product.sku, position: product.position } });
    await recordActivity({ actorId: user.id, actorName: user.name, summary: `${user.name} "${product.name}" ürününü ana sayfa vitrinine ekledi.`, entityType: 'product', entityId: id });
    revalidatePath(PAGE_PATH);
    revalidatePath('/urun-yonetimi');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Ürün vitrine eklenemedi.' };
  }
}

export async function removeHomeFeatured(productId: string): Promise<ActionResult> {
  const user = await authorize('products.update');
  if (!user) return FORBIDDEN;
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz ürün.' };
  const id = parsed.data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const target = await tx.product.findUnique({ where: { id }, include: { translations: { where: { languageCode: LANG } } } });
      if (!target) throw new Error('Ürün bulunamadı.');
      await tx.product.update({ where: { id }, data: { featured: false, editorId: user.id } });
      await tx.productCollection.deleteMany({ where: { productId: id, collectionKey: HOME_FEATURED_KEY } });
      return { sku: target.sku, name: target.translations[0]?.name ?? target.sku, wasFeatured: target.featured };
    });

    await recordAuditLog({ actorId: user.id, action: 'product.home_featured.remove', entityType: 'product', entityId: id, previousData: { featured: product.wasFeatured }, newData: { featured: false, sku: product.sku } });
    await recordActivity({ actorId: user.id, actorName: user.name, summary: `${user.name} "${product.name}" ürününü ana sayfa vitrininden çıkardı.`, entityType: 'product', entityId: id });
    revalidatePath(PAGE_PATH);
    revalidatePath('/urun-yonetimi');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Ürün vitrinden çıkarılamadı.' };
  }
}

export async function reorderHomeFeatured(productIds: string[]): Promise<ActionResult> {
  const user = await authorize('products.update');
  if (!user) return FORBIDDEN;
  const parsed = reorderSchema.safeParse(productIds);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz sıralama.' };
  const ids = parsed.data;

  try {
    const previous = await prisma.$transaction(async (tx) => {
      const current = await loadOrderedFeatured(tx);
      const currentIds = new Set(current.map((p) => p.id));
      if (currentIds.size !== ids.length || ids.some((pid) => !currentIds.has(pid))) {
        throw new Error('Vitrin listesi bu arada değişti. Sayfayı yenileyip tekrar deneyin.');
      }
      await writeOrder(tx, ids);
      return current.map((p) => p.sku);
    });

    const idToSku = new Map((await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, sku: true } })).map((p) => [p.id, p.sku]));
    await recordAuditLog({ actorId: user.id, action: 'product.home_featured.reorder', entityType: 'product_collection', entityId: HOME_FEATURED_KEY, previousData: { order: previous }, newData: { order: ids.map((pid) => idToSku.get(pid) ?? pid) } });
    await recordActivity({ actorId: user.id, actorName: user.name, summary: `${user.name} ana sayfa vitrinindeki ürünlerin sırasını güncelledi.`, entityType: 'product_collection', entityId: HOME_FEATURED_KEY });
    revalidatePath(PAGE_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Sıralama kaydedilemedi.' };
  }
}
