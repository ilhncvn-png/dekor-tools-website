'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { RedirectRule } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

export async function getAdminRedirects(): Promise<RedirectRule[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'redirects.manage');
  const rows = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map((r) => ({
    id: r.id,
    from: r.fromPath,
    to: r.toPath,
    type: r.statusCode === 302 ? '302' : '301',
    hits: 0,
    createdAt: r.createdAt.toISOString().slice(0, 10),
  }));
}

const addSchema = z.object({
  from: z.string().min(1, 'Kaynak yol zorunludur.').max(400),
  to: z.string().min(1, 'Hedef yol zorunludur.').max(400),
  type: z.enum(['301', '302']).default('301'),
});

export async function addRedirect(input: z.infer<typeof addSchema>): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'redirects.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Doğrulama hatası.' };
  const { from, to, type } = parsed.data;

  const exists = await prisma.redirect.findUnique({ where: { fromPath: from } });
  if (exists) return { success: false, error: `"${from}" için zaten bir yönlendirme var.` };

  try {
    const r = await prisma.redirect.create({
      data: { fromPath: from, toPath: to, statusCode: type === '302' ? 302 : 301, createdById: user!.id },
    });
    await recordAuditLog({ actorId: user!.id, action: 'redirect.create', entityType: 'redirect', entityId: r.id, newData: { from, to } });
    revalidatePath('/yonlendirme-yonetimi');
    return { success: true, data: r };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Ekleme başarısız oldu.' };
  }
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'redirects.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.redirect.delete({ where: { id } });
  await recordAuditLog({ actorId: user!.id, action: 'redirect.delete', entityType: 'redirect', entityId: id });
  revalidatePath('/yonlendirme-yonetimi');
  return { success: true };
}
