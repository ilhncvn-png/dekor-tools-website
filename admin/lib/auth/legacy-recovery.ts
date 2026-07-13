/**
 * TEMPORARY legacy-recovery authentication — active while
 * CMS_DATABASE_AUTH_ENABLED is false (the default). It exists purely to
 * restore access to the live admin without requiring the not-yet-provisioned
 * production Postgres/Blob/AUTH_SECRET variables. Remove once real
 * database-backed auth is enabled and verified.
 *
 * Deliberately dependency-free of argon2, Prisma, and next/headers so it is
 * safe to import from Edge middleware. Password *verification* (argon2)
 * happens only in the Node-runtime Server Action; middleware and this module
 * only sign/verify the resulting session cookie with Web Crypto HMAC.
 *
 * Signing key: the LEGACY_ADMIN_PASSWORD_HASH itself. It is already a
 * high-entropy server-only secret, so reusing it as the HMAC key avoids
 * introducing yet another env var the operator must set. A cookie forged
 * without knowing the hash cannot be produced, and the hash is never sent to
 * the client.
 */

const LEGACY_MARKER = 'decor-legacy-recovery-v1';
const LEGACY_SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8h, matches the DB session lifetime

export interface LegacyRecoveryConfig {
  email: string;
  passwordHash: string;
}

/** Returns the configured recovery credentials, or null if not fully set (fail-closed). */
export function getLegacyRecoveryConfig(): LegacyRecoveryConfig | null {
  const email = process.env.LEGACY_ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.LEGACY_ADMIN_PASSWORD_HASH?.trim();
  if (!email || !passwordHash) return null;
  return { email, passwordHash };
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signLegacyToken(passwordHash: string): Promise<string> {
  const encoder = new TextEncoder();
  const payload = JSON.stringify({ m: LEGACY_MARKER, exp: Math.floor(Date.now() / 1000) + LEGACY_SESSION_DURATION_SECONDS });
  const payloadB64 = base64UrlEncode(encoder.encode(payload));
  const key = await getHmacKey(passwordHash);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  return `${payloadB64}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Verifies signature + expiry against the configured hash. Returns false for any tampering/expiry/misconfig. */
export async function verifyLegacyToken(token: string | undefined, passwordHash: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const key = await getHmacKey(passwordHash);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  if (!timingSafeEqual(new Uint8Array(expected), base64UrlDecode(signatureB64))) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as { m?: string; exp?: number };
    if (payload.m !== LEGACY_MARKER) return false;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export const LEGACY_SESSION_MAX_AGE = LEGACY_SESSION_DURATION_SECONDS;
