'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { revalidatePath, revalidateTag } from 'next/cache';
import { buildProductSnapshot } from '@/lib/publish/product-snapshot';
import {
  promoteProductSnapshot,
  rollbackProductSnapshot,
  getSnapshotMeta,
} from '@/lib/publish/snapshot-store';

export interface PublishActionResult {
  success: boolean;
  error?: string;
  version?: string;
  count?: number;
  previousVersion?: string | null;
}

/**
 * Generate a fresh snapshot from the currently-PUBLISHED products in Neon and
 * atomically promote it to the live pointer the public endpoint reads. This is
 * the ONLY thing that changes public product content — saving a draft does not
 * touch the snapshot, so drafts stay private until this runs.
 */
export async function publishSiteProducts(): Promise<PublishActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'products.publish');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  try {
    const manifest = await buildProductSnapshot(prisma);
    const result = await promoteProductSnapshot(prisma, manifest, user!.id === 'legacy-recovery' ? null : user!.id);

    await recordAuditLog({
      actorId: user!.id,
      action: 'site.publish_products',
      entityType: 'product_snapshot',
      entityId: result.version,
      newData: { version: result.version, count: result.count, previousVersion: result.previousVersion },
    });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} ürün kataloğunu siteye yayınladı (${result.count} ürün · ${result.version}).`,
      entityType: 'product_snapshot',
      entityId: result.version,
    });

    revalidatePath('/urun-yonetimi');
    revalidateTag('products');
    return { success: true, version: result.version, count: result.count, previousVersion: result.previousVersion };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Yayınlama başarısız oldu.' };
  }
}

/** Restore the previously-published snapshot (atomic pointer swap). Reversible. */
export async function rollbackSiteProducts(): Promise<PublishActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'products.publish');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  try {
    const result = await rollbackProductSnapshot(prisma, user!.id === 'legacy-recovery' ? null : user!.id);
    await recordAuditLog({
      actorId: user!.id,
      action: 'site.rollback_products',
      entityType: 'product_snapshot',
      entityId: result.restoredVersion,
      newData: { restoredVersion: result.restoredVersion, count: result.count },
    });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} ürün yayınını geri aldı (${result.restoredVersion} sürümüne döndü).`,
      entityType: 'product_snapshot',
      entityId: result.restoredVersion,
    });
    revalidatePath('/urun-yonetimi');
    revalidateTag('products');
    return { success: true, version: result.restoredVersion, count: result.count };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Geri alma başarısız oldu.' };
  }
}

export interface PublishStatus {
  currentUrl: string | null;
  current: { version: string; promotedAt: string; count: number } | null;
  previous: { version: string; promotedAt: string; count: number } | null;
  historyCount: number;
}

export async function getPublishStatus(): Promise<PublishStatus> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'products.view');
  const meta = await getSnapshotMeta(prisma);
  // Public, unauthenticated read endpoint the static pages consume. It lives
  // under the admin basePath, so the full URL is <site>/admin/api/public/products.
  const base = (process.env.PUBLIC_SITE_URL || process.env.APP_URL || '').replace(/\/$/, '');
  return {
    currentUrl: meta.current ? `${base}/admin/api/public/products` : null,
    current: meta.current,
    previous: meta.previous,
    historyCount: meta.historyCount,
  };
}
