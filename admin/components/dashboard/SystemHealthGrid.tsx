import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import type { SystemHealthItem } from '@/lib/mock-data';

/** Only "Depolama" (storage) naturally has a fill percentage — parsed from its real "X / Y GB" detail string rather than a hardcoded number. */
function storagePercent(detail: string): number | null {
  const match = detail.match(/([\d.]+)\s*\/\s*([\d.]+)\s*GB/);
  if (!match) return null;
  return Math.round((parseFloat(match[1]) / parseFloat(match[2])) * 100);
}

const statusConfig: Record<SystemHealthItem['status'], { icon: typeof CheckCircle2; className: string; dot: string }> = {
  saglikli: { icon: CheckCircle2, className: 'text-success', dot: 'bg-success' },
  uyari: { icon: AlertCircle, className: 'text-warning', dot: 'bg-warning' },
  kritik: { icon: XCircle, className: 'text-danger', dot: 'bg-danger' },
};

const severityTone: Record<SystemHealthItem['severity'], { tone: 'danger' | 'warning' | 'neutral'; label: string } | null> = {
  yok: null,
  dusuk: { tone: 'neutral', label: 'Düşük önem' },
  orta: { tone: 'warning', label: 'Orta önem' },
  yuksek: { tone: 'danger', label: 'Yüksek önem' },
};

interface SystemHealthGridProps {
  items: SystemHealthItem[];
  /** Renders as a compact row of status chips (click to expand details) instead of the full detailed grid. */
  compact?: boolean;
}

/** "Website Sağlığı" — infrastructure checks. Compact mode: small status cards with description, optional progress fill (storage), and last-checked time — all visible at a glance, no click required. */
export function SystemHealthGrid({ items, compact }: SystemHealthGridProps) {
  const healthyCount = items.filter((i) => i.status === 'saglikli').length;

  if (compact) {
    return (
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-heading-md text-near-black dark:text-white">Website Sağlığı</h2>
          <span className="text-[12px] text-steel dark:text-white/40">
            {healthyCount}/{items.length} sağlıklı
          </span>
        </div>
        <p className="mb-4 -mt-3 text-[12px] text-steel dark:text-white/40">Bir şey bozuk mu?</p>
        <div className="grid grid-cols-1 gap-2.5 tablet:grid-cols-2">
          {items.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            const pct = storagePercent(item.detail);
            return (
              <div key={item.id} className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-near-black dark:text-white">
                    <Icon size={13} className={config.className} />
                    {item.label}
                  </span>
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} />
                </div>
                <p className="mt-1 truncate text-[11.5px] text-steel dark:text-white/50">{item.detail}</p>
                {pct !== null && <ProgressBar value={pct} tone={pct > 85 ? 'danger' : pct > 65 ? 'warning' : 'success'} className="mt-1.5" />}
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-steel/70 dark:text-white/30">
                  <Clock size={9} />
                  {item.lastChecked}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">Sistem Sağlığı</h2>
        <span className="text-[12px] text-steel dark:text-white/40">
          {healthyCount}/{items.length} sağlıklı
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {items.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          const severity = severityTone[item.severity];
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-soft border border-border px-3.5 py-3 dark:border-white/[.06]"
            >
              <Icon size={16} className={cn('mt-0.5 shrink-0', config.className)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{item.label}</p>
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} />
                  </div>
                  {severity && <Badge tone={severity.tone}>{severity.label}</Badge>}
                </div>
                <p className="mt-0.5 truncate text-[11.5px] font-medium text-steel dark:text-white/50">{item.detail}</p>
                <p className="mt-0.5 truncate text-[11px] text-steel/80 dark:text-white/35">{item.description}</p>
                <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-steel/70 dark:text-white/30">
                  <Clock size={10} />
                  Son kontrol: {item.lastChecked}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
