'use client';

import { useState } from 'react';
import { Plus, Check, X, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { roles as initialRoles, permissionMatrixByRole, type PermissionRow, type Role } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

type PermKey = 'view' | 'edit' | 'publish' | 'delete';

function PermCell({ allowed, onToggle }: { allowed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-soft transition-colors',
        allowed ? 'bg-success-soft text-success hover:bg-success/20' : 'text-steel/40 hover:bg-mist dark:text-white/20 dark:hover:bg-white/5'
      )}
      aria-label={allowed ? 'Yetkiyi kaldır' : 'Yetki ver'}
    >
      {allowed ? <Check size={15} /> : <X size={15} />}
    </button>
  );
}

export default function RollerVeYetkilerPage() {
  const { push } = useToast();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [activeRole, setActiveRole] = useState('İçerik Editörü');
  const [matrices, setMatrices] = useState(permissionMatrixByRole);

  const rows = matrices[activeRole] ?? [];

  function toggle(module: string, key: PermKey) {
    setMatrices((prev) => ({
      ...prev,
      [activeRole]: prev[activeRole].map((row: PermissionRow) => (row.module === module ? { ...row, [key]: !row[key] } : row)),
    }));
  }

  function addRole() {
    const name = window.prompt('Yeni rol adı:');
    if (!name || !name.trim()) return;
    const newRole: Role = { id: `r-${Date.now()}`, name: name.trim(), userCount: 0, description: '' };
    setRoles((prev) => [...prev, newRole]);
    setMatrices((prev) => ({
      ...prev,
      [newRole.name]: (prev['Görüntüleyici'] ?? []).map((row) => ({ ...row, edit: false, publish: false, delete: false })),
    }));
    setActiveRole(newRole.name);
    push({ tone: 'success', title: `${newRole.name} rolü oluşturuldu` });
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Roller ve Yetkiler"
        description="Rol tanımları ve modül bazlı yetki matrisi."
        actions={<Button icon={<Plus size={15} />} onClick={addRole}>Yeni Rol</Button>}
      />

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            interactive
            selected={role.name === activeRole}
            className="p-5"
            onClick={() => setActiveRole(role.name)}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-display text-heading-sm text-near-black dark:text-white">
                {role.name === 'Yönetici' && <ShieldCheck size={15} className="text-red dark:text-red-eyebrow" />}
                {role.name}
              </h3>
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-steel dark:bg-white/[.06] dark:text-white/50">
                {role.userCount} kullanıcı
              </span>
            </div>
            <p className="mt-2 text-body-sm text-steel dark:text-white/50">{role.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Tabs items={roles.map((r) => ({ value: r.name, label: r.name }))} value={activeRole} onChange={setActiveRole} />
      </div>

      <div className="mt-5">
        <p className="mb-3 text-body-sm text-steel dark:text-white/50">
          {activeRole === 'Yönetici'
            ? 'Yönetici rolü tüm modüllere tam erişime sahiptir ve düzenlenemez.'
            : `"${activeRole}" rolünün 14 modül genelindeki yetkileri. Hücrelere tıklayarak değiştirin.`}
        </p>
        <Table>
          <Thead>
            <Tr>
              <Th>Modül</Th>
              <Th>Görüntüle</Th>
              <Th>Düzenle</Th>
              <Th>Yayınla</Th>
              <Th>Sil</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.module}>
                <Td className="font-medium">{row.module}</Td>
                <Td><PermCell allowed={row.view} onToggle={() => toggle(row.module, 'view')} /></Td>
                <Td><PermCell allowed={row.edit} onToggle={() => toggle(row.module, 'edit')} /></Td>
                <Td><PermCell allowed={row.publish} onToggle={() => toggle(row.module, 'publish')} /></Td>
                <Td><PermCell allowed={row.delete} onToggle={() => toggle(row.module, 'delete')} /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </ContentContainer>
  );
}
