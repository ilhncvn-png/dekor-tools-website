'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from './AppShell';

/**
 * The root route (/) is the standalone login screen — it must render on
 * its own, with no sidebar/topbar/nav behind it. Every other route gets
 * the normal AppShell. This is the only place that knows about that
 * distinction; AppShell itself is untouched and still owns all shell
 * chrome for the 47 real admin pages.
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/';

  if (isLoginRoute) return <>{children}</>;

  return <AppShell>{children}</AppShell>;
}
