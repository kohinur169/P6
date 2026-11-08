/**
 * Maverick Acquiring Processor Adapter — Template
 * Path (in coding repo): lib/payments/adapters/maverick/maverick-adapter.ts
 * Owner: STEP 255-258
 * Language: TypeScript (strict mode)
 * Status: TEMPLATE — fill official Maverick API details after reading docs in coding session
 */

import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// 1. CONFIGURATION & ENVIRONMENT
// ============================================================================

export const MAVERICK_ENV_CONFIG = {
  sandbox: {
    baseUrl: 'https://sandbox.api.maverickpay.com', // VERIFY from Maverick docs
    version: 'v1',
  },
  production: {
    baseUrl: 'https://api.maverickpay.com', // VERIFY from Maverick docs
    version: 'v1',
  },
} as const;

export interface MaverickCredentials {
  clientId: string;         // From Maverick merchant dashboard
  clientSecret: string;     // From Maverick merchant dashboard
  merchantId: string;       // Maverick merchant identifier
  subMerchantId?: string;   // After sub-merchant provisioning
  webhookSecret: string;    // For webhook signature verification
  environment: 'sandbox' | 'production';
  accessToken?: string;     // OAuth access token (if Maverick uses OAuth)
  accessTokenExpiresAt?: Date;
}

// ============================================================================
// 2. ZOD VALIDATION SCHEMAS (Maverick request/response)
// ============================================================================

