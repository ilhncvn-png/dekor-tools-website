'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Image as ImageIcon, PlayCircle, Check } from 'lucide-react';
import { mediaItems, type MediaItem } from '@/lib/mock-data';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  filterType?: MediaItem['type'];
}

/**
 * Cross-module media selection — the real "attach an asset from Media
 * Library to this product/section" surface. Every place that needs an
 * image (Product gallery/OG image, section media, dealer logo, etc.)
 * opens this instead of just linking away to Medya Kütüphanesi, so the
 * upload -> select -> attach -> live loop actually closes in one flow.
 */
export function MediaPickerModal({ open, onClose, onSelect, filterType }: MediaPickerModalProps) {
  const [query, setQuery] = useState('');

  const filtered = mediaItems.filter((m) => {
    if (filterType && m.type !== filterType) return false;
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[210] flex items-center justify-center bg-near-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Medya Seç"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-soft border border-border bg-white shadow-elevation-lg dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 dark:border-white/10">
              <Search size={16} className="text-steel dark:text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Medya ara..."
                aria-label="Medya ara"
                className="flex-1 bg-transparent text-sm text-near-black outline-none placeholder:text-steel/60 dark:text-white dark:placeholder:text-white/30"
              />
              <button type="button" onClick={onClose} aria-label="Kapat" className="text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 tablet:grid-cols-3">
              {filtered.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-steel dark:text-white/40">Sonuç bulunamadı.</p>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group relative overflow-hidden rounded-soft border border-border text-left transition-colors hover:border-red/40 dark:border-white/10 dark:hover:border-red-eyebrow/40"
                >
                  <div className="flex aspect-[4/3] items-center justify-center" style={{ backgroundColor: item.swatch }}>
                    {item.type === 'video' ? <PlayCircle size={24} className="text-white/80" /> : <ImageIcon size={24} className="text-white/80" />}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[12px] font-medium text-near-black dark:text-white">{item.title}</p>
                    <p className="truncate font-mono text-[10px] text-steel dark:text-white/40">{item.name}</p>
                  </div>
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-near-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Check size={12} />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
