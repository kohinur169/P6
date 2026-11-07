/**
 * Shopify App Install Route
 * GET /shopify/install?shop=myshop.myshopify.com
 * File: src/app/shopify/install/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES ?? 'read_orders,write_orders,read_customers,write_customers,read_webhooks,write_webhooks';
const APP_URL = process.env.APP_URL!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');

  // Validate shop domain
  if (!shop || !shop.endsWith('.myshopify.com')) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
  }

  // Generate CSRF state token
  const state = crypto.randomUUID();

  // Store state in cookie (httpOnly, secure, sameSite=lax)
  cookies().set('shopify_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/shopify/callback',
  });

  // Build Shopify OAuth authorization URL
  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
  authUrl.searchParams.set('scope', SHOPIFY_SCOPES);
  authUrl.searchParams.set('redirect_uri', `${APP_URL}/shopify/callback`);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('grant_options[]', 'per-user');

  return NextResponse.redirect(authUrl);
}
