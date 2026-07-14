'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, X, Trash2, Handshake, Globe2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Tabs } from '@/components/ui/Tabs';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { DealerDrawer } from '@/components/dealers/DealerDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type Dealer } from '@/lib/mock-data';
import { getAdminDealers, saveDealer, setDealerStatus, softDeleteDealer } from '@/lib/actions/dealer-actions';
import { toDealerInput } from '@/lib/adapters/dealer-adapter';
import { dealerStatusTone } from '@/lib/status-tones';

export default function BayiYonetimiPage() {
  const { push } = useToast();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeDealer, setActiveDealer] = useState<Dealer | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Dealer | 'bulk' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dealer | null>(null);

  const loadDealers = useCallback(async () => {
    try {
      setDealers(await getAdminDealers());
    } catch {
      push({ tone: 'danger', title: 'Bayiler yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadDealers();
  }, [loadDealers]);

  const isDraftId = (id: string) => id.startsWith('new-');

  const counts = {
    all: dealers.length,
    inceleniyor: dealers.filter((d) => d.status === 'inceleniyor').length,
    onaylandi: dealers.filter((d) => d.status === 'onaylandi').length,
    reddedildi: dealers.filter((d) => d.status === 'reddedildi').length,
  };

  const filtered = useMemo(
    () =>
      dealers.filter((d) => {
        if (tab !== 'all' && d.status !== tab) return false;
        if (query && !d.company.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [dealers, query, tab]
  );

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function approveDealer(id: string) {
    if (isDraftId(id)) return;
    const result = await setDealerStatus(id, 'onaylandi');
    if (!result.success) { push({ tone: 'danger', title: 'İşlem başarısız', description: result.error }); return; }
    push({ tone: 'success', title: 'Bayi onaylandı', description: 'Web sitesi bayi listesine eklendi.' });
    setActiveDealer(null);
    await loadDealers();
  }

  async function updateDealer(updated: Dealer) {
    const isDraft = isDraftId(updated.id);
    const result = await saveDealer(isDraft ? null : updated.id, toDealerInput(updated));
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    // Reconcile the drawer's status selection with the workflow transition.
    const savedId = (result.data as { id?: string } | undefined)?.id ?? (isDraft ? null : updated.id);
    if (savedId) await setDealerStatus(savedId, updated.status);
    await loadDealers();
    setActiveDealer(null);
  }

  async function approveBulk() {
    const ids = [...selected].filter((id) => !isDraftId(id));
    await Promise.all(ids.map((id) => setDealerStatus(id, 'onaylandi')));
    push({ tone: 'success', title: `${ids.length} bayi onaylandı` });
    setSelected(new Set());
    await loadDealers();
  }

  async function confirmReject() {
    if (rejectTarget === 'bulk') {
      const ids = [...selected].filter((id) => !isDraftId(id));
      await Promise.all(ids.map((id) => setDealerStatus(id, 'reddedildi')));
      push({ tone: 'danger', title: `${ids.length} başvuru reddedildi` });
      setSelected(new Set());
    } else if (rejectTarget && !isDraftId(rejectTarget.id)) {
      await setDealerStatus(rejectTarget.id, 'reddedildi');
      push({ tone: 'danger', title: 'Başvuru reddedildi' });
      setActiveDealer(null);
    }
    setRejectTarget(null);
    await loadDealers();
  }

  async function confirmDeleteDealer() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (isDraftId(target.id)) { setDealers((prev) => prev.filter((d) => d.id !== target.id)); return; }
    const result = await softDeleteDealer(target.id);
    if (!result.success) { push({ tone: 'danger', title: 'Silinemedi', description: result.error }); return; }
    push({ tone: 'danger', title: `${target.company} silindi` });
    await loadDealers();
  }

  function addDealer() {
    const newDealer: Dealer = {
      id: `new-${Date.now()}`,
      company: '',
      country: '',
      region: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      status: 'onaylandi',
      submittedAt: new Date().toISOString().slice(0, 10),
      volume: '',
      assignedTo: '',
      listedOnWebsite: false,
      contractSigned: false,
      notes: '',
      logo: null,
      source: 'manuel',
    };
    setDealers((prev) => [newDealer, ...prev]);
    setActiveDealer(newDealer);
  }

  if (dealers.length === 0) {
    return (
      <ContentContainer>
        <PageHeader
          title="Bayiler"
          description="Bayi başvurularını buradan inceleyip onaylayabilir, bayi kayıtlarını ve profillerini yönetebilirsiniz."
          actions={<Button icon={<Plus size={15} />} onClick={addDealer}>Yeni Bayi</Button>}
        />
        <EmptyState icon={Handshake} title="Henüz bayi başvurusu yok" description="Yeni başvurular geldiğinde burada listelenecek." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Bayi Yönetimi"
        description="Bayi başvuruları, onay süreci ve bayi profilleri."
        actions={<Button icon={<Plus size={15} />} onClick={addDealer}>Yeni Bayi</Button>}
      />

      <Tabs
        items={[
          { value: 'all', label: 'Tümü', count: counts.all },
          { value: 'inceleniyor', label: 'İnceleniyor', count: counts.inceleniyor },
          { value: 'onaylandi', label: 'Onaylandı', count: counts.onaylandi },
          { value: 'reddedildi', label: 'Reddedildi', count: counts.reddedildi },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        <Toolbar>
          <div className="w-full max-w-xs">
            <SearchInput placeholder="Firma ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </Toolbar>

        {selected.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
            <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} bayi seçildi</span>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" icon={<Check size={13} />} onClick={approveBulk}>Toplu Onayla</Button>
              <Button variant="ghost" size="sm" icon={<X size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => setRejectTarget('bulk')}>Toplu Reddet</Button>
            </div>
          </div>
        )}

        <Table>
          <Thead>
            <Tr>
              <Th className="w-10">
                <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onChange={() => setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id))))} />
              </Th>
              <Th>Firma</Th>
              <Th>Ülke</Th>
              <Th>Yetkili</Th>
              <Th>Tahmini Hacim</Th>
              <Th>Durum</Th>
              <Th>Web Sitesi</Th>
              <Th>Atanan Kişi</Th>
              <Th>Başvuru Tarihi</Th>
              <Th className="w-24" />
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <TableEmptyRow colSpan={10}>Bu durumda başvuru bulunamadı.</TableEmptyRow>}
            {filtered.map((d) => {
              const info = dealerStatusTone[d.status];
              return (
                <Tr key={d.id} interactive onClick={() => setActiveDealer(d)}>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(d.id)} onChange={() => toggleOne(d.id)} />
                  </Td>
                  <Td className="font-medium">{d.company}</Td>
                  <Td>{d.country}</Td>
                  <Td className="flex items-center gap-2">
                    <Avatar name={d.contact} size="sm" />
                    {d.contact}
                  </Td>
                  <Td className="text-steel dark:text-white/50">{d.volume}</Td>
                  <Td><Badge tone={info.tone} dot>{info.label}</Badge></Td>
                  <Td>
                    {d.listedOnWebsite ? (
                      <Badge tone="info">
                        <Globe2 size={9} className="mr-0.5 inline" />
                        Listelendi
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Listelenmedi</Badge>
                    )}
                  </Td>
                  <Td className="text-steel dark:text-white/70">{d.assignedTo}</Td>
                  <Td className="text-steel dark:text-white/50">{d.submittedAt}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    {d.status === 'inceleniyor' ? (
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => approveDealer(d.id)} className="flex h-7 w-7 items-center justify-center rounded-soft text-success hover:bg-success-soft" aria-label="Onayla">
                          <Check size={15} />
                        </button>
                        <button type="button" onClick={() => setRejectTarget(d)} className="flex h-7 w-7 items-center justify-center rounded-soft text-danger hover:bg-danger-soft" aria-label="Reddet">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteTarget(d)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Bayiyi sil">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>

      <DealerDrawer
        dealer={activeDealer}
        onClose={() => setActiveDealer(null)}
        onApprove={approveDealer}
        onReject={(dealer) => setRejectTarget(dealer)}
        onUpdate={updateDealer}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title={rejectTarget === 'bulk' ? `${selected.size} başvuruyu reddet` : 'Başvuruyu reddet'}
        description={
          rejectTarget === 'bulk'
            ? <>Seçili {selected.size} bayi başvurusunu reddetmek üzeresiniz.</>
            : rejectTarget
              ? <>&quot;{rejectTarget.company}&quot; başvurusunu reddetmek üzeresiniz.</>
              : null
        }
        confirmLabel="Reddet"
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Bayiyi sil"
        description={deleteTarget ? <>&quot;{deleteTarget.company}&quot; bayi kaydını kalıcı olarak silmek üzeresiniz.</> : null}
        consequences={deleteTarget?.listedOnWebsite ? ['Web sitesi bayi listesinden de kaldırılacak'] : undefined}
        confirmLabel="Bayiyi Sil"
        onConfirm={confirmDeleteDealer}
        onCancel={() => setDeleteTarget(null)}
      />
    </ContentContainer>
  );
}
