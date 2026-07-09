'use client';

import { useEffect, useState } from 'react';
import { Mail, FileText, Link2, Send } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { adminUsers, type FormSubmission } from '@/lib/mock-data';
import { submissionStatusTone, submissionTypeLabel } from '@/lib/status-tones';
import { useToast } from '@/components/ui/Toast';

const priorityTone: Record<string, { tone: 'danger' | 'warning' | 'neutral'; label: string }> = {
  yuksek: { tone: 'danger', label: 'Yüksek Öncelik' },
  orta: { tone: 'warning', label: 'Orta Öncelik' },
  dusuk: { tone: 'neutral', label: 'Düşük Öncelik' },
};

interface SubmissionDrawerProps {
  submission: FormSubmission | null;
  onClose: () => void;
  onUpdate?: (updated: FormSubmission) => void;
}

/** Quick-view + reply drawer for a single form submission — full message, source form/page, assignment, reply composer. */
export function SubmissionDrawer({ submission, onClose, onUpdate }: SubmissionDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(submission);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (submission) {
      setDisplay(submission);
      setReply('');
    }
  }, [submission]);

  if (!display) return null;

  const statusInfo = submissionStatusTone[display.status];

  function updateAssignee(name: string) {
    if (!display) return;
    const updated: FormSubmission = { ...display, assignedTo: name || null };
    setDisplay(updated);
    onUpdate?.(updated);
  }

  function sendReply() {
    if (!display || !reply.trim()) return;
    const updated: FormSubmission = { ...display, status: 'yanitlandi' };
    setDisplay(updated);
    onUpdate?.(updated);
    push({ tone: 'success', title: 'Yanıt gönderildi', description: `${display.email} adresine iletildi.` });
    setReply('');
  }

  function closeSubmission() {
    if (!display) return;
    const updated: FormSubmission = { ...display, status: 'kapatildi' };
    setDisplay(updated);
    onUpdate?.(updated);
    push({ tone: 'info', title: 'Talep kapatıldı' });
  }

  return (
    <Drawer
      open={Boolean(submission)}
      onClose={onClose}
      title={display.subject}
      description={display.name}
      footer={
        <div className="flex items-center justify-between gap-2">
          {display.status !== 'kapatildi' && (
            <Button variant="secondary" className="flex-1" onClick={closeSubmission}>Kapat</Button>
          )}
          <Button icon={<Send size={14} />} className="flex-1" disabled={!reply.trim()} onClick={sendReply}>Yanıtla</Button>
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar name={display.name} size="lg" />
        <div>
          <p className="text-body-sm font-medium text-near-black dark:text-white">{display.name}</p>
          <p className="flex items-center gap-1 text-[12px] text-steel dark:text-white/40">
            <Mail size={11} /> {display.email}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{submissionTypeLabel[display.type]}</Badge>
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        <Badge tone={priorityTone[display.priority].tone}>{priorityTone[display.priority].label}</Badge>
      </div>

      <div className="mt-4 rounded-soft border border-border bg-mist/50 px-3.5 py-3 text-body-sm text-near-black dark:border-white/[.06] dark:bg-white/[.02] dark:text-white/85">
        {display.message}
      </div>

      <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <FileText size={10} /> Kaynak Form
        </p>
        <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.sourceForm}</p>
        <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-steel dark:text-white/40">
          <Link2 size={10} /> {display.sourcePage}
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Atanan Kişi</p>
        <Select value={display.assignedTo ?? ''} onChange={(e) => updateAssignee(e.target.value)}>
          <option value="">Atanmadı</option>
          {adminUsers.map((u) => (
            <option key={u.id} value={u.name}>{u.name}</option>
          ))}
        </Select>
      </div>

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">Gönderim tarihi: {display.submittedAt}</p>

      <div className="mt-5">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Hızlı Yanıt</p>
        <Textarea rows={4} placeholder="Yanıtınızı yazın..." value={reply} onChange={(e) => setReply(e.target.value)} />
      </div>
    </Drawer>
  );
}
