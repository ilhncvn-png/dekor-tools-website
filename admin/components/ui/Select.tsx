import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-9 w-full appearance-none rounded-soft border border-border bg-white pl-3 pr-8 text-body-sm text-near-black transition-colors duration-fast hover:border-near-black/20 dark:border-white/10 dark:bg-surface-dark-raised dark:text-white dark:hover:border-white/25',
          focusRing,
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-steel dark:text-white/40" />
    </div>
  );
});
