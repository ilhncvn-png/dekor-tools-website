'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { primaryNavigation } from '@/lib/navigation';

/**
 * Auto-derives its trail from the current route + the primary navigation
 * list — every module lives one level deep today, so this renders
 * "Genel Bakış / <Modül>". Deeper trails (e.g. a product detail page) can
 * push additional segments once real CRUD pages exist (Sprint 6+); the
 * component already accepts that via nested routes, nothing to change here.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const current = primaryNavigation.find((item) => pathname.startsWith(item.href));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-steel dark:text-white/40">
      <Link href="/genel-bakis" className="flex items-center gap-1 hover:text-near-black dark:hover:text-white">
        <Home size={12} />
        <span>Genel Bakış</span>
      </Link>
      {current && current.href !== '/genel-bakis' && (
        <>
          <ChevronRight size={12} />
          <span className="font-medium text-near-black dark:text-white">{current.label}</span>
        </>
      )}
    </nav>
  );
}
