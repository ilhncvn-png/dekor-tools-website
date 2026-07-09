'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface MiniChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  variant?: 'area' | 'bar';
  toneClassName?: string;
}

/**
 * Elegant hand-rolled area/bar chart for the dashboard's Analytics
 * Overview — no charting library, since these are simple single-series
 * time-series visualizations (real backend + a real library like Recharts
 * arrives with actual analytics data per docs/engineering stack decision).
 */
export function MiniChart({ data, labels, height = 120, variant = 'area', toneClassName = 'text-red' }: MiniChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();
  const width = 320;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const padding = 4;
  const chartHeight = height - padding * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = padding + chartHeight - ((v - min) / range) * chartHeight;
    return [x, y] as const;
  });

  if (variant === 'bar') {
    const barWidth = (width / data.length) * 0.55;
    return (
      <div className={cn('relative', toneClassName)} style={{ height }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {data.map((v, i) => {
            const barHeight = ((v - min) / range) * chartHeight + 4;
            const x = i * stepX + (stepX - barWidth) / 2;
            const y = height - barHeight;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                className={cn('fill-current transition-opacity duration-fast', hoverIndex === i ? 'opacity-100' : 'opacity-60')}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>
        {hoverIndex !== null && (
          <div className="pointer-events-none absolute -top-1 left-0 rounded-sharp border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-near-black shadow-elevation-raised dark:border-white/10 dark:bg-surface-dark-overlay dark:text-white">
            {labels?.[hoverIndex] ?? hoverIndex}: {data[hoverIndex].toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    );
  }

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <div className={cn('relative', toneClassName)} style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        {hoverIndex !== null && (
          <line
            x1={points[hoverIndex][0]}
            x2={points[hoverIndex][0]}
            y1={0}
            y2={height}
            strokeWidth={1}
            strokeDasharray="3,3"
            className="stroke-current opacity-30"
          />
        )}
        <path d={linePath} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-current" />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={hoverIndex === i ? 4 : 0}
            className="fill-current transition-all duration-fast"
          />
        ))}
        {/* invisible hover targets, one per data point */}
        {points.map(([x], i) => (
          <rect
            key={`hit-${i}`}
            x={Math.max(0, x - stepX / 2)}
            y={0}
            width={stepX}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>
      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute -top-1 rounded-sharp border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-near-black shadow-elevation-raised dark:border-white/10 dark:bg-surface-dark-overlay dark:text-white"
          style={{ left: `${(points[hoverIndex][0] / width) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {labels?.[hoverIndex] ?? hoverIndex}: {data[hoverIndex].toLocaleString('tr-TR')}
        </div>
      )}
    </div>
  );
}
