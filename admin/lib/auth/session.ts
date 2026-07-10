import 'server-only';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { signToken, verifyToken } from '@/lib/auth/token';
import { getAuthEnv } from '@/lib/env';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

export { SESSION_COOKIE_NAME };
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours, matches the prior staging session lifetime

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[]; // Role.key values
  permissions: string[]; // Permission.key values, flattened across all roles
}

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a DB-backed session row plus a signed cookie token, and sets the
 * cookie. Called only from the login Server Action, never from middleware
 * (which cannot write to the database).
 */
export async function createSession(userId: string, ipAddress: string | null, userAgent: string | null): Promise<void> {
  const env = getAuthEnv();
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  const session = await prisma.session.create({
    data: { userId, tokenHash, ipAddress, userAgent, expiresAt },
  });

  const signedToken = await signToken(
    { sessionId: session.id, userId, exp: Math.floor(expiresAt.getTime() / 1000) },
    env.AUTH_SECRET
  );

  // The cookie carries the SIGNED TOKEN (session id + expiry + HMAC), not the
  // raw session token used to look up the DB row — those are different
  // values by design; see lib/auth/token.ts's header comment.
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Authoritative, DB-backed session check. Verifies the cookie's signature
 * AND that the underlying Session row still exists, is unexpired, unrevoked,
 * and belongs to an ACTIVE user — a signature check alone (as done in
 * middleware.ts) cannot catch revocation or a disabled/deleted user.
 *
 * This is what every Server Action and API route must call before doing
 * anything sensitive — per the migration spec, middleware is a UX
 * convenience (avoids a content flash), not the security boundary.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const env = getAuthEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token, env.AUTH_SECRET);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.userId !== payload.userId) return null;
  if (session.user.status !== 'ACTIVE' || session.user.deletedAt) return null;

  const roles = session.user.roles.map((ur) => ur.role.key);
  const permissions = Array.from(
    new Set(session.user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)))
  );

  return { id: session.user.id, name: session.user.name, email: session.user.email, roles, permissions };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const env = getAuthEnv();
    const payload = await verifyToken(token, env.AUTH_SECRET).catch(() => null);
    if (payload) {
      await prisma.session.updateMany({
        where: { id: payload.sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
