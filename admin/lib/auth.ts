/**
 * Temporary static-staging session constants — NOT real authentication.
 * Shared between middleware.ts (Edge Runtime, no DOM) and client
 * components, so this file must stay free of any browser-only API
 * (no `document`, no `localStorage`) — only plain constants/pure helpers.
 *
 * The session is a single cookie (not localStorage) specifically so
 * middleware can validate it server-side, before any page renders —
 * that's what makes protected routes not flash their content for an
 * unauthenticated visitor. It is still fully client-settable and offers
 * no real security; replace with real server-verified auth in Sprint 2.
 */

export const SESSION_COOKIE_NAME = 'decor_admin_session';
export const SESSION_COOKIE_VALUE = 'staging-authenticated-v1';

/** Every session/auth key ever used by a previous implementation of this
 * gate. Never trusted as a valid session, and actively removed on both
 * the login page (one-time cleanup) and on logout. */
export const LEGACY_SESSION_KEYS = ['dccStagingSession'];

export function isValidSessionValue(value: string | undefined | null): boolean {
  return value === SESSION_COOKIE_VALUE;
}
