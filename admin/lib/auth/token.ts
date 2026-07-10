/**
 * Signed, stateless session-token codec — deliberately built on Web Crypto
 * (`crypto.subtle`), not Node's `crypto` module, so the exact same code runs
 * in both:
 *  - Next.js Middleware (Edge runtime — no Prisma, no Node `crypto`, no DB
 *    access at all), where it's used for a fast, cheap "is this cookie a
 *    validly-signed, non-expired token" check before any page renders.
 *  - Server Actions / Route Handlers (Node runtime), where lib/auth/session.ts
 *    additionally looks the session up in the database — the authoritative
 *    check that catches revocation/logout-everywhere/disabled users, which a
 *    signature check alone can never catch. Per the migration spec: signed
 *    middleware check is necessary but not sufficient on its own.
 */

interface TokenPayload {
  sessionId: string;
  userId: string;
  exp: number; // unix seconds
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

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(encoder.encode(payloadJson));

  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));

  return `${payloadB64}.${signatureB64}`;
}

/** Verifies signature + expiry only. Does NOT check DB revocation or user status — see lib/auth/session.ts. */
export async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const key = await getHmacKey(secret);
  const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const providedSignature = base64UrlDecode(signatureB64);

  if (!timingSafeEqual(new Uint8Array(expectedSignature), providedSignature)) return null;

  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as TokenPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.sessionId !== 'string' || typeof payload.userId !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
