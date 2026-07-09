'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'right' | 'top' | 'bottom';
  /** Defaults to 'inline-flex' (fine for icon-only triggers); pass 'block w-full' when wrapping a block-level grid item like a card. */
  className?: string;
}

/**
 * Minimal tooltip primitive — used by the collapsed Sidebar (Sprint 7 Step
 * 2's "tooltips appear beautifully" requirement) and available for any
 * icon-only control elsewhere.
 */
export function Tooltip({ label, children, side = 'right', className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const positionClasses = {
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  }[side];

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
            role="tooltip"
            className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-soft bg-near-black px-2.5 py-1.5 text-[12px] font-medium text-white shadow-elevation-floating dark:bg-white dark:text-near-black ${positionClasses}`}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
