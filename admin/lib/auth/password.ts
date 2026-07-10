import argon2 from 'argon2';

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(passwordHash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, plainPassword);
  } catch {
    // argon2.verify throws on a malformed hash rather than returning false —
    // normalize to false so callers never need to try/catch a login check.
    return false;
  }
}
