'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { primaryNavigation } from '@/lib/navigation';

/**
 * Breadcrumb trail derived from the current route + the primary navigation:
 * renders "<Grup> / <Modül>" (e.g. "İçerik Yönetimi / Ürünler"), so the parent
 * segment always matches the sidebar group the active page lives in. No backend
 * routes or technical slugs are exposed — only human labels.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const current =
    primaryNavigation.find((item) => item.href === pathname) ??
    primaryNavigation.find((item) => pathname.startsWith(item.href));

  const isDashboard = !current || current.href === '/genel-bakis';

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-steel dark:text-white/40">
      <Link href="/genel-bakis" className="flex items-center gap-1 hover:text-near-black dark:hover:text-white">
        <Home size={12} />
        <span>Genel Bakış</span>
      </Link>
      {!isDashboard && current && (
        <>
          <ChevronRight size={12} />
          <span>{current.section}</span>
          <ChevronRight size={12} />
          <span className="font-medium text-near-black dark:text-white">{current.label}</span>
        </>
      )}
    </nav>
  );
}
