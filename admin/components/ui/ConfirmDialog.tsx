'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  /** Explicit consequences list — "this will also affect X, Y, Z" (the dependency-map use case). */
  consequences?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Reusable destructive-action confirmation — the single "are you sure"
 * surface every delete/unpublish/bulk-action across the CMS should route
 * through, instead of each module inventing its own window.confirm().
 * Supports an optional consequences list so a delete can show exactly
 * what else it affects before it happens (dependency-map safety net).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  consequences,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[220] flex items-center justify-center bg-near-black/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-soft border border-border bg-white p-5 shadow-elevation-lg dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-lg"
          >
            <div className="flex items-start gap-3">
              <div className={tone === 'danger' ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-danger-soft text-danger' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-warning-soft text-warning'}>
                <AlertTriangle size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-heading-sm text-near-black dark:text-white">{title}</h2>
                <div className="mt-1 text-[13px] text-steel dark:text-white/60">{description}</div>
              </div>
            </div>

            {consequences && consequences.length > 0 && (
              <div className="mt-3 rounded-soft bg-warning-soft px-3 py-2.5">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-warning">Bu işlem ayrıca şunları etkiler</p>
                <ul className="flex flex-col gap-1">
                  {consequences.map((c) => (
                    <li key={c} className="text-[12.5px] text-warning">• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={onCancel} disabled={pending}>{cancelLabel}</Button>
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                disabled={pending}
                icon={pending ? <Loader2 size={14} className="animate-spin" /> : undefined}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
