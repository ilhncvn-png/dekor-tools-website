'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Save, Link2, Share2, Tag } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { SeoRow } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

function scoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

interface SeoDrawerProps {
  row: SeoRow | null;
  onClose: () => void;
  onUpdate?: (updated: SeoRow) => void;
}

/** SEO editor drawer — live Google SERP preview + checklist, the actual "how the client fixes SEO" interface. */
export function SeoDrawer({ row, onClose, onUpdate }: SeoDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(row);
  const [title, setTitle] = useState(row?.title ?? '');
  const [description, setDescription] = useState(row?.metaDescription ?? '');

  useEffect(() => {
    if (row) {
      setDisplay(row);
      setTitle(row.title);
      setDescription(row.metaDescription);
    }
  }, [row]);

  if (!display) return null;

  function saveChanges() {
    if (!display) return;
    const recommendations = display.recommendations.filter((rec) => {
      if (rec.includes('Meta başlık') && title) return false;
      if (rec.includes('Meta açıklama') && description.length >= 30) return false;
      return true;
    });
    const scoreBonus = (title ? 10 : 0) + (description.length >= 30 ? 10 : 0);
    const updated: SeoRow = {
      ...display,
      title,
      metaDescription: description,
      recommendations,
      score: Math.min(100, display.score + scoreBonus),
      status: recommendations.length === 0 ? 'iyi' : display.status,
      lastAudit: new Date().toISOString().slice(0, 10),
    };
    onUpdate?.(updated);
    push({ tone: 'success', title: 'SEO değişiklikleri kaydedildi', description: `${display.page} için meta bilgiler güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(row)}
      onClose={onClose}
      title={`SEO — ${display.page}`}
      description="dekortools.com sitesinde bu sayfanın meta bilgileri"
      footer={
        <Button icon={<Save size={14} />} className="w-full" onClick={saveChanges}>Değişiklikleri Kaydet</Button>
      }
    >
      <div className="flex items-center gap-3">
        <span className="font-display text-heading-lg tabular-nums text-near-black dark:text-white">{display.score}</span>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-near-black dark:text-white">SEO Skoru</p>
          <ProgressBar value={display.score} tone={scoreTone(display.score)} className="mt-1" />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Meta Başlık</p>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
        <p className="mt-1 text-right text-[11px] text-steel dark:text-white/40">{title.length}/60</p>
      </div>

      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Meta Açıklama</p>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} />
        <p className="mt-1 text-right text-[11px] text-steel dark:text-white/40">{description.length}/160</p>
      </div>

      <div className="mt-2 rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Google Önizleme</p>
        <p className="truncate text-[12px] text-success">dekortools.com{display.page}</p>
        <p className="truncate text-[16px] text-info">{title || '(başlık yok)'}</p>
        <p className="line-clamp-2 text-[12.5px] text-steel dark:text-white/50">{description || 'Meta açıklama tanımlanmamış.'}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">H1 Başlığı</span>
          {display.h1Present ? <CheckCircle2 size={15} className="text-success" /> : <XCircle size={15} className="text-danger" />}
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Yapısal Veri (Schema)</span>
          {display.schemaPresent ? <CheckCircle2 size={15} className="text-success" /> : <XCircle size={15} className="text-danger" />}
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Eksik ALT Metni</span>
          <Badge tone={display.altMissingCount > 0 ? 'warning' : 'success'}>{display.altMissingCount}</Badge>
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Open Graph Görseli</span>
          {display.ogImage ? <CheckCircle2 size={15} className="text-success" /> : <XCircle size={15} className="text-danger" />}
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Twitter Card</span>
          {display.twitterCardEnabled ? <CheckCircle2 size={15} className="text-success" /> : <XCircle size={15} className="text-danger" />}
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Arama Motoru İndeksleme</span>
          <Badge tone={display.robotsIndex ? 'success' : 'neutral'}>{display.robotsIndex ? 'Index' : 'Noindex'}</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="mb-1 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <Link2 size={10} /> Canonical URL
        </p>
        <p className="truncate font-mono text-[12px] text-near-black dark:text-white/85">{display.canonicalUrl}</p>
      </div>

      {display.ogImage && (
        <div className="mt-3 flex items-center gap-2 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <Share2 size={13} className="text-steel dark:text-white/40" />
          <span className="truncate text-[12px] text-near-black dark:text-white/85">{display.ogImage}</span>
        </div>
      )}

      {display.keywords.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Tag size={10} /> Anahtar Kelimeler
          </p>
          <div className="flex flex-wrap gap-1.5">
            {display.keywords.map((kw) => (
              <Badge key={kw} tone="neutral">{kw}</Badge>
            ))}
          </div>
        </div>
      )}

      {display.recommendations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Öneriler</p>
          <ul className="flex flex-col gap-1.5">
            {display.recommendations.map((rec) => (
              <li key={rec} className="rounded-soft bg-warning-soft px-3 py-2 text-[12.5px] text-warning">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">Son denetim: {display.lastAudit}</p>
    </Drawer>
  );
}
