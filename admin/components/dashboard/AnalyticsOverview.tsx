'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MiniChart } from '@/components/ui/MiniChart';
import type { AnalyticsSeries } from '@/lib/mock-data';

interface AnalyticsOverviewProps {
  series: AnalyticsSeries[];
}

/** Large "Analytics Overview" — Traffic/SEO/Dealers/Products/Downloads/Languages/Content tabs, animated on switch, realistic sample data only. */
export function AnalyticsOverview({ series }: AnalyticsOverviewProps) {
  const [active, setActive] = useState(series[0]?.id);
  const current = series.find((s) => s.id === active) ?? series[0];

  const first = current.data[0];
  const last = current.data[current.data.length - 1];
  const changePct = first !== 0 ? Math.round(((last - first) / Math.abs(first)) * 100) : 0;
  const isUp = last >= first;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-heading-md text-near-black dark:text-white">Analitik Genel Bakış</h2>
          <p className="text-body-sm text-steel dark:text-white/50">{current.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {series.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`rounded-soft px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-fast ${
                s.id === active
                  ? 'bg-red/10 text-red dark:bg-red/15 dark:text-red-eyebrow'
                  : 'text-steel hover:bg-mist hover:text-near-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-display text-heading-xl tabular-nums text-near-black dark:text-white">
          {last.toLocaleString('tr-TR')}
          {current.unit && <span className="ml-1 text-body-sm font-normal text-steel dark:text-white/40">{current.unit}</span>}
        </span>
        <span className={`flex items-center gap-1 text-[12.5px] font-medium tabular-nums ${isUp ? 'text-success' : 'text-danger'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isUp ? '+' : ''}
          {changePct}%
        </span>
        <span className="text-[12px] text-steel dark:text-white/40">dönem başına göre</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <MiniChart data={current.data} labels={current.labels} variant={current.variant} toneClassName={current.tone} height={200} />
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
