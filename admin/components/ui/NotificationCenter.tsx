'use client';

import { Bell, Handshake, Inbox, FileText } from 'lucide-react';
import { Popover } from './Popover';

const notifications = [
  { id: 'n1', icon: Handshake, title: 'Yeni bayilik başvurusu', detail: 'BuildMax Hardware LLC (BAE)', time: '12 dk önce', unread: true },
  { id: 'n2', icon: Inbox, title: 'Yeni şikayet talebi', detail: 'Ayşe Demir — sıva mastarı üretim hatası', time: '38 dk önce', unread: true },
  { id: 'n3', icon: FileText, title: 'Sayfa incelemeye gönderildi', detail: '"İhracat" sayfası — Mert Doğan', time: '2 saat önce', unread: false },
];

export function NotificationCenter() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover
      width={340}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Bildirimler"
          aria-haspopup="menu"
          aria-expanded={open}
          className="relative flex h-9 w-9 items-center justify-center rounded-soft text-steel transition-colors hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red ring-2 ring-white dark:ring-surface-dark-subtle" />
          )}
        </button>
      )}
    >
      <div className="border-b border-border px-4 py-3 dark:border-white/10">
        <span className="text-sm font-medium text-near-black dark:text-white">Bildirimler</span>
      </div>
      <ul className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <li key={n.id} className="flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-mist/60 dark:border-white/[.06] dark:hover:bg-white/[.03]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.06] dark:text-white/50">
              <n.icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-medium text-near-black dark:text-white">{n.title}</p>
              <p className="truncate text-[12px] text-steel dark:text-white/50">{n.detail}</p>
              <p className="mt-0.5 text-[11px] text-steel/70 dark:text-white/30">{n.time}</p>
            </div>
            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />}
          </li>
        ))}
      </ul>
    </Popover>
  );
}
