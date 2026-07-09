import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { seoOverview as SeoOverviewData } from '@/lib/mock-data';

interface SeoOverviewProps {
  data: typeof SeoOverviewData;
}

const scoreRingColor: Record<'success' | 'warning' | 'danger', string> = {
  success: '#1F8A5B',
  warning: '#B8851F',
  danger: '#D32027',
};

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;
const trendClass = { up: 'text-success', down: 'text-danger', flat: 'text-steel dark:text-white/40' } as const;

const structuredDataTone: Record<'aktif' | 'kismi' | 'eksik', { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  aktif: { tone: 'success', label: 'Aktif' },
  kismi: { tone: 'warning', label: 'Kısmi' },
  eksik: { tone: 'danger', label: 'Eksik' },
};

/** Premium "SEO Genel Bakışı" — large score ring, keyword health, structured-data status, index coverage. */
export function SeoOverview({ data }: SeoOverviewProps) {
  const scoreTone = data.overallScore >= 80 ? 'success' : data.overallScore >= 50 ? 'warning' : 'danger';
  const ringColor = scoreRingColor[scoreTone];
  const ringStyle = { background: `conic-gradient(${ringColor} ${data.overallScore * 3.6}deg, transparent 0deg)` };
  const indexRate = Math.round((data.indexedPages / data.totalPages) * 100);

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">SEO Genel Bakışı</h2>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full p-[4px]" style={ringStyle}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white dark:bg-surface-dark-raised">
            <span className="font-display text-heading-xl tabular-nums text-near-black dark:text-white">{data.overallScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-near-black dark:text-white">Genel SEO Sağlığı</p>
          <p className="text-[12px] text-success">{data.scoreChange}</p>
          <p className="mt-1 text-[11.5px] text-steel dark:text-white/40">
            Dizinlenen sayfa: {data.indexedPages}/{data.totalPages} (%{indexRate})
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-soft bg-success-soft px-2 py-2.5">
          <p className="font-display text-heading-sm tabular-nums text-success">{data.excellentPages}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Mükemmel</p>
        </div>
        <div className="rounded-soft bg-warning-soft px-2 py-2.5">
          <p className="font-display text-heading-sm tabular-nums text-warning">{data.warningPages}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Uyarı</p>
        </div>
        <div className="rounded-soft bg-danger-soft px-2 py-2.5">
          <p className="font-display text-heading-sm tabular-nums text-danger">{data.criticalPages}</p>
          <p className="text-[10.5px] text-steel dark:text-white/40">Kritik</p>
        </div>
      </div>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Anahtar Kelime Sağlığı</h3>
      <ul className="flex flex-col divide-y divide-border dark:divide-white/[.06]">
        {data.keywordHealth.map((k) => {
          const TrendIcon = trendIcon[k.trend];
          return (
            <li key={k.keyword} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <span className="truncate text-[12.5px] text-near-black dark:text-white/80">{k.keyword}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="text-[12px] tabular-nums text-steel dark:text-white/40">#{k.position}</span>
                <TrendIcon size={13} className={trendClass[k.trend]} />
              </span>
            </li>
          );
        })}
      </ul>

      <h3 className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel dark:text-white/40">Yapısal Veri Durumu</h3>
      <div className="grid grid-cols-2 gap-2">
        {data.structuredDataStatus.map((s) => {
          const info = structuredDataTone[s.status];
          return (
            <div key={s.type} className="flex items-center justify-between rounded-soft border border-border px-2.5 py-2 dark:border-white/[.06]">
              <span className="text-[12px] text-near-black dark:text-white/80">{s.type}</span>
              <Badge tone={info.tone}>{info.label}</Badge>
            </div>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border text-[12.5px] dark:divide-white/[.06]">
        <li className="flex items-center justify-between py-2 first:pt-0">
          <span className="text-near-black dark:text-white/80">Eksik Meta Açıklama</span>
          <span className="tabular-nums text-steel dark:text-white/40">{data.missingMeta}</span>
        </li>
        <li className="flex items-center justify-between py-2">
          <span className="text-near-black dark:text-white/80">Eksik ALT Metni</span>
          <span className="tabular-nums text-steel dark:text-white/40">{data.missingAlt}</span>
        </li>
        <li className="flex items-center justify-between py-2 last:pb-0">
          <span className="text-near-black dark:text-white/80">Eksik İç Bağlantı</span>
          <span className="tabular-nums text-steel dark:text-white/40">{data.missingInternalLinks}</span>
        </li>
      </ul>
    </Card>
  );
}
