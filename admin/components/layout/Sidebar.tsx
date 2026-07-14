'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { primaryNavigation, NAV_SECTIONS, DEFAULT_EXPANDED_SECTIONS, type NavEntry, type NavSection } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

const SECTION_STORAGE_KEY = 'dcc-sidebar-expanded-sections-v2';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Controls the mobile off-canvas state; ignored on desktop. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

// Group the flat nav list into ordered sections once (module-level, stable).
const GROUPED: { section: NavSection; items: NavEntry[] }[] = NAV_SECTIONS.map((section) => ({
  section,
  items: primaryNavigation.filter((item) => item.section === section),
})).filter((g) => g.items.length > 0);

function defaultExpandedState(): Record<string, boolean> {
  return Object.fromEntries(NAV_SECTIONS.map((s) => [s, DEFAULT_EXPANDED_SECTIONS.includes(s)]));
}

/**
 * Reorganized (2026 IA) sidebar: seven clearly-named, collapsible groups. Only
 * "Genel Bakış" and "İçerik Yönetimi" are expanded by default; the rest start
 * collapsed and remember their open/closed state per browser. The group that
 * contains the active route is always shown expanded so the current page is
 * never hidden, and its header lights up as a parent-active cue. Collapsed
 * (rail) mode shows every item as an icon with a real tooltip.
 */
export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpandedState);

  useEffect(() => {
    const stored = window.localStorage.getItem(SECTION_STORAGE_KEY);
    if (stored) {
      try {
        setExpanded((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  const toggleSection = (section: NavSection) => {
    setExpanded((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const activeSection = useMemo(
    () => primaryNavigation.find((item) => item.href === pathname)?.section,
    [pathname]
  );

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
        aria-label="Ana menü"
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2" aria-label="Bölüm menüsü">
          {GROUPED.map((group, groupIndex) => {
            const hasActiveChild = group.section === activeSection;
            // A group renders open when the user has it expanded OR it holds the active route.
            const isOpen = collapsed || expanded[group.section] || hasActiveChild;

            return (
              <div key={group.section} className={cn(groupIndex > 0 && 'mt-2')}>
                {collapsed ? (
                  groupIndex > 0 && <div className="mx-1 my-2 border-t border-border dark:border-white/10" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleSection(group.section)}
                    aria-expanded={isOpen}
                    className={cn(
                      'mb-1 mt-3 flex w-full items-center justify-between rounded-soft px-3 py-1.5 font-mono text-[10px] uppercase tracking-[1.2px] transition-colors first:mt-1',
                      hasActiveChild
                        ? 'text-red dark:text-red-eyebrow'
                        : 'text-steel/70 hover:text-near-black dark:text-white/30 dark:hover:text-white/70'
                    )}
                  >
                    <span className="truncate">{group.section}</span>
                    <ChevronDown
                      size={12}
                      className={cn('shrink-0 transition-transform duration-fast', !isOpen && '-rotate-90')}
                    />
                  </button>
                )}

                {isOpen && (
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      const link = (
                        <Link
                          href={item.href}
                          onClick={onCloseMobile}
                          aria-current={isActive ? 'page' : undefined}
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
                )}
              </div>
            );
          })}
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
