'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@/lib/useClickOutside';
import { cn } from '@/lib/utils';

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  width?: number;
}

/**
 * Shared dropdown/popover shell — Sprint 7 consolidates the three
 * hand-rolled dropdown implementations from Sprint 5
 * (NotificationCenter/LanguageSwitch/UserMenu each had their own
 * open-state + click-outside + motion variants) into one primitive,
 * closing the exact kind of duplication
 * docs/engineering/02_ENGINEERING_STANDARDS.md warns against.
 */
export function Popover({ trigger, children, align = 'end', width = 288 }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            role="menu"
            style={{ width }}
            className={cn(
              'absolute top-11 z-40 rounded-lg border border-border bg-white shadow-elevation-floating dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-floating',
              align === 'end' ? 'right-0' : 'left-0'
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
