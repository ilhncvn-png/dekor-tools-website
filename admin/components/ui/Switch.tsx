'use client';

import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-fast ease-premium disabled:opacity-40',
        focusRing,
        checked ? 'bg-red' : 'bg-concrete dark:bg-white/15'
      )}
    >
      {/*
        Plain CSS-transitioned thumb, not a Framer Motion `layout` element —
        a `layout`-tracked node left inside a drawer that later exits via
        AnimatePresence can stall that exit's unmount (same class of bug
        fixed in Tabs.tsx's sliding indicator), so this stays CSS-only.
      */}
      <span
        className="rounded-full bg-white shadow-elevation-flat transition-[margin] duration-200 ease-premium"
        style={{ marginLeft: checked ? '18px' : '4px', height: 18, width: 18 }}
      />
    </button>
  );
}
