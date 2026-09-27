'use client';

import { ArrowDown, ArrowUp, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { HomeFeaturedItem } from '@/lib/actions/home-featured-actions';
import { cn } from '@/lib/utils';
import { ProductThumb, StatusBadge, WarningChips } from './ShowcaseParts';

interface ShowcaseRowProps {
  item: HomeFeaturedItem;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

const moveBtn =
  'flex h-7 w-7 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist hover:text-near-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 disabled:pointer-events-none disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white';

export function ShowcaseRow({ item, position, isFirst, isLast, disabled, onMove, onRemove }: ShowcaseRowProps) {
  const flagged = item.warnings.length > 0;
  return (
    <li
      className={cn(
        'group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-mist/50 dark:hover:bg-white/[.02]',
        flagged && 'bg-warning-soft/30 dark:bg-warning-soft/5'
      )}
    >
      <span
        className={cn(
          'w-7 shrink-0 text-right font-mono text-[18px] font-semibold tabular-nums',
          flagged ? 'text-warning' : 'text-near-black/25 dark:text-white/25'
        )}
        aria-label={`Sıra ${position}`}
      >
        {String(position).padStart(2, '0')}
      </span>
      <ProductThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate text-[14px] font-semibold text-near-black dark:text-white">{item.name}</span>
          <span className="font-mono text-[11px] text-steel dark:text-white/40">{item.sku}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-steel dark:text-white/50">
          <span>{item.categoryName ?? 'Kategorisiz'}</span>
          <StatusBadge status={item.status} />
        </div>
        <WarningChips warnings={item.warnings} className="mt-1.5" />
      </div>
      <div className="flex shrink-0 flex-col gap-0.5">
        <button type="button" className={moveBtn} onClick={() => onMove(-1)} disabled={disabled || isFirst} aria-label={`${item.name} yukarı taşı`}>
          <ArrowUp size={15} />
        </button>
        <button type="button" className={moveBtn} onClick={() => onMove(1)} disabled={disabled || isLast} aria-label={`${item.name} aşağı taşı`}>
          <ArrowDown size={15} />
        </button>
      </div>
      <Button size="sm" variant="ghost" icon={<StarOff size={14} />} onClick={onRemove} disabled={disabled} aria-label={`${item.name} vitrinden çıkar`}>
        <span className="hidden tablet:inline">Vitrinden çıkar</span>
      </Button>
    </li>
  );
}
