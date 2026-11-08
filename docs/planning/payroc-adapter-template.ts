/**
 * Payroc Acquiring Processor Adapter — Template
 * Path (in coding repo): lib/payments/adapters/payroc/payroc-adapter.ts
 * Owner: STEP 251-254
 * Language: TypeScript (strict mode)
 * Status: TEMPLATE — fill official Payroc API details after reading docs.nmi.com-equivalent Payroc docs in coding session
 */

import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// 1. CONFIGURATION & ENVIRONMENT
// ============================================================================

export const PAYROC_ENV_CONFIG = {
  sandbox: {
    baseUrl: 'https://sandbox.api.payroc.com', // VERIFY from Payroc docs
    version: 'v1',
  },
  production: {
    baseUrl: 'https://api.payroc.com', // VERIFY from Payroc docs
    version: 'v1',
  },
} as const;

export interface PayrocCredentials {
  apiKey: string;           // From Payroc merchant dashboard
  apiSecret: string;        // From Payroc merchant dashboard
  merchantId: string;       // Payroc merchant identifier
  subMerchantId?: string;   // After sub-merchant provisioning
  webhookSecret: string;    // For webhook signature verification
  environment: 'sandbox' | 'production';
}

// ============================================================================
// 2. ZOD VALIDATION SCHEMAS (Payroc request/response)
// ============================================================================

export const PayrocPaymentRequestSchema = z.object({
  amount: z.number().positive(), // USD, numeric(18,4) equivalent
  currency: z.string().default('USD'),
  paymentMethodToken: z.string(), // Token from Payroc hosted fields (Collect.js equivalent)
  customerEmail: z.string().email(),
  customerIp: z.string().optional(),
  idempotencyKey: z.string().uuid(),
  orderId: z.string().optional(),
  description: z.string().optional(),
  threeDsRequired: z.boolean().default(true),
  billingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

export type PayrocPaymentRequest = z.infer<typeof PayrocPaymentRequestSchema>;

export const PayrocPaymentResponseSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['pending', 'authorized', 'captured', 'settled', 'failed', 'voided', 'refunded']),
  amount: z.number(),
  currency: z.string(),
  authCode: z.string().optional(),
  avsResult: z.string().optional(),
  cvvResult: z.string().optional(),
  threeDsUrl: z.string().optional(), // Redirect URL for 3D Secure
  requiresAction: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type PayrocPaymentResponse = z.infer<typeof PayrocPaymentResponseSchema>;

export const PayrocRefundRequestSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive(),
  reason: z.string().optional(),
  idempotencyKey: z.string().uuid(),
});

export type PayrocRefundRequest = z.infer<typeof PayrocRefundRequestSchema>;

export const PayrocRefundResponseSchema = z.object({
  refundId: z.string(),
  transactionId: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  amount: z.number(),
  createdAt: z.string().datetime(),
});

export type PayrocRefundResponse = z.infer<typeof PayrocRefundResponseSchema>;

// ============================================================================
// 3. ENCRYPTION UTILITY (AES-256-GCM)
// ============================================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_MASTER_KEY;
  if (!keyBase64) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
  }
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes when base64 decoded');
  }
  return key;
}

export function encryptCredential(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptCredential(ciphertextBase64: string): string {
  const data = Buffer.from(ciphertextBase64, 'base64');
  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Ciphertext too short');
  }
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

// ============================================================================
// 4. HMAC SIGNATURE VERIFICATION (Payroc Webhooks)
// ============================================================================

export function verifyPayrocWebhookSignature(
  body: Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;
  // Payroc may use HMAC-SHA256 or HMAC-SHA512 — VERIFY from docs
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(signatureHeader, 'utf8'));
}

// ============================================================================
// 5. PAYROC ADAPTER CLASS
// ============================================================================

export class PayrocAdapter {
  private credentials: PayrocCredentials;
  private baseUrl: string;

  constructor(credentials: PayrocCredentials) {
    this.credentials = credentials;
    this.baseUrl = PAYROC_ENV_CONFIG[credentials.environment].baseUrl;
  }

  /**
   * Test connection to Payroc API
   * Required before enabling processor (FEATURE_LIST Section 6)
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // VERIFY endpoint from Payroc docs
      const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return { success: true, message: 'Payroc connection test successful' };
      }
      return { success: false, message: `Payroc connection test failed: ${response.status}` };
    } catch (error) {
      return { success: false, message: `Payroc connection test error: ${(error as Error).message}` };
    }
  }

  /**
   * Create sub-merchant account under Payroc master account
   * (STEP 254 — sub-merchant provisioning)
   */
  async createSubMerchant(data: {
    businessName: string;
    businessEmail: string;
    businessAddress: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    taxId: string;
    website?: string;
    mcc?: string;
  }): Promise<{
    subMerchantId: string;
    status: 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected';
    capabilities: string[];
    onboardUrl?: string;
  }> {
    // VERIFY request format from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/merchants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        business_name: data.businessName,
        email: data.businessEmail,
        address: data.businessAddress,
        tax_id: data.taxId,
        website: data.website,
        mcc: data.mcc,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc sub-merchant creation failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    // Map Payroc status to platform standard status
    return {
      subMerchantId: result.merchant_id || result.id,
      status: this.mapPayrocStatus(result.status),
      capabilities: result.capabilities || [],
      onboardUrl: result.onboard_url || result.onboardingUrl,
    };
  }

