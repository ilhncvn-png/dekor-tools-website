'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { SemanticTone } from '@/lib/design-tokens';

interface ToastItem {
  id: number;
  tone: Exclude<SemanticTone, 'ai' | 'orange'>;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon: Record<ToastItem['tone'], typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  danger: XCircle,
};

// Tailwind's JIT scanner needs statically-written class names — a
// template-literal like `text-${tone}` would be silently purged from the
// production build, so every tone/class pairing is spelled out here.
const toneTextClass: Record<ToastItem['tone'], string> = {
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  danger: 'text-danger',
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[300] flex w-80 flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = toneIcon[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                role="status"
                className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-white p-3.5 shadow-elevation-overlay dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-overlay"
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${toneTextClass[t.tone]}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-body-sm font-medium text-near-black dark:text-white">{t.title}</div>
                  {t.description && (
                    <div className="mt-0.5 text-[12px] text-steel dark:text-white/50">{t.description}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Kapat"
                  className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
