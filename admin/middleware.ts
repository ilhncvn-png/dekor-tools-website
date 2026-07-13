import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/token';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';
import { isDatabaseAuthEnabled } from '@/lib/auth/flags';
import { getLegacyRecoveryConfig, verifyLegacyToken } from '@/lib/auth/legacy-recovery';

/**
 * Fast, cheap, Edge-safe gate that runs before any page renders — this is
 * what prevents protected routes from flashing content for an
 * unauthenticated visitor. It checks the cookie's HMAC signature and
 * expiry ONLY: the Edge runtime cannot reach Prisma/Postgres, so it cannot
 * see session revocation or a disabled user.
 *
 * Two modes, selected by CMS_DATABASE_AUTH_ENABLED:
 *  - false (default, legacy recovery): verify the cookie against the HMAC
 *    key derived from LEGACY_ADMIN_PASSWORD_HASH. Needs NO AUTH_SECRET /
 *    DATABASE_URL, so it works on a production deployment that hasn't been
 *    provisioned with the real CMS variables yet.
 *  - true (real auth): verify the signed session token with AUTH_SECRET
 *    (lib/auth/token.ts). The authoritative DB re-check then happens in
 *    lib/auth/session.ts's getCurrentUser() inside every Server Action —
 *    middleware alone is intentionally not the security boundary.
 *
 * Either way (fail-closed on missing config):
 * - "/" (login route): valid cookie -> redirect to /genel-bakis.
 *                       no/invalid cookie  -> allow (show login only).
 * - every other route: valid cookie -> allow.
 *                       no/invalid cookie  -> redirect to "/".
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let hasValidSignedToken: boolean;
  if (isDatabaseAuthEnabled()) {
    const authSecret = process.env.AUTH_SECRET;
    // Fail closed: an unconfigured AUTH_SECRET must never be treated as "no
    // session required" — every route behaves as if no valid session exists.
    hasValidSignedToken = Boolean(token && authSecret && (await verifyToken(token, authSecret)));
  } else {
    const config = getLegacyRecoveryConfig();
    hasValidSignedToken = Boolean(config && (await verifyLegacyToken(token, config.passwordHash)));
  }

  if (pathname === '/') {
    if (hasValidSignedToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/genel-bakis';
      const response = NextResponse.redirect(url);
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (!hasValidSignedToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
