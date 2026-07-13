#!/usr/bin/env node
/**
 * Generates an Argon2id hash for a password you choose, to set as
 * LEGACY_ADMIN_PASSWORD_HASH (temporary recovery login) or to seed a real
 * admin later. Contains NO password itself — you supply one at runtime, so
 * nothing sensitive is ever committed.
 *
 * Usage (password is read from stdin, never from argv, so it stays out of
 * your shell history and process list):
 *
 *   node scripts/hash-password.mjs
 *   # then type/paste the password and press Enter
 *
 * Paste the printed hash into Vercel as LEGACY_ADMIN_PASSWORD_HASH.
 */
import argon2 from 'argon2';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

process.stdout.write('Enter password to hash (input is read from stdin): ');

rl.on('line', async (line) => {
  const password = line.trim();
  if (password.length < 16) {
    console.error('\nRefusing: password must be at least 16 characters.');
    process.exit(1);
  }
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  console.log('\nLEGACY_ADMIN_PASSWORD_HASH=' + hash);
  rl.close();
});
