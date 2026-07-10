import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/token';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * Fast, cheap, Edge-safe gate that runs before any page renders — this is
 * what prevents protected routes from flashing content for an
 * unauthenticated visitor. It checks the cookie's HMAC signature and
 * expiry ONLY (see lib/auth/token.ts): the Edge runtime cannot reach
 * Prisma/Postgres, so it cannot see session revocation or a disabled user.
 *
 * That authoritative check happens in lib/auth/session.ts's getCurrentUser(),
 * which every Server Action and Route Handler calls independently. A user
 * who is revoked/disabled after this middleware approves a request will
 * still be rejected the moment they hit any real Server Action — see
 * requirePermission() in lib/permissions. This two-layer split is
 * intentional, not a shortcut: it's what the migration spec means by
 * "Middleware alone is not sufficient."
 *
 * - "/" (login route): valid signed cookie -> redirect to /genel-bakis.
 *                       no/invalid cookie  -> allow (show login only).
 * - every other route: valid signed cookie -> allow.
 *                       no/invalid cookie  -> redirect to "/".
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authSecret = process.env.AUTH_SECRET;

  // Fail closed: an unconfigured AUTH_SECRET must never be treated as "no
  // session required" — every route behaves as if no valid session exists.
  const hasValidSignedToken = Boolean(token && authSecret && (await verifyToken(token, authSecret)));

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
