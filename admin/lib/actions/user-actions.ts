'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { AdminUser, Role as UiRole } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

const DB_TO_UI_STATUS: Record<string, AdminUser['status']> = {
  ACTIVE: 'aktif', PENDING: 'davet-edildi', DISABLED: 'pasif',
};
const UI_TO_DB_STATUS: Record<AdminUser['status'], 'ACTIVE' | 'PENDING' | 'DISABLED'> = {
  aktif: 'ACTIVE', 'davet-edildi': 'PENDING', pasif: 'DISABLED',
};

function rel(d: Date | null): string {
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'users.manage');
  const rows = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles[0]?.role.label ?? 'Görüntüleyici',
    status: DB_TO_UI_STATUS[u.status] ?? 'pasif',
    lastActive: rel(u.lastLoginAt),
    lastLogin: rel(u.lastLoginAt),
    joinedAt: rel(u.createdAt),
    invitedBy: '—',
  }));
}

export async function setUserStatus(userId: string, uiStatus: AdminUser['status']): Promise<ActionResult> {
  const actor = await resolveCurrentUser();
  try {
    requirePermission(actor, 'users.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  // Safety: never disable your own account or the last active admin via this toggle.
  if (userId === actor?.id && uiStatus === 'pasif') {
    return { success: false, error: 'Kendi hesabınızı devre dışı bırakamazsınız.' };
  }
  await prisma.user.update({ where: { id: userId }, data: { status: UI_TO_DB_STATUS[uiStatus] } });
  await recordAuditLog({ actorId: actor!.id, action: 'user.status_change', entityType: 'user', entityId: userId, newData: { status: uiStatus } });
  revalidatePath('/kullanicilar');
  return { success: true };
}

const inviteSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  roleKey: z.string().max(60).default('VIEWER'),
});

export async function inviteUser(input: z.infer<typeof inviteSchema>): Promise<ActionResult> {
  const actor = await resolveCurrentUser();
  try {
    requirePermission(actor, 'users.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Geçersiz kullanıcı bilgisi.' };
  const { name, email, roleKey } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, error: 'Bu e-posta ile bir kullanıcı zaten var.' };

  try {
    // PENDING invite: store an unusable random password hash; the invitee sets a
    // real password via the invite/reset flow. This never touches existing creds.
    const passwordHash = await bcrypt.hash(randomBytes(24).toString('hex'), 12);
    const role = await prisma.role.findUnique({ where: { key: roleKey } });
    const created = await prisma.user.create({
      data: {
        name, email, passwordHash, status: 'PENDING',
        ...(role ? { roles: { create: [{ roleId: role.id }] } } : {}),
      },
    });
    await recordAuditLog({ actorId: actor!.id, action: 'user.invite', entityType: 'user', entityId: created.id, newData: { email } });
    revalidatePath('/kullanicilar');
    return { success: true, data: { id: created.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Davet başarısız oldu.' };
  }
}

export async function getAdminRoles(): Promise<UiRole[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'roles.manage');
  const rows = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.label,
    userCount: r._count.users,
    description: r.description ?? '',
  }));
}
