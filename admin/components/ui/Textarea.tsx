import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-soft border border-border bg-white px-3 py-2 text-body-sm text-near-black placeholder:text-steel/60 transition-colors duration-fast hover:border-near-black/20 dark:border-white/10 dark:bg-surface-dark-raised dark:text-white dark:placeholder:text-white/30 dark:hover:border-white/25',
          focusRing,
          className
        )}
        {...rest}
      />
    );
  }
);
