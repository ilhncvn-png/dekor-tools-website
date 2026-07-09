'use client';

import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClassName?: string;
  fill?: boolean;
}

/**
 * Tiny inline trend line for stat cards — hand-rolled SVG rather than a
 * charting dependency (docs/engineering "avoid unnecessary packages"):
 * a sparkline is just a polyline, not worth a library. The line draws in
 * on mount via Framer Motion's pathLength animation — a subtle "alive"
 * touch rather than a static decorative image.
 */
export function Sparkline({ data, width = 72, height = 28, className, strokeClassName = 'stroke-current', fill = true }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      {fill && <path d={areaPath} className="fill-current opacity-10" />}
      <motion.path
        d={linePath}
        fill="none"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      />
    </svg>
  );
}
