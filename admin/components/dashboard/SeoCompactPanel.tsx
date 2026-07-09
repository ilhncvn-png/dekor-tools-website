import Link from 'next/link';
import { Sparkles, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { languageRows, type seoOverview as SeoOverviewData } from '@/lib/mock-data';

interface SeoCompactPanelProps {
  data: typeof SeoOverviewData;
}

/** Compact "SEO" panel — critical issues, warnings, top opportunity, and one AI recommendation. Full breakdown lives in SEO Yönetimi. */
export function SeoCompactPanel({ data }: SeoCompactPanelProps) {
  const topOpportunity = [...data.keywordHealth].sort((a, b) => (b.position ?? 0) - (a.position ?? 0))[0];
  const weakestLanguage = [...languageRows].filter((l) => l.active && !l.isDefault).sort((a, b) => a.completion - b.completion)[0];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-heading-md text-near-black dark:text-white">SEO</h2>
        <Link href="/seo-yonetimi" className="text-[12px] font-medium text-red dark:text-red-eyebrow">Tümünü Gör</Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-soft bg-danger-soft px-3 py-2.5">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-danger">
            <AlertTriangle size={10} /> Kritik
          </p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-danger">{data.criticalPages}</p>
        </div>
        <div className="rounded-soft bg-warning-soft px-3 py-2.5">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-warning">Uyarı</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-warning">{data.warningPages}</p>
        </div>
      </div>

      {topOpportunity && (
        <div className="mt-3 flex items-center justify-between rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">En Büyük Fırsat</p>
            <p className="truncate text-[12.5px] font-medium text-near-black dark:text-white">{topOpportunity.keyword}</p>
          </div>
          <Badge tone="warning">
            <TrendingDown size={10} className="mr-1 inline" />
            #{topOpportunity.position}
          </Badge>
        </div>
      )}

      {weakestLanguage && (
        <div className="mt-3 flex items-start gap-2 rounded-soft bg-ai-soft px-3 py-2.5 text-ai">
          <Sparkles size={13} className="mt-0.5 shrink-0" />
          <p className="text-[12.5px]">
            SEO skorunu artırmak için önce <Link href="/dil-yonetimi" className="underline underline-offset-2">{weakestLanguage.name}</Link> sayfalarını çevirin (%{weakestLanguage.completion} tamamlandı).
          </p>
        </div>
      )}
    </Card>
  );
}
