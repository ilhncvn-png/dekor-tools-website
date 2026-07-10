'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { recordAuditLog, recordActivity } from '@/lib/audit/index';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// Deliberately generic — never reveals whether the email exists, whether the
// account is locked vs disabled, etc. Distinguishing those server-side (for
// the lockout timer and audit trail) is fine; leaking it to the client is not.
const GENERIC_LOGIN_ERROR = 'Kullanıcı adı veya şifre hatalı.';

export interface LoginResult {
  success: boolean;
  error?: string;
}

async function getRequestMeta() {
  const headerList = await headers();
  const ipAddress =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? null;
  const userAgent = headerList.get('user-agent');
  return { ipAddress, userAgent };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const { ipAddress, userAgent } = await getRequestMeta();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    await recordAuditLog({ actorId: null, action: 'login.failed', ipAddress, userAgent, newData: { email: normalizedEmail, reason: 'no_such_user' } });
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  if (user.status !== 'ACTIVE') {
    await recordAuditLog({ actorId: user.id, action: 'login.failed', ipAddress, userAgent, newData: { reason: 'inactive_user' } });
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordAuditLog({ actorId: user.id, action: 'login.failed', ipAddress, userAgent, newData: { reason: 'locked' } });
    return { success: false, error: 'Hesabınız geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.' };
  }

  const passwordValid = await verifyPassword(user.passwordHash, password);

  if (!passwordValid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : user.lockedUntil,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: 'login.failed',
      ipAddress,
      userAgent,
      newData: { reason: 'bad_password', failedLoginAttempts, locked: shouldLock },
    });

    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ipAddress },
  });

  await createSession(user.id, ipAddress, userAgent ?? null);

  await recordAuditLog({ actorId: user.id, action: 'login.success', ipAddress, userAgent });
  await recordActivity({ actorId: user.id, actorName: user.name, summary: `${user.name} giriş yaptı.` });

  return { success: true };
}

export async function logout(): Promise<void> {
  const user = await getCurrentUser();
  const { ipAddress, userAgent } = await getRequestMeta();

  await destroySession();

  if (user) {
    await recordAuditLog({ actorId: user.id, action: 'logout', ipAddress, userAgent });
  }
}
