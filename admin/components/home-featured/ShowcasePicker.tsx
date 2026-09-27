'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import type { HomeFeaturedItem } from '@/lib/actions/home-featured-actions';
import { ProductThumb, StatusBadge, WarningChips } from './ShowcaseParts';

const MAX_VISIBLE = 60;

function normalize(value: string): string {
  return value.toLocaleLowerCase('tr-TR');
}

interface ShowcasePickerProps {
  candidates: HomeFeaturedItem[];
  busyId: string | null;
  onAdd: (item: HomeFeaturedItem) => void;
  onClose: () => void;
}

/** Searchable list of non-featured products; "Ekle" appends one to the end of the showcase. */
export function ShowcasePicker({ candidates, busyId, onAdd, onClose }: ShowcasePickerProps) {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return candidates;
    return candidates.filter((c) => normalize(`${c.name} ${c.sku} ${c.categoryName ?? ''}`).includes(q));
  }, [candidates, query]);
  const visible = matches.slice(0, MAX_VISIBLE);

  return (
    <section
      aria-labelledby="showcase-picker-heading"
      className="mb-6 rounded-lg border border-border bg-white shadow-elevation-raised dark:border-white/10 dark:bg-surface-dark-raised dark:shadow-elevation-dark-raised"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 dark:border-white/10">
        <div>
          <h2 id="showcase-picker-heading" className="font-display text-[15px] font-semibold text-near-black dark:text-white">
            Vitrine ürün ekle
          </h2>
          <p className="text-[12px] text-steel dark:text-white/50">Seçilen ürün listenin sonuna eklenir ve “Öne çıkan” olarak işaretlenir.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Ürün seçiciyi kapat"
          className="flex h-8 w-8 items-center justify-center rounded-soft text-steel hover:bg-mist hover:text-near-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <X size={16} />
        </button>
      </header>
      <div className="px-4 pt-3">
        <SearchInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün adı, kodu veya kategori ara…"
          aria-label="Ürün ara"
        />
        <p className="mt-2 text-[11.5px] text-steel dark:text-white/40">
          {matches.length} ürün{matches.length > MAX_VISIBLE ? ` · ilk ${MAX_VISIBLE} gösteriliyor, aramayı daraltın` : ''}
        </p>
      </div>
      <ul className="mt-2 max-h-[420px] divide-y divide-border overflow-y-auto border-t border-border dark:divide-white/5 dark:border-white/10">
        {visible.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-steel dark:text-white/40">Eşleşen ürün yok.</li>
        )}
        {visible.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-mist/60 dark:hover:bg-white/[.03]">
            <ProductThumb item={c} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-[13.5px] font-medium text-near-black dark:text-white">{c.name}</span>
                <span className="font-mono text-[11px] text-steel dark:text-white/40">{c.sku}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-steel dark:text-white/50">
                <span>{c.categoryName ?? 'Kategorisiz'}</span>
                <StatusBadge status={c.status} />
                <WarningChips warnings={c.warnings} />
              </div>
            </div>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} loading={busyId === c.id} disabled={busyId !== null} onClick={() => onAdd(c)}>
              Ekle
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
