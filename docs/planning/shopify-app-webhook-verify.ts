/**
 * Shopify Webhook Verification Utility
 * File: src/lib/webhook-verify.ts
 */

import crypto from 'crypto';

/**
 * Verify Shopify webhook HMAC-SHA256 signature.
 * Shopify sends signature in X-Shopify-Hmac-Sha256 header as base64.
 */
export function verifyShopifyWebhook(
  body: Buffer,
  hmacHeader: string | undefined,
  secret: string
): boolean {
  if (!hmacHeader) return false;

  const computed = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  return timingSafeEqualBase64(computed, hmacHeader);
}

/**
 * Constant-time comparison for base64 strings.
 */
function timingSafeEqualBase64(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return crypto.timingSafeEqual(bufA, bufB);
}
