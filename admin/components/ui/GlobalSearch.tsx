'use client';

import { Search } from 'lucide-react';

/**
 * Topbar search affordance. Deliberately opens the SAME overlay as the
 * Command Palette (Ctrl/Cmd+K) rather than a second, separate search UI —
 * matching how Linear/Vercel/Notion treat "search" and "command" as one
 * surface. See components/ui/CommandPalette.tsx.
 */
export function GlobalSearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-9 w-full max-w-[220px] items-center gap-2.5 rounded-soft border border-border bg-mist/60 px-3 text-sm text-steel transition-colors hover:border-near-black/15 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:border-white/20"
    >
      <Search size={15} />
      <span className="truncate">Ara...</span>
      <kbd className="ml-auto flex items-center gap-0.5 rounded-sharp border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-steel dark:border-white/10 dark:bg-white/10 dark:text-white/40">
        ⌘K
      </kbd>
    </button>
  );
}
