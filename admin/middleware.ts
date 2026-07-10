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
 * Every response gets Cache-Control: no-store — verified live that
 * without this, Vercel's edge cached the "no session" response for "/"
 * and kept serving it to every visitor regardless of their actual cookie
 * (a valid-session request would still see the login page from cache,
 * middleware never re-running to redirect it to /genel-bakis). The
 * correct output here always depends on the request's own cookie, so
 * none of these responses may ever be cached. This also covers the
 * earlier "Back button after logout" bfcache concern.
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
      response.headers.set('X-Debug-Middleware', 'root-has-session');
      return response;
    }
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Debug-Middleware', 'root-no-session');
    return response;
  }

  if (!hasValidSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Debug-Middleware', 'protected-no-session');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Debug-Middleware', 'protected-has-session');
  return response;
}

export const config = {
  // "/" is listed explicitly, not just relying on the catch-all pattern
  // below — live-tested and confirmed the bare basePath root was the one
  // request shape that skipped middleware entirely (X-Debug-Middleware
  // header absent), while every path with a segment after it (e.g.
  // /genel-bakis) matched correctly. Being explicit here removes any
  // ambiguity about how the negative-lookahead pattern combines with
  // basePath prefixing for the empty/root case specifically.
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
