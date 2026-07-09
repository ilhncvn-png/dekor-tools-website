'use client';

import { Menu, Plus, PanelRight } from 'lucide-react';
import { GlobalSearchTrigger } from '@/components/ui/GlobalSearch';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { UserMenu } from '@/components/ui/UserMenu';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onToggleRightPanel: () => void;
}

export function TopBar({ onOpenMobileSidebar, onOpenCommandPalette, onToggleRightPanel }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/80 px-4 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/80">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Menüyü aç"
        className="flex h-9 w-9 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist dark:text-white/60 dark:hover:bg-white/5 laptop:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <GlobalSearchTrigger onOpen={onOpenCommandPalette} />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title="Hızlı işlem"
          onClick={onOpenCommandPalette}
          className="hidden h-9 items-center gap-1.5 rounded-soft border border-border px-3 text-xs font-medium text-steel transition-colors hover:border-red/30 hover:text-red dark:border-white/10 dark:text-white/60 dark:hover:border-red-eyebrow/40 dark:hover:text-red-eyebrow tablet:flex"
        >
          <Plus size={14} />
          Hızlı İşlem
        </button>

        <NotificationCenter />
        <LanguageSwitch />
        <ThemeToggle />

        <button
          type="button"
          onClick={onToggleRightPanel}
          aria-label="Yardımcı paneli aç/kapat"
          className="flex h-9 w-9 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
        >
          <PanelRight size={18} />
        </button>

        <div className="ml-1 h-6 w-px bg-border dark:bg-white/10" />

        <UserMenu />
      </div>
    </header>
  );
}
