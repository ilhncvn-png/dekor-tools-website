import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Root entry point (/) — Decor Control Center login gate.
 *
 * Deliberately a Server Component (no 'use client' here) so that
 * `dynamic = 'force-dynamic'` is actually honored — Next.js only reads
 * route segment config from Server Component page/layout files. Putting
 * it directly on a 'use client' page was tried first and confirmed live
 * (via repeated curl tests against the real deployment, including with
 * cache-busting query params) to be silently ignored: the route kept
 * showing x-vercel-cache: PRERENDER and serving a stale response to
 * authenticated visitors regardless of the config export. Splitting the
 * interactive form into components/auth/LoginForm.tsx (unchanged logic,
 * unchanged design) and keeping this file as a thin Server Component
 * wrapper is what actually fixes it.
 *
 * This route's correct output always depends on the request's own
 * session cookie (login form vs. what middleware.ts redirects it to) —
 * static optimization is fundamentally incompatible with that.
 */
export const dynamic = 'force-dynamic';

export default function RootPage() {
  return <LoginForm />;
}
