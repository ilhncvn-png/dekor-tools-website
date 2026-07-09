import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import type { dealerOverview as DealerOverviewData } from '@/lib/mock-data';

interface DealerOverviewProps {
  data: typeof DealerOverviewData;
}

function healthTone(health: number): 'success' | 'warning' | 'danger' {
  if (health >= 90) return 'success';
  if (health >= 75) return 'warning';
  return 'danger';
}

/** "Bayi Genel Bakışı" — pipeline funnel, regional distribution, dealer health ranking. Reflects a worldwide export network, not a single-market list. */
export function DealerOverview({ data }: DealerOverviewProps) {
  const maxCountry = Math.max(...data.topCountries.map((c) => c.count));
  const maxPipeline = Math.max(...data.pipeline.map((p) => p.count));

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Bayi Genel Bakışı</h2>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-soft bg-mist px-2 py-2.5 dark:bg-white/[.04]">
          <p className="font-display text-heading-md tabular-nums text-near-black dark:text-white">{data.newThisMonth}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Bu Ay Yeni</p>
        </div>
        <div className="rounded-soft bg-success-soft px-2 py-2.5">
          <p className="font-display text-heading-md tabular-nums text-success">{data.approved}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Onaylandı</p>
        </div>
        <div className="rounded-soft bg-warning-soft px-2 py-2.5">
          <p className="font-display text-heading-md tabular-nums text-warning">{data.waiting}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Bekliyor</p>
        </div>
        <div className="rounded-soft bg-danger-soft px-2 py-2.5">
          <p className="font-display text-heading-md tabular-nums text-danger">{data.rejected}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Reddedildi</p>
        </div>
      </div>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Başvuru Hattı (Pipeline)</h3>
      <div className="flex items-center gap-1">
        {data.pipeline.map((stage, i) => (
          <div key={stage.stage} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-mist dark:bg-white/10">
              <div
                className="h-full rounded-full bg-info transition-all duration-slow ease-premium"
                style={{ width: `${(stage.count / maxPipeline) * 100}%` }}
              />
            </div>
            <p className="text-center text-[10px] leading-tight text-steel dark:text-white/40">{stage.stage}</p>
            <p className="font-display text-heading-sm tabular-nums text-near-black dark:text-white">{stage.count}</p>
            {i < data.pipeline.length - 1 && <span className="sr-only">→</span>}
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Bölgesel Dağılım</h3>
      <div className="grid grid-cols-2 gap-2">
        {data.regions.map((r) => (
          <div key={r.region} className="rounded-soft border border-border px-2.5 py-2 dark:border-white/[.06]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-near-black dark:text-white/80">{r.region}</span>
              <Badge tone={r.tone}>{r.count}</Badge>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Ülke Dağılımı</h3>
      <ul className="flex flex-col gap-2">
        {data.topCountries.map((c) => (
          <li key={c.country} className="flex items-center gap-2.5">
            <span className="w-20 shrink-0 truncate text-[12.5px] text-near-black dark:text-white/80">{c.country}</span>
            <ProgressBar value={(c.count / maxCountry) * 100} tone="info" className="flex-1" />
            <span className="w-5 shrink-0 text-right text-[12px] tabular-nums text-steel dark:text-white/40">{c.count}</span>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">En Büyük Bayiler — Bayi Sağlığı</h3>
      <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
        {data.topDealers.map((d) => (
          <li key={d.company} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="truncate text-[12.5px] font-medium text-near-black dark:text-white/85">{d.company}</span>
              <span className="shrink-0 text-[12px] tabular-nums text-steel dark:text-white/40">{d.volume}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <ProgressBar value={d.health} tone={healthTone(d.health)} className="w-24" />
              <span className="text-[10.5px] tabular-nums text-steel dark:text-white/40">%{d.health} sağlık · {d.country}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