  /**
   * Process payment (sale/authorization/capture/refund/void)
   * (STEP 253 — payment acceptance)
   */
  async processPayment(request: PayrocPaymentRequest): Promise<PayrocPaymentResponse> {
    const validated = PayrocPaymentRequestSchema.parse(request);

    // VERIFY endpoint from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': validated.idempotencyKey,
      },
      body: JSON.stringify({
        amount: validated.amount,
        currency: validated.currency,
        payment_method_token: validated.paymentMethodToken,
        customer_email: validated.customerEmail,
        customer_ip: validated.customerIp,
        description: validated.description,
        three_ds_required: validated.threeDsRequired,
        billing_address: validated.billingAddress,
        shipping_address: validated.shippingAddress,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc payment failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return PayrocPaymentResponseSchema.parse({
      transactionId: result.transaction_id || result.id,
      status: this.mapPayrocTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      authCode: result.auth_code,
      avsResult: result.avs_result,
      cvvResult: result.cvv_result,
      threeDsUrl: result.three_ds_url || result.action_url,
      requiresAction: result.requires_action || false,
      createdAt: result.created_at || result.createdAt,
    });
  }

  /**
   * Capture authorized payment
   */
  async capturePayment(transactionId: string, amount?: number): Promise<PayrocPaymentResponse> {
    // VERIFY endpoint from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/transactions/${transactionId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: amount ? JSON.stringify({ amount }) : '{}',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc capture failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return PayrocPaymentResponseSchema.parse({
      transactionId: result.transaction_id || transactionId,
      status: this.mapPayrocTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  /**
   * Refund a payment
   */
  async refundPayment(request: PayrocRefundRequest): Promise<PayrocRefundResponse> {
    const validated = PayrocRefundRequestSchema.parse(request);

    // VERIFY endpoint from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': validated.idempotencyKey,
      },
      body: JSON.stringify({
        transaction_id: validated.transactionId,
        amount: validated.amount,
        reason: validated.reason,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc refund failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return PayrocRefundResponseSchema.parse({
      refundId: result.refund_id || result.id,
      transactionId: result.transaction_id,
      status: this.mapPayrocRefundStatus(result.status),
      amount: result.amount,
      createdAt: result.created_at,
    });
  }

  /**
   * Void a payment (before capture)
   */
  async voidPayment(transactionId: string): Promise<PayrocPaymentResponse> {
    // VERIFY endpoint from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/transactions/${transactionId}/void`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc void failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return PayrocPaymentResponseSchema.parse({
      transactionId: result.transaction_id || transactionId,
      status: 'voided',
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<PayrocPaymentResponse> {
    // VERIFY endpoint from Payroc docs
    const response = await fetch(`${this.baseUrl}/${PAYROC_ENV_CONFIG.sandbox.version}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Payroc get status failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return PayrocPaymentResponseSchema.parse({
      transactionId: result.transaction_id || result.id,
      status: this.mapPayrocTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  // ============================================================================
  // 6. STATUS MAPPING (Payroc -> Platform standard)
  // ============================================================================

  private mapPayrocStatus(status: string): 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected' {
    const map: Record<string, 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected'> = {
      pending: 'pending',
      action_required: 'action_required',
      verified: 'verified',
      restricted: 'restricted',
      rejected: 'rejected',
      approved: 'verified',
      suspended: 'restricted',
    };
    return map[status.toLowerCase()] || 'pending';
  }

  private mapPayrocTransactionStatus(status: string): 'pending' | 'authorized' | 'captured' | 'settled' | 'failed' | 'voided' | 'refunded' {
    const map: Record<string, 'pending' | 'authorized' | 'captured' | 'settled' | 'failed' | 'voided' | 'refunded'> = {
      pending: 'pending',
      authorized: 'authorized',
      captured: 'captured',
      settled: 'settled',
      failed: 'failed',
      voided: 'voided',
      refunded: 'refunded',
      approved: 'authorized',
      completed: 'captured',
    };
    return map[status.toLowerCase()] || 'pending';
  }

  private mapPayrocRefundStatus(status: string): 'pending' | 'completed' | 'failed' {
    const map: Record<string, 'pending' | 'completed' | 'failed'> = {
      pending: 'pending',
      completed: 'completed',
      failed: 'failed',
      approved: 'completed',
    };
    return map[status.toLowerCase()] || 'pending';
  }

  // ============================================================================
  // 7. WEBHOOK HANDLER (signature verified, idempotent)
  // ============================================================================

  async handleWebhook(body: Buffer, signature: string | undefined): Promise<{
    eventType: string;
    transactionId: string;
    status: string;
    processed: boolean;
  }> {
    // VERIFY secret from Payroc dashboard
    if (!verifyPayrocWebhookSignature(body, signature, this.credentials.webhookSecret)) {
      throw new Error('Invalid Payroc webhook signature');
    }

    const payload = JSON.parse(body.toString('utf8'));

    // Map Payroc webhook event to platform standard
    const eventType = payload.event_type || payload.type || 'unknown';
    const transactionId = payload.transaction_id || payload.id;
    const status = this.mapPayrocTransactionStatus(payload.status || 'pending');

    // Idempotency: check if already processed (platform-side dedupe)
    // VERIFY: platform should store processed webhook event IDs

    return {
      eventType,
      transactionId,
      status,
      processed: true,
    };
  }
}
