/**
 * Payment Provider Registry Update — Template
 * Path (in coding repo): lib/payments/registry.ts
 * Owner: STEP 128 (existing) + STEP 252/256 (new entries)
 * Language: TypeScript (strict mode)
 * Status: TEMPLATE — append Payroc and Maverick entries only
 */

import { PayrocAdapter } from './adapters/payroc/payroc-adapter';
import { MaverickAdapter } from './adapters/maverick/maverick-adapter';

// ============================================================================
// 1. PROVIDER CAPABILITY MATRIX
// ============================================================================

export interface ProviderCapability {
  name: string;
  displayName: string;
  provider: 'nmi' | 'payoneer' | 'rainforest' | 'stripe_connect' | 'airwallex' | 'payroc' | 'maverick';
  supportsCards: boolean;
  supportsEWallets: boolean;
  supportsSubMerchant: boolean;
  supports3DS: boolean;
  supportsRefunds: boolean;
  supportsVoid: boolean;
  supportsCapture: boolean;
  webhookEvents: string[];
  minTransactionAmount: number; // USD
  maxTransactionAmount: number; // USD
  settlementDays: number;
}

export const PROVIDER_CAPABILITY_MATRIX: ProviderCapability[] = [
  // Existing providers (DO NOT MODIFY)
  {
    name: 'nmi',
    displayName: 'NMI',
    provider: 'nmi',
    supportsCards: true,
    supportsEWallets: true,
    supportsSubMerchant: true,
    supports3DS: true,
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['transaction.created', 'transaction.updated', 'transaction.settled'],
    minTransactionAmount: 0,
    maxTransactionAmount: 10000,
    settlementDays: 2,
  },
  {
    name: 'payoneer',
    displayName: 'Payoneer',
    provider: 'payoneer',
    supportsCards: false,
    supportsEWallets: true,
    supportsSubMerchant: false,
    supports3DS: false,
    supportsRefunds: true,
    supportsVoid: false,
    supportsCapture: false,
    webhookEvents: ['payout.created', 'payout.completed'],
    minTransactionAmount: 0,
    maxTransactionAmount: 50000,
    settlementDays: 1,
  },
  {
    name: 'rainforest',
    displayName: 'Rainforest',
    provider: 'rainforest',
    supportsCards: true,
    supportsEWallets: true,
    supportsSubMerchant: true,
    supports3DS: true,
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['payment.created', 'payment.updated'],
    minTransactionAmount: 0,
    maxTransactionAmount: 10000,
    settlementDays: 2,
  },
  {
    name: 'stripe_connect',
    displayName: 'Stripe Connect',
    provider: 'stripe_connect',
    supportsCards: true,
    supportsEWallets: true,
    supportsSubMerchant: true,
    supports3DS: true,
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['payment_intent.created', 'payment_intent.succeeded', 'payment_intent.failed'],
    minTransactionAmount: 0,
    maxTransactionAmount: 50000,
    settlementDays: 2,
  },
  {
    name: 'airwallex',
    displayName: 'Airwallex',
    provider: 'airwallex',
    supportsCards: true,
    supportsEWallets: true,
    supportsSubMerchant: true,
    supports3DS: true,
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['payment.created', 'payment.updated', 'payout.created'],
    minTransactionAmount: 0,
    maxTransactionAmount: 50000,
    settlementDays: 1,
  },
  // NEW PROVIDERS (STEP 251-258)
  {
    name: 'payroc',
    displayName: 'Payroc',
    provider: 'payroc',
    supportsCards: true,
    supportsEWallets: true, // VERIFY from Payroc docs
    supportsSubMerchant: true,
    supports3DS: true, // VERIFY from Payroc docs
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['transaction.created', 'transaction.updated', 'refund.created'], // VERIFY
    minTransactionAmount: 0,
    maxTransactionAmount: 10000, // VERIFY from Payroc docs
    settlementDays: 2, // VERIFY from Payroc docs
  },
  {
    name: 'maverick',
    displayName: 'Maverick',
    provider: 'maverick',
    supportsCards: true,
    supportsEWallets: true, // VERIFY from Maverick docs
    supportsSubMerchant: true,
    supports3DS: true, // VERIFY from Maverick docs
    supportsRefunds: true,
    supportsVoid: true,
    supportsCapture: true,
    webhookEvents: ['payment.created', 'payment.updated', 'refund.created'], // VERIFY
    minTransactionAmount: 0,
    maxTransactionAmount: 10000, // VERIFY from Maverick docs
    settlementDays: 2, // VERIFY from Maverick docs
  },
];

