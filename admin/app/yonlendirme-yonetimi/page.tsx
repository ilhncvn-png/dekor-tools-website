'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Route, AlertTriangle, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { slugConflicts, type RedirectRule } from '@/lib/mock-data';
import { getAdminRedirects, addRedirect as addRedirectAction, deleteRedirect } from '@/lib/actions/redirect-actions';
import { useToast } from '@/components/ui/Toast';

/** URL integrity — 301/302 redirects and slug conflict detection, so no link ever 404s after a page/product/category rename. */
export default function YonlendirmeYonetimiPage() {
  const { push } = useToast();
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState<'301' | '302'>('301');

  const loadRedirects = useCallback(async () => {
    try {
      setRedirects(await getAdminRedirects());
    } catch {
      push({ tone: 'danger', title: 'Yönlendirmeler yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadRedirects();
  }, [loadRedirects]);

  async function addRedirect() {
    if (!from || !to) return;
    const result = await addRedirectAction({ from, to, type });
    if (!result.success) { push({ tone: 'danger', title: 'Eklenemedi', description: result.error }); return; }
    setFrom('');
    setTo('');
    await loadRedirects();
  }

  async function remove(id: string) {
    const result = await deleteRedirect(id);
    if (!result.success) { push({ tone: 'danger', title: 'Silinemedi', description: result.error }); return; }
    await loadRedirects();
  }

  return (
    <ContentContainer>
      <PageHeader title="Yönlendirme Yönetimi" description="URL yönlendirmeleri (301/302) ve slug çakışmaları — bağlantı bütünlüğünü korur." />

      {slugConflicts.length > 0 && (
        <Card className="mb-4 border-danger/30 p-4">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle size={16} />
            <p className="text-body-sm font-medium">{slugConflicts.length} slug çakışması tespit edildi</p>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {slugConflicts.map((c) => (
              <li key={c.id} className="text-[12.5px] text-steel dark:text-white/50">
                <span className="font-mono text-near-black dark:text-white">{c.slug}</span> — {c.usedBy.join(', ')}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-display text-heading-sm text-near-black dark:text-white">Yeni Yönlendirme Ekle</h2>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-4">
          <Input placeholder="/eski-adres" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input placeholder="/yeni-adres" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value as '301' | '302')}>
            <option value="301">301 — Kalıcı</option>
            <option value="302">302 — Geçici</option>
          </Select>
          <Button icon={<Plus size={15} />} onClick={addRedirect}>Ekle</Button>
        </div>
      </Card>

      {redirects.length === 0 ? (
        <EmptyState icon={Route} title="Henüz yönlendirme yok" description="Sayfa veya ürün adresi değiştiğinde burada bir yönlendirme oluşturun." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Eski Adres</Th>
              <Th>Yeni Adres</Th>
              <Th>Tür</Th>
              <Th>Tıklama</Th>
              <Th>Oluşturuldu</Th>
              <Th className="w-10" />
            </Tr>
          </Thead>
          <Tbody>
            {redirects.length === 0 && <TableEmptyRow colSpan={6}>Kayıt yok.</TableEmptyRow>}
            {redirects.map((r) => (
              <Tr key={r.id}>
                <Td className="font-mono text-[12px] text-steel dark:text-white/50">{r.from}</Td>
                <Td className="font-mono text-[12px] font-medium">{r.to}</Td>
                <Td><Badge tone={r.type === '301' ? 'success' : 'warning'}>{r.type}</Badge></Td>
                <Td className="tabular-nums text-steel dark:text-white/50">{r.hits.toLocaleString('tr-TR')}</Td>
                <Td className="text-steel dark:text-white/50">{r.createdAt}</Td>
                <Td>
                  <button type="button" onClick={() => remove(r.id)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Sil">
                    <Trash2 size={14} />
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </ContentContainer>
  );
}
