'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Globe2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type ExportCountry } from '@/lib/mock-data';
import { getAdminExportCountries, saveExportCountry, deleteExportCountry } from '@/lib/actions/misc-content-actions';

/** Single source of truth for the interactive world map shown on both Ana Sayfa and İhracat Sayfası export sections. */
export default function IhracatHaritasiPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<ExportCountry[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ExportCountry | null>(null);

  const loadCountries = useCallback(async () => {
    try {
      setCountries(await getAdminExportCountries());
    } catch {
      push({ tone: 'danger', title: 'Ülkeler yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const filtered = countries.filter((c) => c.country.toLowerCase().includes(query.toLowerCase()));
  const activeCount = countries.filter((c) => c.active).length;

  async function toggleActive(id: string) {
    const target = countries.find((c) => c.id === id);
    if (!target) return;
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))); // optimistic
    const result = await saveExportCountry(id, { ...target, active: !target.active });
    if (!result.success) { push({ tone: 'danger', title: 'İşlem başarısız', description: result.error }); await loadCountries(); }
  }

  async function addCountry() {
    const name = window.prompt('Eklenecek ülke adı:');
    if (!name || !name.trim()) return;
    const result = await saveExportCountry(null, { id: `ec-${Date.now()}`, country: name.trim(), region: 'Diğer', dealerCount: 0, exportVolume: '$0', active: false });
    if (!result.success) { push({ tone: 'danger', title: 'Eklenemedi', description: result.error }); return; }
    push({ tone: 'success', title: `${name.trim()} eklendi` });
    await loadCountries();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const result = await deleteExportCountry(target.id);
    if (!result.success) { push({ tone: 'danger', title: 'Silinemedi', description: result.error }); return; }
    push({ tone: 'danger', title: `${target.country} kaldırıldı` });
    await loadCountries();
  }

  return (
    <ContentContainer>
      <PageHeader
        title="İhracat Haritası Yönetimi"
        description="Ana Sayfa ve İhracat sayfasındaki interaktif dünya haritasını besleyen ülke verisi."
        actions={<Button icon={<Plus size={15} />} onClick={addCountry}>Ülke Ekle</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{activeCount}/{countries.length} ülke haritada aktif</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Ülke ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Toolbar>

      <Table>
        <Thead>
          <Tr>
            <Th>Ülke</Th>
            <Th>Bölge</Th>
            <Th>Bayi Sayısı</Th>
            <Th>İhracat Hacmi</Th>
            <Th>Haritada Göster</Th>
            <Th className="w-10" />
          </Tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <TableEmptyRow colSpan={6}>Arama kriterlerine uyan ülke bulunamadı.</TableEmptyRow>}
          {filtered.map((c) => (
            <Tr key={c.id}>
              <Td className="flex items-center gap-2 font-medium">
                <Globe2 size={14} className="text-steel dark:text-white/40" />
                {c.country}
              </Td>
              <Td><Badge tone="neutral">{c.region}</Badge></Td>
              <Td className="tabular-nums">{c.dealerCount}</Td>
              <Td className="tabular-nums text-steel dark:text-white/50">{c.exportVolume}</Td>
              <Td>
                <Switch checked={c.active} onChange={() => toggleActive(c.id)} label={`${c.country} haritada göster`} />
              </Td>
              <Td>
                <button type="button" onClick={() => setDeleteTarget(c)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Ülkeyi kaldır">
                  <Trash2 size={16} />
                </button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Ülkeyi kaldır"
        description={deleteTarget ? <>&quot;{deleteTarget.country}&quot; ülkesini ihracat haritasından kaldırmak üzeresiniz.</> : null}
        consequences={['Ana Sayfa ve İhracat sayfasındaki dünya haritasından da kaldırılacak']}
        confirmLabel="Kaldır"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
