import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, isValidSessionValue } from '@/lib/auth';

/**
 * Guards every admin route server-side, before any page component runs —
 * this is what prevents protected pages from rendering (even briefly) for
 * an unauthenticated visitor, which a client-only check can never fully
 * achieve. Still just a cookie-presence check (no database, no signed
 * token, no server-verified identity) — temporary staging protection,
 * not real authentication. See lib/auth.ts.
 *
 * - "/" (login route): valid session -> redirect to /genel-bakis.
 *                       no/invalid session -> allow (show login only).
 * - every other route: valid session -> allow.
 *                       no/invalid session -> redirect to "/".
 *
 * Every response gets Cache-Control: no-store, and app/page.tsx exports
 * dynamic = 'force-dynamic' (from a genuine Server Component — Next.js
 * ignores that config on a 'use client' file, which is why the login form
 * lives in components/auth/LoginForm.tsx instead) — both were required
 * to stop Vercel's edge from caching the "no session" response for "/"
 * and serving it to every visitor regardless of their actual cookie.
 * Verified live with a temporary debug response header before removing
 * it here once confirmed fixed.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasValidSession = isValidSessionValue(sessionValue);

  if (pathname === '/') {
    if (hasValidSession) {
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

  if (!hasValidSession) {
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
  // "/" listed explicitly alongside the catch-all pattern for clarity —
  // both were confirmed live to correctly invoke this middleware.
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
