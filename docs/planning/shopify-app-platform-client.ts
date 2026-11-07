/**
 * KD Platform API Client for Shopify App
 * File: src/lib/platform-client.ts
 */

export interface PlatformStoreConnectRequest {
  provider: 'shopify';
  shop_domain: string;
  access_token_encrypted: string;
  scope?: string;
}

export interface PlatformStoreConnectResponse {
  store_id: string;
  provider: string;
  shop_domain: string;
  status: string;
  connected_at: string;
  masked_token_last4: string;
}

export interface PlatformSyncOrderRequest {
  external_order_id: string;
  customer_email?: string;
  total_amount: number;
  currency: string;
  status: string;
  order_date?: string;
  line_items?: Array<{
    sku?: string;
    name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface PlatformSyncResponse {
  synced: number;
  skipped: number;
  errors: string[];
}

const PLATFORM_API_URL = process.env.PLATFORM_API_URL!;
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;

/**
 * Sign payload with HMAC-SHA256.
 */
async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PLATFORM_API_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Register store with KD Platform.
 */
export async function connectStoreToPlatform(
  data: PlatformStoreConnectRequest
): Promise<PlatformStoreConnectResponse> {
  const body = JSON.stringify(data);
  const signature = await signPayload(body);

  const res = await fetch(`${PLATFORM_API_URL}/api/v1/stores/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLATFORM_API_KEY}`,
      'X-KD-Signature': signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Platform API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'Platform API returned error');
  }

  return json.data;
}

/**
 * Sync orders to KD Platform.
 */
export async function syncOrdersToPlatform(
  storeId: string,
  orders: PlatformSyncOrderRequest[]
): Promise<PlatformSyncResponse> {
  const body = JSON.stringify({ orders });
  const signature = await signPayload(body);

  const res = await fetch(`${PLATFORM_API_URL}/api/v1/stores/${storeId}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLATFORM_API_KEY}`,
      'X-KD-Signature': signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Platform API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'Platform API returned error');
  }

  return json.data;
}
