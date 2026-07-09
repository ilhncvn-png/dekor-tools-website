'use client';

import { useMemo, useState } from 'react';
import { Inbox, CheckCircle2, Trash2, X, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { SubmissionDrawer } from '@/components/submissions/SubmissionDrawer';
import { formSubmissions as initialFormSubmissions, type FormSubmission } from '@/lib/mock-data';
import { submissionStatusTone, submissionTypeLabel } from '@/lib/status-tones';

const priorityTone: Record<string, { tone: 'danger' | 'warning' | 'neutral'; label: string }> = {
  yuksek: { tone: 'danger', label: 'Yüksek Öncelik' },
  orta: { tone: 'warning', label: 'Orta Öncelik' },
  dusuk: { tone: 'neutral', label: 'Düşük Öncelik' },
};

function toCsv(rows: FormSubmission[]): string {
  const header = ['Ad', 'E-posta', 'Tür', 'Konu', 'Durum', 'Öncelik', 'Kaynak', 'Tarih'];
  const lines = rows.map((s) =>
    [s.name, s.email, submissionTypeLabel[s.type], s.subject, s.status, s.priority, s.sourceForm, s.submittedAt]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export default function FormTalepleriPage() {
  const { push } = useToast();
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>(initialFormSubmissions);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filtered = useMemo(
    () =>
      formSubmissions.filter((s) => {
        if (query && !s.subject.toLowerCase().includes(query.toLowerCase()) && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (type !== 'all' && s.type !== type) return false;
        return true;
      }),
    [formSubmissions, query, type]
  );

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateSubmission(updated: FormSubmission) {
    setFormSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setActiveSubmission(updated);
  }

  function bulkClose() {
    setFormSubmissions((prev) => prev.map((s) => (selected.has(s.id) ? { ...s, status: 'kapatildi' } : s)));
    push({ tone: 'success', title: `${selected.size} talep kapatıldı` });
    setSelected(new Set());
  }

  function confirmBulkDelete() {
    setFormSubmissions((prev) => prev.filter((s) => !selected.has(s.id)));
    push({ tone: 'danger', title: `${selected.size} talep silindi` });
    setSelected(new Set());
    setBulkDeleteOpen(false);
  }

  function exportCsv() {
    const rows = selected.size > 0 ? formSubmissions.filter((s) => selected.has(s.id)) : filtered;
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-talepleri.csv';
    a.click();
    URL.revokeObjectURL(url);
    push({ tone: 'success', title: `${rows.length} talep dışa aktarıldı` });
  }

  if (formSubmissions.length === 0) {
    return (
      <ContentContainer>
        <PageHeader title="Form Talepleri" description="İletişim, şikayet, fikir ve kariyer başvuruları." />
        <EmptyState icon={Inbox} title="Gelen kutusu boş" description="Web sitesinden gelen yeni talepler burada listelenecek." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Form Talepleri"
        description="İletişim, şikayet, fikir ve kariyer başvuruları."
        actions={<Button variant="secondary" icon={<Download size={15} />} onClick={exportCsv}>Dışa Aktar</Button>}
      />

      <Toolbar actions={<span className="text-[12px] text-steel dark:text-white/40">{filtered.length} talep</span>}>
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Ad veya konu ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Tüm Türler</option>
            <option value="iletisim">İletişim</option>
            <option value="sikayet">Şikayet</option>
            <option value="fikir">Fikir</option>
            <option value="kariyer">Kariyer</option>
            <option value="bayi">Bayilik</option>
          </Select>
        </div>
      </Toolbar>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} talep seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<CheckCircle2 size={13} />} onClick={bulkClose}>Kapat</Button>
            <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => setBulkDeleteOpen(true)}>Sil</Button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-soft p-1.5 text-steel hover:bg-mist dark:text-white/40 dark:hover:bg-white/5" aria-label="Seçimi temizle">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-border dark:divide-white/[.06]">
          {filtered.map((s) => {
            const info = submissionStatusTone[s.status];
            return (
              <li
                key={s.id}
                className="flex cursor-pointer items-center gap-3.5 px-4 py-3.5 transition-colors duration-fast hover:bg-mist/50 dark:hover:bg-white/[.03]"
                onClick={() => setActiveSubmission(s)}
              >
                <span onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} />
                </span>
                <Avatar name={s.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{s.name}</p>
                    <Badge tone="neutral">{submissionTypeLabel[s.type]}</Badge>
                    <Badge tone={priorityTone[s.priority].tone}>{priorityTone[s.priority].label}</Badge>
                  </div>
                  <p className="truncate text-body-sm text-steel dark:text-white/50">{s.subject}</p>
                  <p className="mt-0.5 text-[11px] text-steel/80 dark:text-white/35">
                    {s.sourceForm} · {s.assignedTo ? `Atanan: ${s.assignedTo}` : 'Henüz atanmadı'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={info.tone} dot>{info.label}</Badge>
                  <span className="text-[11px] text-steel dark:text-white/40">{s.submittedAt}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <SubmissionDrawer submission={activeSubmission} onClose={() => setActiveSubmission(null)} onUpdate={updateSubmission} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} talebi sil`}
        description={<>Seçili {selected.size} talebi kalıcı olarak silmek üzeresiniz.</>}
        confirmLabel="Talepleri Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </ContentContainer>
  );
}
