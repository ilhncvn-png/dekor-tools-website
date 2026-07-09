'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, FileText, Upload, Handshake, Newspaper, Megaphone, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { QuickAction } from '@/lib/mock-data';

const iconMap: Record<string, LucideIcon> = { Package, FileText, Upload, Handshake, Newspaper, Megaphone };

interface QuickActionsProps {
  actions: QuickAction[];
}

/** "Hızlı İşlemler" as launch tiles — large icon, one-word label, direct link. Built for a single glance + click, not a menu to read. */
export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Hızlı İşlemler</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] ?? Package;
          return (
            <Link key={action.href + action.label} href={action.href} className="block">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
                className="group flex flex-col gap-2 rounded-soft border border-border px-3.5 py-3.5 transition-colors duration-fast hover:border-red/30 hover:bg-mist/50 hover:shadow-elevation-raised dark:border-white/[.06] dark:hover:border-red-eyebrow/30 dark:hover:bg-white/[.03] dark:hover:shadow-elevation-dark-raised"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-mist text-steel transition-colors group-hover:bg-red/10 group-hover:text-red dark:bg-white/[.06] dark:text-white/50 dark:group-hover:bg-red/15 dark:group-hover:text-red-eyebrow">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[12.5px] font-medium leading-tight text-near-black dark:text-white">{action.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-steel dark:text-white/40">{action.description}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
