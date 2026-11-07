/**
 * AES-256-GCM Encryption Utility for Shopify App
 * File: src/lib/encryption.ts
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

// ENCRYPTION_MASTER_KEY must be 32 bytes, base64 encoded
const KEY = Buffer.from(process.env.ENCRYPTION_MASTER_KEY!, 'base64');

if (KEY.length !== 32) {
  throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes when base64 decoded');
}

/**
 * Encrypt a plaintext string.
 * Returns base64(iv + authTag + ciphertext)
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypt a base64-encoded ciphertext produced by encrypt().
 */
export function decrypt(ciphertextBase64: string): string {
  const data = Buffer.from(ciphertextBase64, 'base64');

  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Ciphertext too short');
  }

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
