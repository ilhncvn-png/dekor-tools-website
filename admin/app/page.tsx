'use client';

/**
 * Root entry point (/) — Decor Control Center login gate.
 *
 * TEMPORARY STATIC-STAGING AUTH — NOT REAL AUTHENTICATION. No backend, no
 * database, no server-verified identity — see lib/auth.ts. The credential
 * check below is base64-obfuscated (not encrypted) purely to avoid a
 * literal plaintext password sitting in a git diff.
 *
 * middleware.ts is what actually protects every other route (redirects to
 * "/" server-side, before any protected page renders) and redirects away
 * from here to /genel-bakis if a valid session cookie already exists —
 * this page only needs to run the one-time legacy-key cleanup and handle
 * the login form itself.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE, LEGACY_SESSION_KEYS } from '@/lib/auth';

const EXPECTED = 'aWxobmN2bkBnbWFpbC5jb206RGVrb3JTdGFnaW5nMjAyNiE='; // base64("email:password")
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h — staging convenience only

export default function RootPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // One-time cleanup: this route is reached at all only when middleware
  // has already determined there's no valid decor_admin_session cookie
  // (otherwise it would have redirected to /genel-bakis before this page
  // ever rendered) — so any legacy key still present is stale and must
  // never be treated as a session. Never auto-logs the user in from it.
  useEffect(() => {
    LEGACY_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const attempt = typeof window !== 'undefined' ? btoa(`${email.trim()}:${password}`) : '';
    if (attempt === EXPECTED) {
      setError(false);
      document.cookie = `${SESSION_COOKIE_NAME}=${SESSION_COOKIE_VALUE}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
      router.push('/genel-bakis');
    } else {
      setError(true);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-near-black px-5 py-10 font-display">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,149,218,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,149,218,.07) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(120% 90% at 50% 40%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 40%, #000 30%, transparent 85%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-soft border border-white/[.08] bg-panel px-6 py-10 shadow-2xl tablet:px-10 tablet:py-12">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-blue" />

          <div className="mb-7 flex justify-center">
            <img src="/decor_logo_white.png" alt="Decor" className="h-10 w-auto" />
          </div>

          <h1 className="text-center text-heading-lg font-black tracking-tight text-white">Decor Control Center</h1>
          <p className="mt-2.5 text-center font-mono text-[11px] uppercase tracking-[2px] text-white/50">
            Website Management System
          </p>

          <div className="mx-auto mt-4.5 flex w-fit items-center gap-1.5 rounded-soft border border-red/35 px-2.5 py-1.5 font-mono text-[9.5px] tracking-[1px] text-red-eyebrow">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
            GEÇİCİ STAGING KORUMASI &middot; GERÇEK KİMLİK DOĞRULAMA DEĞİL
          </div>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" autoComplete="off">
            <div>
              <label htmlFor="email" className="mb-2 block font-mono text-[10px] uppercase tracking-[1.4px] text-white/55">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-soft border border-white/[.12] bg-near-black px-3 text-body-sm text-white transition-colors duration-fast placeholder:text-white/30 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/35"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block font-mono text-[10px] uppercase tracking-[1.4px] text-white/55">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-soft border border-white/[.12] bg-near-black px-3 text-body-sm text-white transition-colors duration-fast placeholder:text-white/30 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/35"
              />
            </div>

            {error && (
              <div className="rounded-soft border border-red/30 bg-red/10 px-3 py-2.5 font-mono text-[12px] text-red-eyebrow">
                Kullanıcı adı veya şifre hatalı.
              </div>
            )}

            <button
              type="submit"
              className="mt-1 h-11 rounded-soft bg-blue font-medium text-white transition-[filter] duration-fast hover:brightness-110 active:brightness-90"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
