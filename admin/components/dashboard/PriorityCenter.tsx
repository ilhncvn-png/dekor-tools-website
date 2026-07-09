'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Handshake,
  AlertTriangle,
  Languages,
  BadgeCheck,
  Package,
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
  Clock,
  Gauge,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { PriorityItem, Urgency } from '@/lib/mock-data';

const iconMap: Record<string, LucideIcon> = { Handshake, AlertTriangle, Languages, BadgeCheck, Package, ImageIcon };

const urgencyTone: Record<Urgency, { tone: 'danger' | 'warning' | 'neutral'; label: string }> = {
  kritik: { tone: 'danger', label: 'Kritik' },
  yuksek: { tone: 'warning', label: 'Yüksek' },
  orta: { tone: 'neutral', label: 'Orta' },
  dusuk: { tone: 'neutral', label: 'Düşük' },
};

// Action button only reads as "red = act now" for genuinely urgent items —
// lower-urgency tasks get a neutral secondary button instead of decorative red.
const actionButtonClass: Record<Urgency, string> = {
  kritik: 'bg-red text-white hover:bg-red/90',
  yuksek: 'bg-warning text-white hover:bg-warning/90',
  orta: 'bg-mist text-near-black hover:bg-concrete dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  dusuk: 'bg-mist text-near-black hover:bg-concrete dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
};

const businessImpactTone: Record<'yuksek' | 'orta' | 'dusuk', { tone: 'danger' | 'warning' | 'neutral'; label: string }> = {
  yuksek: { tone: 'danger', label: 'Yüksek Etki' },
  orta: { tone: 'warning', label: 'Orta Etki' },
  dusuk: { tone: 'neutral', label: 'Düşük Etki' },
};

interface PriorityCenterProps {
  items: PriorityItem[];
  /** Cap the list to the N highest-priority items — the dashboard shows only the top 3, the full list lives on its own page. */
  limit?: number;
}

/**
 * "Bugünün Öncelikleri" — a compact task center. Every card always shows
 * severity, estimated time-to-complete, business impact, and a single CTA;
 * the underlying reasoning (AI note, expected SEO/business effect) sits
 * behind a "Detay" toggle. Answers "what must I finish first" at a glance.
 */
export function PriorityCenter({ items, limit }: PriorityCenterProps) {
  const shown = limit ? [...items].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, limit) : items;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const criticalCount = shown.filter((i) => i.urgency === 'kritik').length;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">Bugünün Öncelikleri</h2>
        {criticalCount > 0 && (
          <Badge tone="danger" dot>
            {criticalCount} kritik
          </Badge>
        )}
      </div>
      <p className="mb-4 text-[12px] text-steel dark:text-white/40">Bugün ne yapmalıyım?</p>

      <div className="flex flex-col gap-2.5">
        {shown.map((item) => {
          const Icon = iconMap[item.icon] ?? AlertTriangle;
          const urgency = urgencyTone[item.urgency];
          const impact = item.businessImpact ? businessImpactTone[item.businessImpact] : null;
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className="rounded-soft border border-border p-3.5 dark:border-white/[.06]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.06] dark:text-white/50">
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={urgency.tone}>{urgency.label}</Badge>
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{item.label}</p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-steel dark:text-white/40">
                    {item.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {item.estimatedTime}
                      </span>
                    )}
                    {impact && (
                      <span className="flex items-center gap-1">
                        <Gauge size={11} /> {impact.label}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <Link
                      href={item.href}
                      className={cn('inline-flex items-center gap-1 rounded-soft px-2.5 py-1 text-[11.5px] font-medium transition-colors', actionButtonClass[item.urgency])}
                    >
                      {item.actionLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      aria-expanded={isExpanded}
                      className="flex items-center gap-0.5 rounded-soft px-2 py-1 text-[11.5px] font-medium text-steel hover:bg-mist dark:text-white/50 dark:hover:bg-white/5"
                    >
                      Detay
                      <ChevronDown size={12} className={cn('transition-transform duration-fast', isExpanded && 'rotate-180')} />
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-11 mt-2.5 flex flex-col gap-2 rounded-soft border border-border bg-mist/50 px-3.5 py-3 text-[12.5px] dark:border-white/[.06] dark:bg-white/[.02]">
                  <p>
                    <span className="font-medium text-near-black dark:text-white/85">Tahmini Etki: </span>
                    <span className="text-steel dark:text-white/50">{item.estimatedImpact}</span>
                  </p>
                  <p>
                    <span className="font-medium text-near-black dark:text-white/85">Önerilen Eylem: </span>
                    <span className="text-steel dark:text-white/50">{item.suggestedAction}</span>
                  </p>
                  {item.expectedSeoImprovement && (
                    <p>
                      <span className="font-medium text-near-black dark:text-white/85">Beklenen SEO Etkisi: </span>
                      <span className="text-success">{item.expectedSeoImprovement}</span>
                    </p>
                  )}
                  {item.expectedBusinessImpact && (
                    <p>
                      <span className="font-medium text-near-black dark:text-white/85">Beklenen İş Etkisi: </span>
                      <span className="text-info">{item.expectedBusinessImpact}</span>
                    </p>
                  )}
                  {item.aiRecommendation && (
                    <div className="mt-1 flex items-start gap-2 rounded-soft bg-ai-soft px-2.5 py-2 text-ai">
                      <Sparkles size={13} className="mt-0.5 shrink-0" />
                      <p>{item.aiRecommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
