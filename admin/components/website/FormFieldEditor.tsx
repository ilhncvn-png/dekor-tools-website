'use client';

import { useState } from 'react';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import type { ApplicationForm } from '@/lib/mock-data';

const typeTone: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'ai'> = {
  metin: 'neutral',
  'e-posta': 'info',
  telefon: 'info',
  sayi: 'neutral',
  secim: 'warning',
  'uzun-metin': 'neutral',
  dosya: 'ai',
};

interface FormFieldEditorProps {
  form: ApplicationForm;
}

/** Reusable multi-step application-form field editor — powers both Career and Dealer application forms with the same UI. */
export function FormFieldEditor({ form }: FormFieldEditorProps) {
  const [activeStep, setActiveStep] = useState(1);
  const stepFields = form.fields.filter((f) => f.step === activeStep).sort((a, b) => a.order - b.order);

  return (
    <>
      <Card className="mb-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">Hedef Sayfa: {form.targetPage}</Badge>
          <Badge tone="success">Gönderim: {form.submitsTo}</Badge>
          <Badge tone="neutral">{form.stepNames.length} adım</Badge>
          <Badge tone="neutral">{form.fields.length} alan</Badge>
        </div>
      </Card>

      <Tabs
        items={form.stepNames.map((name, i) => ({ value: String(i + 1), label: `${i + 1}. ${name}` }))}
        value={String(activeStep)}
        onChange={(v) => setActiveStep(Number(v))}
      />

      <div className="mt-4">
        <Card className="p-0">
          <ul className="divide-y divide-border dark:divide-white/[.06]">
            {stepFields.map((field) => (
              <li key={field.id} className="flex items-center gap-3 px-4 py-3.5">
                <GripVertical size={15} className="shrink-0 cursor-grab text-steel/50 dark:text-white/25" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{field.label}</p>
                    {field.required && <Badge tone="danger">Zorunlu</Badge>}
                  </div>
                  <p className="font-mono text-[11px] text-steel dark:text-white/40">{field.placeholder}</p>
                </div>
                <Badge tone={typeTone[field.type]}>{field.type}</Badge>
                <button type="button" className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Düzenle">
                  <Pencil size={14} />
                </button>
                <button type="button" className="shrink-0 text-steel hover:text-danger dark:text-white/40" aria-label="Sil">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-3 dark:border-white/[.06]">
            <Button variant="ghost" size="sm" icon={<Plus size={13} />}>Bu Adıma Alan Ekle</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
