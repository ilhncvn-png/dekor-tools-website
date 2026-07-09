'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { primaryNavigation } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

const SECTION_STORAGE_KEY = 'dcc-sidebar-collapsed-sections';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Controls the mobile off-canvas state; ignored on desktop. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Sprint 7 redesign — same 14-item Turkish navigation, same routes, same
 * collapse behavior as Sprint 5. What changed: a single sliding active
 * indicator (Framer Motion `layoutId`, so it glides between items instead
 * of popping), refined hover with an interpolated background instead of a
 * hard on/off, tighter icon/label rhythm, and — when collapsed — a real
 * Tooltip on every icon instead of the browser's plain `title` attribute.
 */
export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(SECTION_STORAGE_KEY);
    if (stored) {
      try {
        setCollapsedSections(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      {/* Mobile scrim */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-near-black/60 backdrop-blur-sm laptop:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border dark:border-white/10',
          'bg-white dark:bg-surface-dark-subtle',
          'laptop:sticky laptop:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full laptop:translate-x-0',
          'transition-transform duration-base ease-premium laptop:transition-none'
        )}
        style={{ width: collapsed ? 76 : 264 }}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-soft bg-red text-sm font-bold text-white shadow-glow-red">
            D
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="min-w-0">
              <div className="truncate font-display text-heading-sm text-near-black dark:text-white">
                Dekor Control Center
              </div>
              <div className="truncate font-mono text-[10px] uppercase tracking-[1.4px] text-steel dark:text-white/40">
                IC Corporate Platform
              </div>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {primaryNavigation.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const previousSection = primaryNavigation[index - 1]?.section;
              const showSectionHeader = item.section && item.section !== previousSection;
              const isSectionCollapsed = Boolean(item.section && collapsedSections[item.section]);

              if (isSectionCollapsed && !isActive && !collapsed) {
                return showSectionHeader ? (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => item.section && toggleSection(item.section)}
                      className="mb-1 mt-4 flex w-full items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[1.2px] text-steel/70 first:mt-1 dark:text-white/30"
                    >
                      {item.section}
                      <ChevronDown size={12} className="-rotate-90" />
                    </button>
                  </li>
                ) : null;
              }

              const link = (
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-soft px-3 py-2.5 text-body-sm transition-colors duration-fast',
                    isActive
                      ? 'text-red dark:text-red-eyebrow'
                      : 'text-steel hover:text-near-black dark:text-white/60 dark:hover:text-white'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-soft bg-red/10 dark:bg-red/15"
                    />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 scale-95 rounded-soft bg-mist opacity-0 transition-all duration-fast ease-premium group-hover:scale-100 group-hover:opacity-100 dark:bg-white/5" />
                  )}
                  <Icon size={18} strokeWidth={1.8} className="relative z-10 shrink-0" />
                  {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                </Link>
              );

              return (
                <li key={item.href}>
                  {showSectionHeader && !collapsed && (
                    <button
                      type="button"
                      onClick={() => item.section && toggleSection(item.section)}
                      className="mb-1 mt-4 flex w-full items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[1.2px] text-steel/70 first:mt-1 dark:text-white/30"
                    >
                      {item.section}
                      <ChevronDown size={12} />
                    </button>
                  )}
                  {showSectionHeader && collapsed && <div className="my-2 border-t border-border dark:border-white/10" />}
                  {collapsed ? (
                    <Tooltip label={item.label} side="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-border p-3 dark:border-white/10 laptop:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
            className="flex w-full items-center justify-center gap-2 rounded-soft py-2 text-steel transition-colors duration-fast hover:bg-mist hover:text-near-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
