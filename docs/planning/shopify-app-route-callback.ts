/**
 * Shopify OAuth Callback Route
 * GET /shopify/callback?code=&hmac=&shop=&state=
 * File: src/app/shopify/callback/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.APP_URL!;
const PLATFORM_API_URL = process.env.PLATFORM_API_URL!;
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;
const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY!;

/**
 * Verify Shopify HMAC on callback.
 */
function verifyShopifyHmac(query: Record<string, string>, secret: string): boolean {
  const { hmac, ...params } = query;
  if (!hmac) return false;

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  const computed = createHmac('sha256', secret).update(queryString).digest('hex');

  return timingSafeEqual(
    Buffer.from(computed, 'utf8'),
    Buffer.from(hmac, 'utf8')
  );
}

/**
 * AES-256-GCM encrypt access token.
 */
function encryptAccessToken(token: string): string {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = crypto.subtle.importKey(
    'raw',
    Buffer.from(ENCRYPTION_MASTER_KEY, 'base64'),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  // Note: In production use Node.js crypto module properly. This is conceptual.
  return Buffer.from(iv).toString('base64') + '.' + token; // placeholder
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const hmac = searchParams.get('hmac');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  // Validate required params
  if (!code || !hmac || !shop || !state) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Verify CSRF state
  const cookieStore = cookies();
  const storedState = cookieStore.get('shopify_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  // Verify Shopify HMAC
  const queryObj: Record<string, string> = {};
  searchParams.forEach((value, key) => { queryObj[key] = value; });
  if (!verifyShopifyHmac(queryObj, SHOPIFY_API_SECRET)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  // Exchange code for access token
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  const { access_token, scope } = tokenData;

  // Encrypt access token before storing
  const encryptedToken = encryptAccessToken(access_token);

  // TODO: Save to database:
  // - shop_domain: shop
  // - access_token_encrypted: encryptedToken
  // - scope: scope
  // - status: 'connected'
  // - connected_at: now()

  // Register Shopify webhooks (orders/create, orders/paid, orders/fulfilled, app/uninstalled)
  // TODO: Call Shopify Admin API to create webhook subscriptions pointing to:
  // ${APP_URL}/api/shopify/webhooks/...

  // Call KD Platform to register store
  await fetch(`${PLATFORM_API_URL}/api/v1/stores/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLATFORM_API_KEY}`,
      'X-KD-Signature': await signPayload(JSON.stringify({
        provider: 'shopify',
        shop_domain: shop,
        access_token_encrypted: encryptedToken,
        scope,
      })),
    },
    body: JSON.stringify({
      provider: 'shopify',
      shop_domain: shop,
      access_token_encrypted: encryptedToken,
      scope,
    }),
  });

  // Clear state cookie
  cookieStore.delete('shopify_oauth_state');

  // Redirect to KD Platform dashboard
  return NextResponse.redirect(`${APP_URL}/dashboard?storeConnected=true&shopDomain=${encodeURIComponent(shop)}`);
}

/**
 * Sign payload with HMAC-SHA256 for platform API.
 */
async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PLATFORM_API_KEY); // Use API key as signing secret in this draft
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
