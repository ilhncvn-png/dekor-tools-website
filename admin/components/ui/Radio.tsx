'use client';

import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface RadioProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export function Radio({ checked, onChange, label, disabled }: RadioProps) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={cn(
          'flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-colors duration-fast',
          focusRing,
          checked ? 'border-red' : 'border-border dark:border-white/20'
        )}
        style={{ height: 18, width: 18 }}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-red" />}
      </button>
      {label && <span className="text-body-sm text-near-black dark:text-white">{label}</span>}
    </label>
  );
}
