'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

/**
 * Generic key/value settings store backed by the SiteSetting table. Used for
 * structured config blobs (header config, footer config, theme, etc.) that map
 * to a single JSON document per key. Returns null when the key has never been
 * saved, so callers fall back to their defaults.
 */
export async function getSiteSetting<T = unknown>(key: string): Promise<T | null> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'settings.manage');
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return (row?.value as T) ?? null;
}

export async function saveSiteSetting(key: string, value: unknown): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'settings.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  try {
    const json = JSON.parse(JSON.stringify(value));
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: json },
      create: { key, value: json },
    });
    await recordAuditLog({ actorId: user!.id, action: 'setting.update', entityType: 'site_setting', entityId: key });
    revalidatePath('/footer-yonetimi');
    revalidatePath('/header-yonetimi');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}
