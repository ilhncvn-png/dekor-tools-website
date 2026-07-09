'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-colors duration-fast',
          focusRing,
          checked ? 'border-red bg-red text-white' : 'border-border bg-white dark:border-white/20 dark:bg-transparent'
        )}
        style={{ height: 18, width: 18 }}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </button>
      {label && <span className="text-body-sm text-near-black dark:text-white">{label}</span>}
    </label>
  );
}
