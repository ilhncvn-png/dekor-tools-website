'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, FileText, Check } from 'lucide-react';
import { fileDocs, type FileDoc } from '@/lib/mock-data';

interface FilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: FileDoc) => void;
}

/** Cross-module document selection — Dosya Merkezi's real files, attachable to any entity that needs a PDF/document reference. */
export function FilePickerModal({ open, onClose, onSelect }: FilePickerModalProps) {
  const [query, setQuery] = useState('');

  const filtered = fileDocs.filter((f) => !query || f.name.toLowerCase().includes(query.toLowerCase()));

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
            aria-label="Dosya Seç"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-soft border border-border bg-white shadow-elevation-lg dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 dark:border-white/10">
              <Search size={16} className="text-steel dark:text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Dosya ara..."
                aria-label="Dosya ara"
                className="flex-1 bg-transparent text-sm text-near-black outline-none placeholder:text-steel/60 dark:text-white dark:placeholder:text-white/30"
              />
              <button type="button" onClick={onClose} aria-label="Kapat" className="text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-steel dark:text-white/40">Sonuç bulunamadı.</p>
              )}
              {filtered.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onSelect(file);
                    onClose();
                  }}
                  className="group flex items-center gap-3 rounded-soft px-3 py-2.5 text-left transition-colors hover:bg-mist dark:hover:bg-white/5"
                >
                  <FileText size={16} className="shrink-0 text-steel dark:text-white/40" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-near-black dark:text-white">{file.name}</span>
                    <span className="block truncate text-[11px] text-steel dark:text-white/40">{file.category} · {file.format} · {file.version}</span>
                  </span>
                  <Check size={13} className="shrink-0 text-steel opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
