'use client';

/**
 * Lightweight dark/light theme provider — no external dependency.
 *
 * Dekor Control Center is dark-mode-first (docs/architecture/04_..., the
 * user's Sprint 5 instructions) with light mode supported. A dedicated
 * package (e.g. next-themes) was deliberately not added here — this is a
 * small enough concern that a plain context + localStorage +
 * `prefers-color-scheme` fallback avoids installing a package for
 * something ~40 lines can do, per
 * docs/engineering/02_ENGINEERING_STANDARDS.md's "avoid over-engineering"
 * principle. The blocking inline script in app/layout.tsx (see
 * `themeInitScript` below) prevents a flash of the wrong theme on load.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'dcc-theme';

/**
 * Inlined into <head> via a plain <script> tag (not a React component) so
 * it runs before hydration and the correct theme class is already present
 * on <html> at first paint — this is what prevents the flash.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Dark-mode-first: default to 'dark' rather than deferring to system
  // preference, per this sprint's explicit "dark mode first" instruction.
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    }
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
