/**
 * Design token contract — Sprint 7 (Premium Admin UI Foundation).
 *
 * This file is documentation, not runtime config (the actual Tailwind
 * values live in tailwind.config.ts). It exists so every future component
 * reaches for the SAME semantic token instead of re-deriving a similar
 * one — the exact problem Sprint 2.5's audit found in the public site
 * (90 near-duplicate type curves, 77 shadow values, ~30 ad hoc alphas).
 *
 * Rule: if you need a new visual value, check here first. If it's not
 * here, it probably shouldn't be invented ad hoc — extend this file and
 * tailwind.config.ts together, in the same change.
 */

export const elevation = {
  flat: 'shadow-elevation-flat dark:shadow-elevation-dark-flat',
  raised: 'shadow-elevation-raised dark:shadow-elevation-dark-raised',
  floating: 'shadow-elevation-floating dark:shadow-elevation-dark-floating',
  overlay: 'shadow-elevation-overlay dark:shadow-elevation-dark-overlay',
} as const;

/** Surface = background layer. Use the lowest layer that satisfies contrast. */
export const surface = {
  base: 'bg-white dark:bg-surface-dark',
  subtle: 'bg-mist dark:bg-surface-dark-subtle',
  raised: 'bg-white dark:bg-surface-dark-raised',
  overlay: 'bg-white dark:bg-surface-dark-overlay',
  glass: 'bg-white/70 dark:bg-surface-dark-raised/70 backdrop-blur-glass',
} as const;

export const border = {
  DEFAULT: 'border-border dark:border-white/10',
  subtle: 'border-border/60 dark:border-white/[.06]',
  strong: 'border-near-black/15 dark:border-white/20',
} as const;

/** Semantic color roles — never use raw hex for status/meaning, use these. */
export const semantic = {
  success: { text: 'text-success', bg: 'bg-success-soft', border: 'border-success-border' },
  warning: { text: 'text-warning', bg: 'bg-warning-soft', border: 'border-warning-border' },
  info: { text: 'text-info', bg: 'bg-info-soft', border: 'border-info-border' },
  danger: { text: 'text-danger', bg: 'bg-danger-soft', border: 'border-danger-border' },
  ai: { text: 'text-ai', bg: 'bg-ai-soft', border: 'border-ai-border' },
  orange: { text: 'text-orange', bg: 'bg-orange-soft', border: 'border-orange-border' },
} as const;

export type SemanticTone = keyof typeof semantic;

/** Radius scale — sharp/soft are the brand's industrial hairline radii
 * (mirrors the public site); md/lg/xl/2xl are admin-only, used for
 * larger surfaces (cards, modals, popovers) where a harder edge would
 * feel out of place next to Linear/Vercel-style premium surfaces. */
export const radius = {
  control: 'rounded-soft', // buttons, inputs, badges
  card: 'rounded-lg',
  panel: 'rounded-xl',
  modal: 'rounded-2xl',
} as const;

export const motion = {
  fast: 'transition-all duration-fast ease-premium',
  base: 'transition-all duration-base ease-premium',
  slow: 'transition-all duration-slow ease-premium',
  springy: 'transition-all duration-base ease-snappy',
} as const;

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-dark';
