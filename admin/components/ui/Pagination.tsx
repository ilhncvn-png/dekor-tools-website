'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label="Sayfalama" className="flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Önceki sayfa"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/5',
          focusRing
        )}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-steel/50 dark:text-white/25">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-soft text-body-sm transition-colors',
              focusRing,
              p === page
                ? 'bg-red text-white'
                : 'text-steel hover:bg-mist hover:text-near-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white'
            )}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Sonraki sayfa"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/5',
          focusRing
        )}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
