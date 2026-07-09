'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';
import { Sparkline } from './Sparkline';
import { Tooltip } from './Tooltip';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';

interface PeriodDeltas {
  todayChange: string;
  weekChange: string;
  monthChange: string;
}

interface StatCardProps {
  label: string;
  value: string;
  /** When set (with `formatValue`), the value animates in as a count-up instead of appearing statically. */
  numericValue?: number;
  formatValue?: (n: number) => string;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean; period?: string };
  tone?: 'neutral' | 'red' | 'ai' | 'info' | 'success' | 'warning' | 'orange';
  /** Use 'compact' in dense 4-up dashboard grids so 8 cards don't feel oversized. */
  size?: 'default' | 'compact';
  /** 14-point trend series rendered as an inline animated sparkline. */
  sparklineData?: number[];
  /** Today/week/month deltas — shown as a compact row beneath the sparkline. */
  periods?: PeriodDeltas;
  /** Shown on hover — the exact figures behind the sparkline. */
  tooltip?: string;
  onClick?: () => void;
}

const toneClasses = {
  neutral: 'bg-mist text-steel dark:bg-white/10 dark:text-white/60',
  red: 'bg-red/10 text-red dark:bg-red/15 dark:text-red-eyebrow',
  ai: 'bg-ai-soft text-ai',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  orange: 'bg-orange-soft text-orange',
} as const;

const sparklineToneClasses = {
  neutral: 'text-steel dark:text-white/50',
  red: 'text-red dark:text-red-eyebrow',
  ai: 'text-ai',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  orange: 'text-orange',
} as const;

export function StatCard({
  label,
  value,
  numericValue,
  formatValue,
  icon: Icon,
  trend,
  tone = 'neutral',
  size = 'default',
  sparklineData,
  periods,
  tooltip,
  onClick,
}: StatCardProps) {
  const isGood = trend ? (trend.positive ?? trend.direction === 'up') : true;
  const compact = size === 'compact';

  const card = (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn(compact ? 'p-4' : 'p-5', onClick && 'active:scale-[0.98]')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">{label}</p>
          <p className={cn('mt-1.5 font-display tabular-nums text-near-black dark:text-white', compact ? 'text-heading-lg' : 'text-heading-xl')}>
            {numericValue !== undefined ? <AnimatedNumber value={numericValue} format={formatValue} /> : value}
          </p>
        </div>
        <div className={cn('flex shrink-0 items-center justify-center rounded-soft', compact ? 'h-8 w-8' : 'h-9 w-9', toneClasses[tone])}>
          <Icon size={compact ? 15 : 17} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        {trend ? (
          <div className="flex items-center gap-1 text-[12px]">
            <span className={cn('flex items-center gap-0.5 font-medium tabular-nums', isGood ? 'text-success' : 'text-danger')}>
              {trend.direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {trend.value}
            </span>
            <span className="text-steel dark:text-white/40">{trend.period ?? 'geçen aya göre'}</span>
          </div>
        ) : (
          <span />
        )}
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline data={sparklineData} width={64} height={24} className={sparklineToneClasses[tone]} />
        )}
      </div>

      {periods && (
        <div className="mt-2.5 grid grid-cols-3 gap-1 border-t border-border pt-2.5 dark:border-white/[.06]">
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.04em] text-steel/70 dark:text-white/30">Bugün</p>
            <p className="tabular-nums text-[12px] font-medium text-near-black dark:text-white/85">{periods.todayChange}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.04em] text-steel/70 dark:text-white/30">Hafta</p>
            <p className="tabular-nums text-[12px] font-medium text-near-black dark:text-white/85">{periods.weekChange}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.04em] text-steel/70 dark:text-white/30">Ay</p>
            <p className="tabular-nums text-[12px] font-medium text-near-black dark:text-white/85">{periods.monthChange}</p>
          </div>
        </div>
      )}
    </Card>
  );

  if (!tooltip) return card;
  return (
    <Tooltip label={tooltip} side="top" className="block w-full">
      {card}
    </Tooltip>
  );
}
