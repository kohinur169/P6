/**
 * Shopify Webhook Route: orders/create
 * POST /api/shopify/webhooks/order/created
 * File: src/app/shopify/webhooks/order/created/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/webhook-verify';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const PLATFORM_API_URL = process.env.PLATFORM_API_URL!;
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;

export async function POST(request: NextRequest) {
  // 1. Read raw body as Buffer (do NOT parse JSON before verification)
  const body = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(body);

  // 2. Get HMAC header
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');

  // 3. Verify HMAC
  if (!verifyShopifyWebhook(bodyBuffer, hmacHeader, SHOPIFY_API_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. Parse JSON after verification
  const payload = JSON.parse(bodyBuffer.toString('utf8'));

  // 5. Extract order fields
  const order = {
    external_order_id: String(payload.id),
    customer_email: payload.email,
    total_amount: parseFloat(payload.total_price) || 0,
    currency: payload.currency || 'USD',
    status: payload.financial_status === 'paid' ? 'paid' : 'pending',
    order_date: payload.created_at,
    line_items: (payload.line_items || []).map((item: any) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unit_price: parseFloat(item.price) || 0,
      total_price: parseFloat(item.price) * item.quantity,
    })),
  };

  // 6. Look up store by shop_domain and get access token from DB
  // const store = await db.store.findUnique({ where: { shopDomain } });
  // if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  // 7. Sync to KD Platform
  // const syncRes = await fetch(`${PLATFORM_API_URL}/api/v1/stores/${store.id}/sync`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${decrypt(store.access_token_encrypted)}`,
  //   },
  //   body: JSON.stringify({ orders: [order] }),
  // });

  // 8. Log to sync_logs table (idempotency via external_order_id unique constraint)

  return NextResponse.json({ received: true });
}
