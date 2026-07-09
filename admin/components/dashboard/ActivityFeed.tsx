'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { ActivityItem, ActivityStatus } from '@/lib/mock-data';

const statusDot: Record<ActivityStatus, string> = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  neutral: 'bg-steel/50 dark:bg-white/30',
};

const statusBadgeTone: Record<ActivityStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  neutral: 'neutral',
};

interface ActivityFeedProps {
  items: ActivityItem[];
  /** Cap the feed to the latest N entries — the dashboard shows only 5, the full log lives in Sistem Ayarları → Denetim Kaydı. */
  limit?: number;
}

/**
 * Reusable "Son Aktiviteler" feed — avatar, actor/action/target, module
 * badge, status dot, timestamp. Rows are expandable (chevron toggle) so the
 * layout is ready for real per-activity detail once a backend exists —
 * today the expanded panel is an honest "detaylar yakında" placeholder,
 * not fabricated content.
 */
export function ActivityFeed({ items, limit }: ActivityFeedProps) {
  const shown = limit ? items.slice(0, limit) : items;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">Son Aktiviteler</h2>
        <Link href="/sistem-ayarlari?tab=denetim">
          <Button variant="ghost" size="sm">Tümünü Gör</Button>
        </Link>
      </div>
      <ul className="flex flex-col">
        {shown.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <li key={item.id} className="-mx-2 rounded-soft transition-colors duration-fast hover:bg-mist/60 dark:hover:bg-white/[.03]">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                aria-expanded={isExpanded}
                className="flex w-full items-start gap-3 rounded-soft px-2 py-2.5 text-left"
              >
                <div className="relative shrink-0">
                  <Avatar name={item.actor} size="sm" tone={item.actor === 'Sistem' ? 'ai' : 'neutral'} />
                  <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-surface-dark-raised', statusDot[item.status])} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm text-near-black dark:text-white/85">
                    <span className="font-medium">{item.actor}</span>{' '}
                    <span className="text-steel dark:text-white/50">{item.action}</span>{' '}
                    {item.target}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={statusBadgeTone[item.status]}>{item.module}</Badge>
                    <span className="text-[12px] text-steel dark:text-white/40">{item.time}</span>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className={cn(
                    'mt-1 shrink-0 text-steel transition-transform duration-fast dark:text-white/30',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
              {isExpanded && (
                <div className="ml-11 mr-2 mb-2.5 flex items-center justify-between gap-3 rounded-soft border border-dashed border-border px-3 py-2.5 text-[12px] text-steel dark:border-white/10 dark:text-white/40">
                  <span>Aktivite detayları (değişiklik geçmişi, ilgili kayıt) gerçek veri bağlandığında burada görünecek.</span>
                  <Link
                    href={item.href}
                    className="shrink-0 rounded-soft bg-mist px-2.5 py-1 text-[11.5px] font-medium text-near-black transition-colors hover:bg-concrete dark:bg-white/[.06] dark:text-white dark:hover:bg-white/10"
                  >
                    Görüntüle
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
