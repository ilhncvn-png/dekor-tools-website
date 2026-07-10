'use client';

/**
 * Decor Control Center login form — the actual interactive UI, rendered
 * by app/page.tsx (a Server Component so it can own the `dynamic =
 * 'force-dynamic'` route segment config; Next.js only reads that config
 * from Server Component page/layout files, not from a 'use client' file,
 * which is why this logic was split out of page.tsx rather than staying
 * there directly — same behavior, same design, just moved).
 *
 * Real server-verified authentication: submits to the `login` Server
 * Action (lib/actions/auth-actions.ts), which checks the password against
 * an Argon2 hash in Postgres and, on success, sets a signed HttpOnly
 * session cookie itself — this component never sees or sets the cookie.
 */

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions/auth-actions';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/genel-bakis');
        router.refresh();
      } else {
        setError(true);
      }
    } finally {
      setSubmitting(false);
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
              disabled={submitting}
              className="mt-1 h-11 rounded-soft bg-blue font-medium text-white transition-[filter] duration-fast hover:brightness-110 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