// ============================================================================
// 2. ADAPTER REGISTRY
// ============================================================================

export interface PaymentAdapter {
  testConnection(): Promise<{ success: boolean; message: string }>;
  createSubMerchant(data: any): Promise<any>;
  processPayment(data: any): Promise<any>;
  capturePayment(transactionId: string, amount?: number): Promise<any>;
  refundPayment(data: any): Promise<any>;
  voidPayment(transactionId: string): Promise<any>;
  getPaymentStatus(transactionId: string): Promise<any>;
  handleWebhook(body: Buffer, signature: string | undefined): Promise<any>;
}

export class PaymentAdapterRegistry {
  private adapters: Map<string, PaymentAdapter> = new Map();

  register(provider: string, adapter: PaymentAdapter): void {
    if (this.adapters.has(provider)) {
      throw new Error(`Adapter already registered for provider: ${provider}`);
    }
    this.adapters.set(provider, adapter);
  }

  get(provider: string): PaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }
    return adapter;
  }

  has(provider: string): boolean {
    return this.adapters.has(provider);
  }

  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// ============================================================================
// 3. INITIALIZE REGISTRY (Call once at app startup)
// ============================================================================

export function initializePaymentRegistry(
  payrocCredentials: any,
  maverickCredentials: any
): PaymentAdapterRegistry {
  const registry = new PaymentAdapterRegistry();

  // Existing providers (DO NOT MODIFY — initialized elsewhere in STEP 147-169)
  // registry.register('nmi', new NMIAdapter(nmiCredentials));
  // registry.register('payoneer', new PayoneerAdapter(payoneerCredentials));
  // registry.register('rainforest', new RainforestAdapter(rainforestCredentials));
  // registry.register('stripe_connect', new StripeConnectAdapter(stripeCredentials));
  // registry.register('airwallex', new AirwallexAdapter(airwallexCredentials));

  // NEW PROVIDERS (STEP 252/256)
  registry.register('payroc', new PayrocAdapter(payrocCredentials));
  registry.register('maverick', new MaverickAdapter(maverickCredentials));

  return registry;
}

// ============================================================================
// 4. USAGE EXAMPLE (in coding session)
// ============================================================================

/*
import { initializePaymentRegistry } from './lib/payments/registry';

const registry = initializePaymentRegistry(
  {
    apiKey: process.env.PAYROC_API_KEY!,
    apiSecret: process.env.PAYROC_API_SECRET!,
    merchantId: process.env.PAYROC_MERCHANT_ID!,
    webhookSecret: process.env.PAYROC_WEBHOOK_SECRET!,
    environment: (process.env.PAYROC_ENV as 'sandbox' | 'production') || 'sandbox',
  },
  {
    clientId: process.env.MAVERICK_CLIENT_ID!,
    clientSecret: process.env.MAVERICK_CLIENT_SECRET!,
    merchantId: process.env.MAVERICK_MERCHANT_ID!,
    webhookSecret: process.env.MAVERICK_WEBHOOK_SECRET!,
    environment: (process.env.MAVERICK_ENV as 'sandbox' | 'production') || 'sandbox',
  }
);

// Test connection before enabling
const payrocTest = await registry.get('payroc').testConnection();
if (!payrocTest.success) {
  throw new Error(`Payroc not enabled: ${payrocTest.message}`);
}
*/
