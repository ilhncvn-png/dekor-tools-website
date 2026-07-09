import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'block' | 'circle';
}

/** Loading placeholder — shimmer surface defined in app/globals.css. */
export function Skeleton({ className, variant = 'block' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton-surface animate-shimmer',
        variant === 'text' && 'h-3.5 rounded-sharp',
        variant === 'block' && 'rounded-soft',
        variant === 'circle' && 'rounded-full',
        className
      )}
    />
  );
}