export const MaverickPaymentRequestSchema = z.object({
  amount: z.number().positive(), // USD, numeric(18,4) equivalent
  currency: z.string().default('USD'),
  paymentToken: z.string(),      // Token from Maverick hosted fields
  customerEmail: z.string().email(),
  customerIp: z.string().optional(),
  idempotencyKey: z.string().uuid(),
  orderReference: z.string().optional(),
  description: z.string().optional(),
  require3ds: z.boolean().default(true),
  billing: z.object({
    firstName: z.string(),
    lastName: z.string(),
    addressLine1: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

export type MaverickPaymentRequest = z.infer<typeof MaverickPaymentRequestSchema>;

export const MaverickPaymentResponseSchema = z.object({
  transactionReference: z.string(),
  status: z.enum(['pending', 'authorized', 'captured', 'settled', 'failed', 'voided', 'refunded']),
  amount: z.number(),
  currency: z.string(),
  authorizationCode: z.string().optional(),
  avsResponse: z.string().optional(),
  cvvResponse: z.string().optional(),
  redirectUrl: z.string().optional(), // For 3D Secure redirect
  actionRequired: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type MaverickPaymentResponse = z.infer<typeof MaverickPaymentResponseSchema>;

export const MaverickRefundRequestSchema = z.object({
  transactionReference: z.string(),
  amount: z.number().positive(),
  reason: z.string().optional(),
  idempotencyKey: z.string().uuid(),
});

export type MaverickRefundRequest = z.infer<typeof MaverickRefundRequestSchema>;

export const MaverickRefundResponseSchema = z.object({
  refundReference: z.string(),
  transactionReference: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  amount: z.number(),
  createdAt: z.string().datetime(),
});

export type MaverickRefundResponse = z.infer<typeof MaverickRefundResponseSchema>;

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
// 4. HMAC SIGNATURE VERIFICATION (Maverick Webhooks)
// ============================================================================

export function verifyMaverickWebhookSignature(
  body: Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;
  // Maverick may use HMAC-SHA256 or custom signature — VERIFY from docs
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(signatureHeader, 'utf8'));
}

// ============================================================================
// 5. MAVERICK ADAPTER CLASS
// ============================================================================

export class MaverickAdapter {
  private credentials: MaverickCredentials;
  private baseUrl: string;

  constructor(credentials: MaverickCredentials) {
    this.credentials = credentials;
    this.baseUrl = MAVERICK_ENV_CONFIG[credentials.environment].baseUrl;
  }

  /**
   * Test connection to Maverick API
   * Required before enabling processor (FEATURE_LIST Section 6)
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // VERIFY endpoint from Maverick docs
      const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return { success: true, message: 'Maverick connection test successful' };
      }
      return { success: false, message: `Maverick connection test failed: ${response.status}` };
    } catch (error) {
      return { success: false, message: `Maverick connection test error: ${(error as Error).message}` };
    }
  }

  /**
   * Create sub-merchant account under Maverick master account
   * (STEP 258 — sub-merchant provisioning)
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
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
  }): Promise<{
    subMerchantId: string;
    status: 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected';
    capabilities: string[];
    onboardUrl?: string;
  }> {
    // VERIFY request format from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/merchants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
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
        owner: {
          first_name: data.ownerFirstName,
          last_name: data.ownerLastName,
          email: data.ownerEmail,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick sub-merchant creation failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return {
      subMerchantId: result.merchant_id || result.id || result.sub_merchant_id,
      status: this.mapMaverickStatus(result.status),
      capabilities: result.capabilities || [],
      onboardUrl: result.onboard_url || result.onboardingUrl || result.redirect_url,
    };
  }

  /**
   * Process payment (sale/authorization/capture/refund/void)
   * (STEP 257 — payment acceptance)
   */
  async processPayment(request: MaverickPaymentRequest): Promise<MaverickPaymentResponse> {
    const validated = MaverickPaymentRequestSchema.parse(request);

    // VERIFY endpoint from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': validated.idempotencyKey,
      },
      body: JSON.stringify({
        amount: validated.amount,
        currency: validated.currency,
        payment_token: validated.paymentToken,
        customer_email: validated.customerEmail,
        customer_ip: validated.customerIp,
        order_reference: validated.orderReference,
        description: validated.description,
        require_3ds: validated.require3ds,
        billing: validated.billing,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick payment failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return MaverickPaymentResponseSchema.parse({
      transactionReference: result.transaction_reference || result.id,
      status: this.mapMaverickTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      authorizationCode: result.authorization_code || result.auth_code,
      avsResponse: result.avs_response,
      cvvResponse: result.cvv_response,
      redirectUrl: result.redirect_url || result.action_url,
      actionRequired: result.action_required || false,
      createdAt: result.created_at || result.createdAt,
    });
  }

  /**
   * Capture authorized payment
   */
  async capturePayment(transactionReference: string, amount?: number): Promise<MaverickPaymentResponse> {
    // VERIFY endpoint from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/payments/${transactionReference}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: amount ? JSON.stringify({ amount }) : '{}',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick capture failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return MaverickPaymentResponseSchema.parse({
      transactionReference: result.transaction_reference || transactionReference,
      status: this.mapMaverickTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  /**
   * Refund a payment
   */
  async refundPayment(request: MaverickRefundRequest): Promise<MaverickRefundResponse> {
    const validated = MaverickRefundRequestSchema.parse(request);

    // VERIFY endpoint from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': validated.idempotencyKey,
      },
      body: JSON.stringify({
        transaction_reference: validated.transactionReference,
        amount: validated.amount,
        reason: validated.reason,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick refund failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return MaverickRefundResponseSchema.parse({
      refundReference: result.refund_reference || result.id,
      transactionReference: result.transaction_reference,
      status: this.mapMaverickRefundStatus(result.status),
      amount: result.amount,
      createdAt: result.created_at,
    });
  }

  /**
   * Void a payment (before capture)
   */
  async voidPayment(transactionReference: string): Promise<MaverickPaymentResponse> {
    // VERIFY endpoint from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/payments/${transactionReference}/void`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick void failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return MaverickPaymentResponseSchema.parse({
      transactionReference: result.transaction_reference || transactionReference,
      status: 'voided',
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionReference: string): Promise<MaverickPaymentResponse> {
    // VERIFY endpoint from Maverick docs
    const response = await fetch(`${this.baseUrl}/${MAVERICK_ENV_CONFIG.sandbox.version}/payments/${transactionReference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.credentials.clientId}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Maverick get status failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    return MaverickPaymentResponseSchema.parse({
      transactionReference: result.transaction_reference || result.id,
      status: this.mapMaverickTransactionStatus(result.status),
      amount: result.amount,
      currency: result.currency,
      createdAt: result.created_at,
    });
  }

  // ============================================================================
  // 6. STATUS MAPPING (Maverick -> Platform standard)
  // ============================================================================

  private mapMaverickStatus(status: string): 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected' {
    const map: Record<string, 'pending' | 'action_required' | 'verified' | 'restricted' | 'rejected'> = {
      pending: 'pending',
      action_required: 'action_required',
      verified: 'verified',
      restricted: 'restricted',
      rejected: 'rejected',
      approved: 'verified',
      suspended: 'restricted',
      under_review: 'action_required',
    };
    return map[status.toLowerCase()] || 'pending';
  }

  private mapMaverickTransactionStatus(status: string): 'pending' | 'authorized' | 'captured' | 'settled' | 'failed' | 'voided' | 'refunded' {
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

  private mapMaverickRefundStatus(status: string): 'pending' | 'completed' | 'failed' {
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
    // VERIFY secret from Maverick dashboard
    if (!verifyMaverickWebhookSignature(body, signature, this.credentials.webhookSecret)) {
      throw new Error('Invalid Maverick webhook signature');
    }

    const payload = JSON.parse(body.toString('utf8'));

    // Map Maverick webhook event to platform standard
    const eventType = payload.event_type || payload.type || 'unknown';
    const transactionId = payload.transaction_id || payload.transaction_reference || payload.id;
    const status = this.mapMaverickTransactionStatus(payload.status || 'pending');

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
