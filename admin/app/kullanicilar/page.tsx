'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserPlus, Ban } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { UserDrawer } from '@/components/users/UserDrawer';
import { useToast } from '@/components/ui/Toast';
import { type AdminUser } from '@/lib/mock-data';
import { getAdminUsers, setUserStatus, inviteUser as inviteUserAction } from '@/lib/actions/user-actions';
import { userStatusTone } from '@/lib/status-tones';

export default function KullanicilarPage() {
  const { push } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setAdminUsers(await getAdminUsers());
    } catch {
      push({ tone: 'danger', title: 'Kullanıcılar yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(
    () => adminUsers.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())),
    [adminUsers, query]
  );

  async function inviteUser() {
    const email = window.prompt('Davet edilecek e-posta adresi:');
    if (!email || !email.trim()) return;
    const result = await inviteUserAction({ name: email.split('@')[0], email: email.trim(), roleKey: 'VIEWER' });
    if (!result.success) { push({ tone: 'danger', title: 'Davet başarısız', description: result.error }); return; }
    push({ tone: 'success', title: 'Davet gönderildi', description: `${email.trim()} kullanıcısı oluşturuldu.` });
    await loadUsers();
  }

  async function updateUser(updated: AdminUser) {
    // Persist the editable status field from the drawer, then reload from DB.
    const result = await setUserStatus(updated.id, updated.status);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    await loadUsers();
    setActiveUser(null);
  }

  async function toggleDisabled(u: AdminUser) {
    const nextStatus: AdminUser['status'] = u.status === 'pasif' ? 'aktif' : 'pasif';
    const result = await setUserStatus(u.id, nextStatus);
    if (!result.success) { push({ tone: 'danger', title: 'İşlem başarısız', description: result.error }); return; }
    push({ tone: nextStatus === 'pasif' ? 'danger' : 'success', title: nextStatus === 'pasif' ? 'Kullanıcı devre dışı bırakıldı' : 'Kullanıcı yeniden etkinleştirildi' });
    await loadUsers();
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Kullanıcılar"
        description="Sistem kullanıcılarının davet ve yönetimi."
        actions={<Button icon={<UserPlus size={15} />} onClick={inviteUser}>Kullanıcı Davet Et</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} kullanıcı</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="İsim veya e-posta ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Toolbar>

      <Table>
        <Thead>
          <Tr>
            <Th>Kullanıcı</Th>
            <Th>Rol</Th>
            <Th>Durum</Th>
            <Th>Son Giriş</Th>
            <Th>Katılım Tarihi</Th>
            <Th className="w-10" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <TableEmptyRow colSpan={6}>Arama kriterlerine uyan kullanıcı bulunamadı.</TableEmptyRow>}
          {filtered.map((u) => {
            const info = userStatusTone[u.status];
            return (
              <Tr key={u.id} interactive onClick={() => setActiveUser(u)}>
                <Td className="flex items-center gap-3">
                  <Avatar name={u.name} size="md" tone={u.status === 'aktif' ? 'red' : 'neutral'} />
                  <div>
                    <p className="font-medium text-near-black dark:text-white">{u.name}</p>
                    <p className="text-[12px] text-steel dark:text-white/40">{u.email}</p>
                  </div>
                </Td>
                <Td>{u.role}</Td>
                <Td><Badge tone={info.tone} dot>{info.label}</Badge></Td>
                <Td className="text-steel dark:text-white/50">{u.lastLogin}</Td>
                <Td className="text-steel dark:text-white/50">{u.joinedAt}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => toggleDisabled(u)} className="text-steel hover:text-danger dark:text-white/40" aria-label={u.status === 'pasif' ? 'Etkinleştir' : 'Devre dışı bırak'}>
                    <Ban size={16} />
                  </button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <UserDrawer user={activeUser} onClose={() => setActiveUser(null)} onUpdate={updateUser} />
    </ContentContainer>
  );
}
