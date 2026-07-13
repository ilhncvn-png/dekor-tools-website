import bcrypt from 'bcryptjs';

// bcryptjs (pure JavaScript) rather than a native module like argon2. On
// Vercel, Next.js bundles Server Actions and RSC renders into separate
// serverless functions, and a native module's compiled .node binary is not
// reliably traced into the Server Action bundle — which caused the login
// action to 500 in production while the page still rendered. A pure-JS hash
// has no binary to trace, so it works in every bundle/runtime. bcrypt was an
// explicitly approved option in the auth spec.
const BCRYPT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

export async function verifyPassword(passwordHash: string, plainPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, passwordHash);
  } catch {
    // Normalize a malformed-hash throw to false so callers never need to
    // try/catch a login check.
    return false;
  }
}
