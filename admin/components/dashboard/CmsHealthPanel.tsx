'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import type { CmsHealthGroup } from '@/lib/mock-data';

function groupTone(completion: number): 'success' | 'warning' | 'danger' {
  if (completion >= 90) return 'success';
  if (completion >= 70) return 'warning';
  return 'danger';
}

interface CmsHealthPanelProps {
  groups: CmsHealthGroup[];
}

/** CMS Health, grouped by domain (Ürünler/Sayfalar/Medya/Dil/İnceleme) — a health summary per group instead of 10 near-identical bars. */
export function CmsHealthPanel({ groups }: CmsHealthPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const criticalGroups = groups.filter((g) => g.criticalCount > 0).length;
  const avgCompletion = Math.round(
    groups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.completion, 0) / g.items.length, 0) / groups.length
  );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">CMS Sağlık Durumu</h2>
        <span className="text-[12px] font-medium tabular-nums text-steel dark:text-white/40">Ortalama %{avgCompletion}</span>
      </div>

      {criticalGroups > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-soft bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
          <AlertTriangle size={14} className="shrink-0" />
          {criticalGroups} alanda kritik eksiklik var — aşağıda genişletip inceleyin.
        </div>
      )}

      <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
        {groups.map((group) => {
          const isOpen = openId === group.id;
          const groupCompletion = Math.round(group.items.reduce((s, i) => s + i.completion, 0) / group.items.length);
          return (
            <li key={group.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : group.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 text-left"
              >
                {group.criticalCount > 0 ? (
                  <AlertTriangle size={15} className="shrink-0 text-danger" />
                ) : (
                  <CheckCircle2 size={15} className="shrink-0 text-success" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-body-sm font-medium text-near-black dark:text-white">{group.label}</p>
                    <span className="text-[12px] tabular-nums text-steel dark:text-white/40">%{groupCompletion}</span>
                  </div>
                  <p className="truncate text-[12px] text-steel dark:text-white/50">{group.summary}</p>
                  <ProgressBar value={groupCompletion} tone={groupTone(groupCompletion)} className="mt-1.5" />
                </div>
                <ChevronDown size={14} className={cn('shrink-0 text-steel transition-transform duration-fast dark:text-white/30', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <ul className="ml-6 mt-2.5 flex flex-col gap-2.5 border-l border-border pl-3.5 dark:border-white/[.08]">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-near-black dark:text-white/80">{item.label}</span>
                        <span className="tabular-nums text-steel dark:text-white/40">%{item.completion}</span>
                      </div>
                      <ProgressBar value={item.completion} tone={groupTone(item.completion)} />
                      <p className="mt-1 text-[11px] text-steel dark:text-white/40">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
