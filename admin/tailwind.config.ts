import type { Config } from 'tailwindcss';

/**
 * Dekor Control Center — Tailwind theme (Sprint 7: Premium Admin UI Foundation).
 *
 * Base brand values (near-black/mist/red/blue family) still mirror
 * ../src/styles/tokens.ts (Sprint 4) — see that file's own header comment
 * for why they're copied rather than imported (separate standalone app).
 *
 * Sprint 7 adds a full ADMIN-ONLY design-token layer on top of that base:
 * semantic colors (success/warning/info/danger/ai/orange), an elevation
 * system (flat/raised/floating/overlay + dark variants), glass-surface
 * tokens, a refined radius scale, a calmer type scale, and the motion
 * keyframes used by the new UI primitives (skeleton shimmer, spinner,
 * toast enter/exit). None of this touches the public site's frozen
 * visual system (project/*.dc.html) — it only extends this standalone
 * admin app's own theme.
 *
 * See lib/design-tokens.ts for the semantic-role documentation (which
 * token to reach for, and why) — this file is the mechanical Tailwind
 * config; that file is the human-readable contract.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand base — mirrors src/styles/tokens.ts `colors`
        'near-black': '#0E0F11',
        charcoal: '#1A1C1F',
        panel: '#16181b',
        'footer-bg': '#0a0b0c',
        mist: '#F4F5F6',
        concrete: '#E6E8EB',
        border: '#E2E5E9',
        steel: '#5A6066',
        muted: '#8A9097',
        red: '#D32027',
        'red-eyebrow': '#ff7a72',
        blue: '#0095DA',

        // admin-only: dark/light surface scale for the shell chrome
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#F4F5F6',
          raised: '#ffffff',
          dark: '#0E0F11',
          'dark-subtle': '#16181b',
          'dark-raised': '#1A1C1F',
          'dark-overlay': '#1f2226',
        },

        // admin-only: semantic color roles (Sprint 7 Step 10). Each has a
        // DEFAULT (icon/text-safe accent), a `soft` background tint usable
        // in both themes, and a `border` tone for badges/alerts.
        success: { DEFAULT: '#1F8A5B', soft: 'rgba(31,138,91,.12)', border: 'rgba(31,138,91,.28)' },
        warning: { DEFAULT: '#B8851F', soft: 'rgba(184,133,31,.12)', border: 'rgba(184,133,31,.28)' },
        info: { DEFAULT: '#0095DA', soft: 'rgba(0,149,218,.12)', border: 'rgba(0,149,218,.28)' },
        danger: { DEFAULT: '#D32027', soft: 'rgba(211,32,39,.12)', border: 'rgba(211,32,39,.28)' },
        ai: { DEFAULT: '#7C5CFF', soft: 'rgba(124,92,255,.14)', border: 'rgba(124,92,255,.3)' },
        orange: { DEFAULT: '#E0692A', soft: 'rgba(224,105,42,.12)', border: 'rgba(224,105,42,.28)' },
      },
      // References the next/font CSS variables set on <html> in
      // app/layout.tsx (`--font-geist-sans` / `--font-geist-mono`) —
      // NOT the literal family name. Referencing the literal name was the
      // Sprint 7 bug: next/font hashes/scopes the real @font-face name
      // internally, so a hardcoded 'Archivo' string never actually matched
      // it and the browser silently fell back to system sans-serif.
      fontFamily: {
        display: ['var(--font-geist-sans)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      // Type scale (Sprint 7 Step 8, refined again for the Geist switch) —
      // replaces ad hoc per-component font sizes. Line-heights chosen for
      // readability at small admin-UI sizes, not the public site's
      // editorial scale.
      fontSize: {
        eyebrow: ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.55' }],
        body: ['14px', { lineHeight: '1.6' }],
        'body-lg': ['15.5px', { lineHeight: '1.6' }],
        'heading-sm': ['15px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-lg': ['22px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '650' }],
        'heading-xl': ['28px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading-2xl': ['34px', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      borderRadius: {
        sharp: '2px',
        soft: '3px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        // Elevation system — flat/raised/floating/overlay, light + dark
        'elevation-flat': '0 1px 2px rgba(14,15,17,.04)',
        'elevation-raised': '0 4px 14px rgba(14,15,17,.06), 0 1px 2px rgba(14,15,17,.05)',
        'elevation-floating': '0 16px 44px rgba(14,15,17,.10), 0 2px 8px rgba(14,15,17,.06)',
        'elevation-overlay': '0 26px 64px rgba(14,15,17,.16), 0 4px 12px rgba(14,15,17,.08)',
        'elevation-dark-flat': '0 1px 2px rgba(0,0,0,.4)',
        'elevation-dark-raised': '0 4px 14px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.3)',
        'elevation-dark-floating': '0 16px 44px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3)',
        'elevation-dark-overlay': '0 26px 64px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.35)',
        // legacy aliases kept for backward compatibility with Sprint 5 code
        'elevation-sm': '0 10px 34px rgba(0,0,0,.08)',
        'elevation-md': '0 16px 44px rgba(0,0,0,.12)',
        'elevation-lg': '0 26px 64px rgba(0,0,0,.16)',
        'elevation-dark-sm': '0 10px 34px rgba(0,0,0,.35)',
        'elevation-dark-lg': '0 26px 64px rgba(0,0,0,.55)',
        // interactive glows
        'glow-red': '0 0 0 3px rgba(211,32,39,.14)',
        'glow-ai': '0 0 0 3px rgba(124,92,255,.16)',
        'focus-red': '0 0 0 3px rgba(211,32,39,.18)',
      },
      backdropBlur: {
        glass: '16px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        base: '220ms',
        slow: '360ms',
        slower: '480ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(.2,.7,.2,1)',
        snappy: 'cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'spin-smooth': {
          to: { transform: 'rotate(360deg)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'spin-smooth': 'spin-smooth 0.8s linear infinite',
        'toast-in': 'toast-in 0.22s cubic-bezier(.2,.7,.2,1)',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(.4,0,.6,1) infinite',
      },
      screens: {
        tablet: '768px',
        laptop: '1024px',
        desktop: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
