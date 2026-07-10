'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Settings, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { Popover } from './Popover';
import { Avatar } from './Avatar';
import { logout } from '@/lib/actions/auth-actions';

interface UserMenuProps {
  user: { name: string; email: string };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.replace('/');
      router.refresh();
    });
  }

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
          <Avatar name={user.name} size="sm" tone="red" />
          <ChevronDown size={14} className="text-steel dark:text-white/40" />
        </button>
      )}
    >
      <div className="px-2.5 py-2">
        <div className="text-sm font-medium text-near-black dark:text-white">{user.name}</div>
        <div className="text-xs text-steel dark:text-white/40">{user.email}</div>
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
        onClick={handleLogout}
        disabled={isPending}
        className="flex w-full items-center gap-2.5 rounded-soft px-2.5 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={15} />
        {isPending ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
      </button>
    </Popover>
  );
}
