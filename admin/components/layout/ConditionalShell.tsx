'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppShell } from './AppShell';

interface ConditionalShellProps {
  children: ReactNode;
  user: { name: string; email: string } | null;
}

/**
 * The root route (/) is the standalone login screen — it must render on
 * its own, with no sidebar/topbar/nav behind it. Every other route gets
 * the normal AppShell. This is the only place that knows about that
 * distinction; AppShell itself is untouched and still owns all shell
 * chrome for the real admin pages.
 *
 * `user` comes from a `getCurrentUser()` call in the Server Component
 * root layout — the authoritative, DB-backed check. middleware.ts already
 * redirects unauthenticated requests away from every non-login route
 * before this ever renders; the client-side redirect below is defense in
 * depth for the rare case the two checks diverge (e.g. a session gets
 * revoked between the middleware check and this render).
 */
export function ConditionalShell({ children, user }: ConditionalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === '/';

  useEffect(() => {
    if (!isLoginRoute && !user) {
      router.replace('/');
    }
  }, [isLoginRoute, user, router]);

  if (isLoginRoute) return <>{children}</>;
  if (!user) return null;

  return <AppShell user={user}>{children}</AppShell>;
}
