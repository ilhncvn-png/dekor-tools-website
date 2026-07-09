'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { languageOptions } from '@/lib/languages';
import { useClickOutside } from '@/lib/useClickOutside';
import { cn } from '@/lib/utils';

/**
 * Prepared, not functional — selects PUBLIC CONTENT language once the CMS
 * exists (docs/architecture/10_MULTI_LANGUAGE_PLAN.md). English is shown
 * but disabled (`isActive: false`) since Turkish is the only active locale
 * today. The admin UI itself never changes language from this control.
 */
export function LanguageSwitch() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Dil seçimi"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
      >
        <Globe size={17} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            role="menu"
            className="absolute right-0 top-11 z-40 w-48 rounded-soft border border-border bg-white p-1.5 shadow-elevation-md dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-lg"
          >
            <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-steel dark:text-white/40">
              İçerik Dili
            </div>
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                type="button"
                disabled={!lang.isActive}
                className={cn(
                  'flex w-full items-center justify-between rounded-soft px-2.5 py-2 text-left text-sm transition-colors',
                  lang.isActive
                    ? 'text-near-black hover:bg-mist dark:text-white dark:hover:bg-white/5'
                    : 'cursor-not-allowed text-steel/50 dark:text-white/25'
                )}
              >
                <span>
                  {lang.label}
                  {!lang.isActive && <span className="ml-1.5 text-[10px]">(yakında)</span>}
                </span>
                {lang.isDefault && <Check size={14} className="text-red dark:text-red-eyebrow" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
