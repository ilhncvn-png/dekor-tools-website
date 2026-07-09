import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  tone?: 'red' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

const toneClasses = {
  red: 'bg-red',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
} as const;

export function ProgressBar({ value, tone = 'red', className }: ProgressBarProps) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-mist dark:bg-white/10', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-slow ease-premium', toneClasses[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
