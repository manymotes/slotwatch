import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'paused',
]);

// ── Tables ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status'),
  flyMachineId: text('fly_machine_id'),
  flyMachineUrl: text('fly_machine_url'),
  instanceSecret: text('instance_secret'),
  encryptedRefreshToken: text('encrypted_refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  canceledAt: timestamp('canceled_at'),
});

export const oauthStates = pgTable('oauth_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  state: text('state').notNull(),
  codeVerifier: text('code_verifier').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// ── DB client ─────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const queryClient = postgres(connectionString);
export const db = drizzle(queryClient);

// ── Encryption helpers ────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error('ENCRYPTION_KEY environment variable is required');
  // Accept a 64-char hex string (32 bytes) or a 32-char raw string
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  const buf = Buffer.from(raw, 'utf8');
  if (buf.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must be 32 bytes (raw) or 64 hex characters',
    );
  }
  return buf;
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * Output format (base64): <iv(12)><tag(16)><ciphertext>
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts a value produced by {@link encrypt}.
 */
export function decrypt(encoded: string): string {
  const key = getKey();
  const data = Buffer.from(encoded, 'base64');

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
