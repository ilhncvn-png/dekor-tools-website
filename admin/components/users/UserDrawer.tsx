'use client';

import { useEffect, useState } from 'react';
import { Mail, Calendar, LogIn, UserPlus, Ban, RotateCcw } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { AdminUser } from '@/lib/mock-data';
import { userStatusTone } from '@/lib/status-tones';
import { useToast } from '@/components/ui/Toast';

const ROLES = ['Yönetici', 'İçerik Editörü', 'Bayi Sorumlusu', 'SEO Uzmanı', 'Görüntüleyici'];

interface UserDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdate?: (updated: AdminUser) => void;
}

/** Quick-view drawer for a single admin user — login history, invite chain, role, and account actions. */
export function UserDrawer({ user, onClose, onUpdate }: UserDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(user);
  useEffect(() => {
    if (user) setDisplay(user);
  }, [user]);

  if (!display) return null;

  const statusInfo = userStatusTone[display.status];

  function changeRole(role: string) {
    if (!display) return;
    const updated = { ...display, role };
    setDisplay(updated);
    onUpdate?.(updated);
    push({ tone: 'success', title: 'Rol güncellendi', description: `${display.name} artık ${role}.` });
  }

  function toggleDisabled() {
    if (!display) return;
    const updated: AdminUser = { ...display, status: display.status === 'pasif' ? 'aktif' : 'pasif' };
    setDisplay(updated);
    onUpdate?.(updated);
    push({ tone: updated.status === 'pasif' ? 'danger' : 'success', title: updated.status === 'pasif' ? 'Kullanıcı devre dışı bırakıldı' : 'Kullanıcı yeniden etkinleştirildi' });
  }

  return (
    <Drawer
      open={Boolean(user)}
      onClose={onClose}
      title={display.name}
      description={display.role}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Select value={display.role} onChange={(e) => changeRole(e.target.value)} className="flex-1">
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          {display.status === 'pasif' ? (
            <Button variant="secondary" icon={<RotateCcw size={14} />} className="shrink-0" onClick={toggleDisabled}>Etkinleştir</Button>
          ) : (
            <Button variant="danger" icon={<Ban size={14} />} className="shrink-0" onClick={toggleDisabled}>Devre Dışı Bırak</Button>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar name={display.name} size="lg" tone={display.status === 'aktif' ? 'red' : 'neutral'} />
        <div>
          <p className="text-body-sm font-medium text-near-black dark:text-white">{display.name}</p>
          <p className="flex items-center gap-1 text-[12px] text-steel dark:text-white/40">
            <Mail size={11} /> {display.email}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        <Badge tone="neutral">{display.role}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <LogIn size={10} /> Son Giriş
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.lastLogin}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Calendar size={10} /> Katılım Tarihi
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.joinedAt}</p>
        </div>
      </div>

      <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <UserPlus size={10} /> Davet Eden
        </p>
        <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.invitedBy}</p>
      </div>
    </Drawer>
  );
}
