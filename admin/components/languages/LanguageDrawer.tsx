'use client';

import { useEffect, useState } from 'react';
import { Languages, AlertCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { LanguageRow } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

function tone(completion: number): 'success' | 'warning' | 'danger' {
  if (completion >= 80) return 'success';
  if (completion >= 30) return 'warning';
  return 'danger';
}

interface LanguageDrawerProps {
  language: LanguageRow | null;
  onClose: () => void;
}

/** Quick-view drawer for a single language — content-type breakdown and the exact list of untranslated pages. */
export function LanguageDrawer({ language, onClose }: LanguageDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(language);
  useEffect(() => {
    if (language) setDisplay(language);
  }, [language]);

  if (!display) return null;

  function queueTranslation() {
    if (!display) return;
    push({ tone: 'success', title: 'Çeviri kuyruğuna eklendi', description: `${display.untranslatedPages.length} çevrilmemiş sayfa için talep oluşturuldu.` });
  }

  return (
    <Drawer
      open={Boolean(language)}
      onClose={onClose}
      title={display.name}
      description={display.code}
      footer={<Button className="w-full" disabled={display.untranslatedPages.length === 0} onClick={queueTranslation}>Çeviri Kuyruğuna Ekle</Button>}
    >
      <div className="flex flex-wrap items-center gap-2">
        {display.isDefault && <Badge tone="info">Varsayılan Dil</Badge>}
        <Badge tone={display.active ? 'success' : 'neutral'} dot>{display.active ? 'Aktif' : 'Pasif'}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="font-display text-heading-xl tabular-nums text-near-black dark:text-white">%{display.completion}</span>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-near-black dark:text-white">Genel Tamamlanma</p>
          <ProgressBar value={display.completion} tone={tone(display.completion)} className="mt-1.5" />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">İçerik Türüne Göre Kapsam</p>
        <ul className="flex flex-col gap-3">
          {display.contentBreakdown.map((item) => {
            const pct = item.total > 0 ? Math.round((item.translated / item.total) * 100) : 0;
            return (
              <li key={item.type}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-medium text-near-black dark:text-white/85">
                    <Languages size={11} /> {item.type}
                  </span>
                  <span className="tabular-nums text-steel dark:text-white/40">
                    {item.translated}/{item.total}
                  </span>
                </div>
                <ProgressBar value={pct} tone={tone(pct)} />
              </li>
            );
          })}
        </ul>
      </div>

      {display.untranslatedPages.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <AlertCircle size={11} /> Çevrilmemiş Sayfalar
          </p>
          <div className="flex flex-wrap gap-1.5">
            {display.untranslatedPages.map((p) => (
              <Badge key={p} tone="warning">{p}</Badge>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
