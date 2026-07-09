'use client';

import { Settings, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { Popover } from './Popover';
import { Avatar } from './Avatar';

const currentUser = { name: 'Mert Doğan', email: 'mert.dogan@dekortools.com', role: 'Yönetici' };

export function UserMenu() {
  return (
    <Popover
      width={224}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-soft py-1 pl-1 pr-2 transition-colors hover:bg-mist dark:hover:bg-white/5"
        >
          <Avatar name={currentUser.name} size="sm" tone="red" />
          <ChevronDown size={14} className="text-steel dark:text-white/40" />
        </button>
      )}
    >
      <div className="px-2.5 py-2">
        <div className="text-sm font-medium text-near-black dark:text-white">{currentUser.name}</div>
        <div className="text-xs text-steel dark:text-white/40">{currentUser.email}</div>
      </div>
      <div className="my-1 h-px bg-border dark:bg-white/10" />
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-soft px-2.5 py-2 text-left text-sm text-near-black transition-colors hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
      >
        <UserCircle size={15} />
        Profilim
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-soft px-2.5 py-2 text-left text-sm text-near-black transition-colors hover:bg-mist dark:text-white/85 dark:hover:bg-white/5"
      >
        <Settings size={15} />
        Hesap Ayarları
      </button>
      <div className="my-1 h-px bg-border dark:bg-white/10" />
      <button
        type="button"
        className="flex w-full items-center gap-2.5 rounded-soft px-2.5 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
      >
        <LogOut size={15} />
        Çıkış Yap
      </button>
    </Popover>
  );
}
