'use server';

import { headers, cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { recordAuditLog, recordActivity } from '@/lib/audit/index';
import { isDatabaseAuthEnabled } from '@/lib/auth/flags';
import { getLegacyRecoveryConfig, signLegacyToken, LEGACY_SESSION_MAX_AGE } from '@/lib/auth/legacy-recovery';

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

/**
 * Entry point the login form calls. Routes to the temporary legacy-recovery
 * path or the real database path depending on CMS_DATABASE_AUTH_ENABLED, so
 * the DB path (Prisma + argon2 + AUTH_SECRET session signing) is never
 * exercised until the operator has provisioned production Postgres and
 * flipped the flag.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Defensive wrap: a login endpoint must never surface a raw 500 to the
  // browser. Any unexpected error (misconfiguration, transient failure)
  // degrades to the generic invalid-credentials message instead.
  try {
    if (!isDatabaseAuthEnabled()) {
      return await legacyLogin(email, password);
    }
    return await databaseLogin(email, password);
  } catch {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }
}

/**
 * TEMPORARY recovery login. Verifies email + argon2 password hash from env
 * vars (LEGACY_ADMIN_EMAIL / LEGACY_ADMIN_PASSWORD_HASH) — no database, no
 * AUTH_SECRET. On success, sets the same session cookie, signed with the
 * password hash as the HMAC key (see lib/auth/legacy-recovery.ts). Remove
 * once real database auth is verified.
 */
async function legacyLogin(email: string, password: string): Promise<LoginResult> {
  const config = getLegacyRecoveryConfig();
  if (!config) {
    // Recovery not configured (missing env vars) -> fail closed, never crash.
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailMatches = normalizedEmail === config.email;
  let passwordMatches = false;
  try {
    passwordMatches = await bcrypt.compare(password, config.passwordHash);
  } catch {
    passwordMatches = false; // malformed hash env -> treated as no match
  }

  if (!emailMatches || !passwordMatches) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const token = await signLegacyToken(config.passwordHash);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: LEGACY_SESSION_MAX_AGE,
  });

  return { success: true };
}

async function databaseLogin(email: string, password: string): Promise<LoginResult> {
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
  if (!isDatabaseAuthEnabled()) {
    // Legacy recovery: just clear the cookie. No DB session to revoke, and
    // no database available to audit against.
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return;
  }

  const user = await getCurrentUser();
  const { ipAddress, userAgent } = await getRequestMeta();

  await destroySession();

  if (user) {
    await recordAuditLog({ actorId: user.id, action: 'logout', ipAddress, userAgent });
  }
}
