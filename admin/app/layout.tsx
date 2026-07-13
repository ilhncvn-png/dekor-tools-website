import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider';
import { ConditionalShell } from '@/components/layout/ConditionalShell';
import { ToastProvider } from '@/components/ui/Toast';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import './globals.css';

// Geist (self-hosted via the official `geist` package, no Google Fonts CDN
// dependency) — replaces Archivo/IBM Plex Mono for the admin only (the
// public site in project/ keeps its own frozen type system untouched).
// Root cause of the earlier "font quality" complaint: the previous
// tailwind.config.ts fontFamily entries referenced the literal family name
// ('Archivo') instead of the next/font CSS variable, so the self-hosted
// font was never actually applied — the browser silently fell back to a
// system sans-serif that doesn't render Turkish ğ/ş/ı with full polish.
// Geist's variable font has full Turkish/Latin-Extended coverage, so this
// also fixes that rendering gap.

export const metadata: Metadata = {
  title: 'Dekor Control Center',
  description: 'IC Corporate Platform — yönetim paneli.',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolves the current user via whichever auth mode is active (real
  // database session, or the temporary legacy-recovery session). Using
  // cookies() here automatically opts this layout into dynamic rendering,
  // so the result is never cached/shared across visitors.
  const user = await resolveCurrentUser();

  return (
    <html lang="tr" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevents a flash of the wrong theme before hydration. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-display">
        <ThemeProvider>
          <ToastProvider>
            <ConditionalShell user={user}>{children}</ConditionalShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
