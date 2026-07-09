import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, error, className, ...rest },
  ref
) {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel dark:text-white/40">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'h-9 w-full rounded-soft border bg-white px-3 text-body-sm text-near-black placeholder:text-steel/60 transition-colors duration-fast dark:bg-surface-dark-raised dark:text-white dark:placeholder:text-white/30',
            Boolean(icon) && 'pl-9',
            error ? 'border-danger' : 'border-border hover:border-near-black/20 dark:border-white/10 dark:hover:border-white/25',
            focusRing,
            className
          )}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-[12px] text-danger">{error}</p>}
    </div>
  );
});
