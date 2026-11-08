/**
 * Payroc & Maverick Webhook Handler — Template
 * Path (in coding repo): lib/api/webhooks/payroc.ts and lib/api/webhooks/maverick.ts
 * Owner: STEP 254/258
 * Language: TypeScript (strict mode)
 * Status: TEMPLATE — webhook routes for platform to receive processor callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayrocWebhookSignature } from '@/lib/payments/adapters/payroc/payroc-adapter';
import { verifyMaverickWebhookSignature } from '@/lib/payments/adapters/maverick/maverick-adapter';
import { PaymentAdapterRegistry } from '@/lib/payments/registry';

// ============================================================================
// 1. PAYROC WEBHOOK ROUTE
// ============================================================================

/**
 * POST /api/v1/webhooks/payroc/:storeId
 * Receives webhooks from Payroc (order.created, order.updated, refund.created, etc.)
 */

export async function handlePayrocWebhook(
  request: NextRequest,
  { params }: { params: { storeId: string } }
): Promise<NextResponse> {
  const { storeId } = params;

  // 1. Read raw body as Buffer (do NOT parse JSON before verification)
  const body = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(body);

  // 2. Get HMAC signature header
  const signature = request.headers.get('x-payroc-signature') || request.headers.get('x-signature');

  // 3. Look up store credentials from database
  // const store = await db.payrocStores.findUnique({ where: { id: storeId } });
  // if (!store) {
  //   return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  // }

  // 4. Verify HMAC signature
  // if (!verifyPayrocWebhookSignature(bodyBuffer, signature, store.webhookSecret)) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  // 5. Parse JSON after verification
  // const payload = JSON.parse(bodyBuffer.toString('utf8'));

  // 6. Idempotency: check if external_event_id already processed
  // const existing = await db.payrocWebhookLogs.findUnique({
  //   where: { external_event_id: payload.event_id }
  // });
  // if (existing) {
  //   return NextResponse.json({ received: true, duplicate: true });
  // }

  // 7. Process webhook event
  // switch (payload.event_type) {
  //   case 'transaction.created':
  //     // Update transaction status in platform
  //     break;
  //   case 'transaction.updated':
  //     // Sync status change
  //     break;
  //   case 'refund.created':
  //     // Record refund
  //     break;
  // }

  // 8. Log webhook receipt
  // await db.payrocWebhookLogs.create({
  //   data: {
  //     storeId,
  //     eventType: payload.event_type,
  //     externalEventId: payload.event_id,
  //     requestHash: crypto.createHash('sha256').update(bodyBuffer).digest('hex'),
  //     responseStatus: 200,
  //   },
  // });

  return NextResponse.json({ received: true });
}

// ============================================================================
// 2. MAVERICK WEBHOOK ROUTE
// ============================================================================

/**
 * POST /api/v1/webhooks/maverick/:storeId
 * Receives webhooks from Maverick (payment.created, payment.updated, refund.created, etc.)
 */

export async function handleMaverickWebhook(
  request: NextRequest,
  { params }: { params: { storeId: string } }
): Promise<NextResponse> {
  const { storeId } = params;

  // 1. Read raw body as Buffer
  const body = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(body);

  // 2. Get HMAC signature header
  const signature = request.headers.get('x-maverick-signature') || request.headers.get('x-signature');

  // 3. Look up store credentials from database
  // const store = await db.maverickStores.findUnique({ where: { id: storeId } });
  // if (!store) {
  //   return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  // }

  // 4. Verify HMAC signature
  // if (!verifyMaverickWebhookSignature(bodyBuffer, signature, store.webhookSecret)) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  // 5. Parse JSON after verification
  // const payload = JSON.parse(bodyBuffer.toString('utf8'));

  // 6. Idempotency check
  // const existing = await db.maverickWebhookLogs.findUnique({
  //   where: { external_event_id: payload.event_id }
  // });
  // if (existing) {
  //   return NextResponse.json({ received: true, duplicate: true });
  // }

  // 7. Process webhook event
  // switch (payload.event_type) {
  //   case 'payment.created':
  //   case 'payment.updated':
  //   case 'refund.created':
  //     break;
  // }

  // 8. Log webhook receipt
  // await db.maverickWebhookLogs.create({...});

  return NextResponse.json({ received: true });
}

// ============================================================================
// 3. WEBHOOK ROUTE REGISTRATION (Next.js App Router)
// ============================================================================

/*
// File: src/app/api/webhooks/payroc/[storeId]/route.ts
import { handlePayrocWebhook } from '@/lib/api/webhooks/payroc';
export const POST = handlePayrocWebhook;

// File: src/app/api/webhooks/maverick/[storeId]/route.ts
import { handleMaverickWebhook } from '@/lib/api/webhooks/maverick';
export const POST = handleMaverickWebhook;
*/

// ============================================================================
// 4. WEBHOOK REGISTRATION WITH PROCESSOR (during sub-merchant provisioning)
// ============================================================================

/*
// During STEP 254/258, after creating sub-merchant, register webhooks:
// Payroc: POST https://api.payroc.com/v1/webhooks
//   - URL: https://api.kdplatform.example/api/v1/webhooks/payroc/{storeId}
//   - Events: transaction.created, transaction.updated, refund.created
//
// Maverick: POST https://api.maverickpay.com/v1/webhooks
//   - URL: https://api.kdplatform.example/api/v1/webhooks/maverick/{storeId}
//   - Events: payment.created, payment.updated, refund.created
*/
