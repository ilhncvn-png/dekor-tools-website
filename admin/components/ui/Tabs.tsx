'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children?: (active: string) => ReactNode;
}

export function Tabs({ items, value, defaultValue, onChange, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Plain CSS-transitioned indicator (left/width in px, not a Framer Motion
  // layoutId) — a shared layoutId here previously left an invisible,
  // click-blocking exit overlay behind whenever this Tabs instance sat
  // inside a Drawer's AnimatePresence and the active tab changed before
  // close, because the in-flight layout animation stalled the parent's
  // unmount. Measuring the active button's own rect avoids that class of
  // bug entirely while keeping the same sliding-underline look.
  useLayoutEffect(() => {
    const el = buttonRefs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, items]);

  const select = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div>
      <div className="relative flex items-center gap-1 border-b border-border dark:border-white/10">
        {items.map((item) => {
          const isActive = item.value === active;
          return (
            <button
              key={item.value}
              ref={(el) => {
                buttonRefs.current[item.value] = el;
              }}
              type="button"
              onClick={() => select(item.value)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2.5 text-body-sm transition-colors duration-fast',
                isActive ? 'text-near-black dark:text-white' : 'text-steel hover:text-near-black dark:text-white/50 dark:hover:text-white'
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-full bg-mist px-1.5 py-0.5 text-[11px] font-medium text-steel dark:bg-white/10 dark:text-white/50">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
        {indicator && (
          <span
            className="absolute -bottom-px h-0.5 rounded-full bg-red transition-all duration-200 ease-premium"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
      </div>
      {children && <div className="pt-5">{children(active)}</div>}
    </div>
  );
}
