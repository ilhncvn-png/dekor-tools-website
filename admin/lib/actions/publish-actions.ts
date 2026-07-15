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
  getCurrentSnapshotUrl,
} from '@/lib/publish/snapshot-store';

export interface PublishActionResult {
  success: boolean;
  error?: string;
  version?: string;
  currentUrl?: string;
  count?: number;
  previousVersion?: string | null;
}

/**
 * Generate a fresh snapshot from the currently-PUBLISHED products in Neon and
 * atomically promote it to the live pointer the public pages read. This is the
 * ONLY thing that changes public product content — saving a draft does not
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
    const result = await promoteProductSnapshot(manifest);

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
    return { success: true, version: result.version, currentUrl: result.currentUrl, count: result.count, previousVersion: result.previousVersion };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Yayınlama başarısız oldu.' };
  }
}

/** Restore the previously-published snapshot (atomic). Reversible: rollback
 * itself becomes the new current, with the rolled-back version as previous. */
export async function rollbackSiteProducts(): Promise<PublishActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'products.publish');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  try {
    const result = await rollbackProductSnapshot();
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
    return { success: true, version: result.restoredVersion, currentUrl: result.currentUrl, count: result.count };
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
  const [meta, currentUrl] = await Promise.all([getSnapshotMeta(), getCurrentSnapshotUrl()]);
  return {
    currentUrl,
    current: meta.current ? { version: meta.current.version, promotedAt: meta.current.promotedAt, count: meta.current.count } : null,
    previous: meta.previous ? { version: meta.previous.version, promotedAt: meta.previous.promotedAt, count: meta.previous.count } : null,
    historyCount: meta.history.length,
  };
}
