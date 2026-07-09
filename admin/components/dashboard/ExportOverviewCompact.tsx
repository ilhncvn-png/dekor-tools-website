import Link from 'next/link';
import { Globe2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { dealerOverview as DealerOverviewData } from '@/lib/mock-data';

interface ExportOverviewCompactProps {
  data: typeof DealerOverviewData;
}

/** Compact export/region summary — Decor is an international manufacturer, so the dashboard always shows where the business actually is. */
export function ExportOverviewCompact({ data }: ExportOverviewCompactProps) {
  const topCountries = data.topCountries.slice(0, 3);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
          <Globe2 size={16} /> İhracat Genel Bakışı
        </h2>
        <Link href="/ihracat-haritasi" className="text-[12px] font-medium text-red dark:text-red-eyebrow">Haritayı Aç</Link>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {data.regions.map((r) => (
          <div key={r.region} className="rounded-soft border border-border px-2.5 py-2 text-center dark:border-white/[.06]">
            <p className="font-display text-heading-sm tabular-nums text-near-black dark:text-white">{r.count}</p>
            <p className="truncate text-[10px] text-steel dark:text-white/40">{r.region}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-4 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">En Aktif Ülkeler</p>
      <ul className="flex flex-col gap-1.5">
        {topCountries.map((c) => (
          <li key={c.country} className="flex items-center justify-between text-[12.5px]">
            <span className="text-near-black dark:text-white/85">{c.country}</span>
            <Badge tone="neutral">{c.count} bayi</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
