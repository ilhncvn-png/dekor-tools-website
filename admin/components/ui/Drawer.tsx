'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** 'wide' is for editors with tabbed content (e.g. Product) that need more than the default max-w-md. */
  size?: 'default' | 'wide';
}

/** Reusable slide-over panel — product/dealer/user quick-view across every module, not one-off per page. */
export function Drawer({ open, onClose, title, description, children, footer, size = 'default' }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[150] bg-near-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className={cn(
              'fixed inset-y-0 right-0 z-[160] flex w-full flex-col border-l border-border bg-white shadow-elevation-overlay dark:border-white/10 dark:bg-surface-dark-raised',
              size === 'wide' ? 'max-w-2xl' : 'max-w-md'
            )}
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-4 dark:border-white/10">
              <div className="min-w-0">
                <h2 className="truncate font-display text-heading-md text-near-black dark:text-white">{title}</h2>
                {description && <p className="mt-0.5 text-body-sm text-steel dark:text-white/50">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist hover:text-near-black dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-border px-5 py-4 dark:border-white/10">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
