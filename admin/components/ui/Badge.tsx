import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SemanticTone } from '@/lib/design-tokens';

interface BadgeProps {
  tone?: SemanticTone | 'neutral';
  children: ReactNode;
  dot?: boolean;
}

const toneClasses: Record<string, string> = {
  neutral: 'bg-mist text-steel dark:bg-white/[.06] dark:text-white/60',
  success: 'bg-success-soft text-success border border-success-border',
  warning: 'bg-warning-soft text-warning border border-warning-border',
  info: 'bg-info-soft text-info border border-info-border',
  danger: 'bg-danger-soft text-danger border border-danger-border',
  ai: 'bg-ai-soft text-ai border border-ai-border',
  orange: 'bg-orange-soft text-orange border border-orange-border',
};

export function Badge({ tone = 'neutral', children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.6px]',
        toneClasses[tone]
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
