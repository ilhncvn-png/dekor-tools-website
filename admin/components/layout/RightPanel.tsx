'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface RightPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Prepared but empty, per this sprint's scope — a fixed docking point for
 * future contextual tools (e.g. an AI assistant panel per
 * docs/architecture/15_FUTURE_AI_MODULES.md, record activity/audit detail,
 * or a contextual help panel). No content module is implemented here yet.
 */
export function RightPanel({ open, onClose }: RightPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          className="sticky top-16 z-20 hidden h-[calc(100vh-4rem)] w-80 shrink-0 flex-col border-l border-border bg-white dark:border-white/10 dark:bg-surface-dark-subtle laptop:flex"
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4 dark:border-white/10">
            <span className="text-sm font-medium text-near-black dark:text-white">Yardımcı Panel</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Paneli kapat"
              className="flex h-7 w-7 items-center justify-center rounded-soft text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/5 dark:text-white/40">
              <Sparkles size={18} />
            </div>
            <p className="text-sm text-steel dark:text-white/50">
              Bu panel ileride bağlama duyarlı araçlar (ör. AI asistanı, kayıt geçmişi) için kullanılacak.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
