# Shopify App Implementation Plan — KD SOLUTION IT

**Repository:** Separate coding repository (not P6). Example name: `kd-shopify-app`  
**Planning Source:** P6 (`docs/planning/SHOPIFY_APP_PLAN.md`)  
**Language:** English only (code, comments, strings, documentation)  
**Target Platform:** Shopify (Public App or Custom App)  
**Integration Target:** KD Payment Platform API  
**Owner:** Payment Integrations team (Adapter STEP ownership rule: one app per provider)

---

## 1. Objective

Build a Shopify app that allows a merchant to connect their Shopify store to the KD Payment Platform. Once connected:

- Orders created/paid/fulfilled in Shopify sync to the KD Platform.
- Webhooks from Shopify are received, HMAC-verified, and forwarded to the platform.
- The merchant can manage the connection from the KD Platform dashboard.
- No card data (PAN, expiry, CVV) ever touches the KD Platform server; Shopify Collect.js / hosted fields handle card data.

---

## 2. High-Level Architecture

```
Shopify Store
     |
     | OAuth Install / Callback
     v
Shopify App (Node.js / Next.js)  <-- Separate Repo
     | (Platform API Client)
     | HTTPS JSON
     v
KD Payment Platform API          <-- Separate Repo / Main Platform
     | (PostgreSQL, RLS, AES-256-GCM)
     v
KD Platform Database
```

---

## 3. Repository Structure (Suggested)

```
kd-shopify-app/
├── README.md
├── package.json
├── .env.example
├── tsconfig.json
├── next.config.js            # If using Next.js App Router
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── 001_initial.sql
│       └── 002_add_webhook_logs.sql
├── src/
│   ├── app/
│   │   ├── shopify/
│   │   │   ├── install/route.ts          # GET /shopify/install?shop=...
│   │   │   ├── callback/route.ts         # GET /shopify/callback?code=&hmac=&shop=
│   │   │   └── webhooks/
│   │   │       ├── order/created/route.ts    # POST
│   │   │       ├── order/paid/route.ts       # POST
│   │   │       ├── order/fulfilled/route.ts  # POST
│   │   │       └── app/uninstalled/route.ts  # POST
│   │   └── proxy/
│   │       └── route.ts                  # Optional Shopify App Proxy
│   ├── lib/
│   │   ├── shopify-auth.ts               # OAuth verify, HMAC, token exchange
│   │   ├── shopify-api.ts                # Shopify Admin API wrapper
│   │   ├── webhook-verify.ts             # HMAC SHA-256 verification
│   │   ├── encryption.ts                 # AES-256-GCM encrypt/decrypt
│   │   ├── platform-client.ts            # Calls KD Platform API
│   │   └── middleware.ts                 # Request validation, rate limiting
│   ├── types/
│   │   └── shopify.d.ts
│   └── middleware.ts                     # Next.js middleware (optional)
├── tests/
│   ├── shopify-auth.test.ts
│   ├── webhook-verify.test.ts
│   └── platform-client.test.ts
└── .gitignore
```

---

## 4. Tech Stack (Recommended)

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Runtime | Node.js | 20.x LTS |
| Framework | Next.js | App Router, TypeScript strict |
| Language | TypeScript | 5.x, strict mode |
| ORM | Prisma | PostgreSQL adapter |
| Database | PostgreSQL | Same as KD Platform (separate schema or shared DB with RLS) |
| Encryption | Node `crypto` | AES-256-GCM |
| Validation | Zod | Request/response schemas |
| Testing | Vitest or Jest | Unit + integration |
| Linting | ESLint + Prettier | Airbnb or KD style |
| Package Manager | npm or pnpm | Lockfile committed |

---

## 5. Environment Variables

Create `.env.example` (commit with placeholders, **no real values**).

```bash
# Shopify Partner credentials (from Shopify Partner Dashboard)
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_orders,write_orders,read_customers,write_customers,read_webhooks,write_webhooks

# App URLs
APP_URL=https://your-shopify-app.example
BASE_PATH=/shopify

# KD Platform API
PLATFORM_API_URL=https://api.kdplatform.example
PLATFORM_API_KEY=your_platform_api_key
PLATFORM_API_SECRET=your_platform_api_secret

# Encryption (32-byte base64 encoded key)
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key

# Webhook secret (shared with platform for inbound verification if needed)
WEBHOOK_SECRET=your_webhook_secret

# Node / Next
NEXT_PUBLIC_APP_URL=https://your-shopify-app.example
```

> **Rule:** `ENCRYPTION_MASTER_KEY`, `SHOPIFY_API_SECRET`, `PLATFORM_API_SECRET` must exist only in environment variables. Never commit `.env` to git.

---

## 6. Database Schema (Prisma)

Append-only migration to the KD Platform database (or separate schema in same DB).  
**Migration number:** next unused after inspecting real migration inventory. Do not edit committed migrations.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Store {
  id                String   @id @default(uuid()) @db.Uuid
  companyId         String   @db.Uuid
  provider          String   @default("shopify")
  shopDomain        String   @unique
  accessTokenEncrypted String
  scope             String?
  status            String   @default("pending") // pending, connected, disconnected, error
  connectedAt       DateTime?
  disconnectedAt    DateTime?
  webhookSecret     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  version           Int      @default(1)

  @@index([companyId])
  @@index([shopDomain])
}

model StoreOrder {
  id                String   @id @default(uuid()) @db.Uuid
  storeId           String   @db.Uuid
  externalOrderId   String   @unique
  customerEmail     String?
  totalAmount       Decimal  @db.Numeric(18,4)
  currency          String   @default("USD")
  status            String   @default("pending")
  syncedAt          DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  version           Int      @default(1)

  @@index([storeId])
  @@index([externalOrderId])
}

model StoreSyncLog {
  id             String   @id @default(uuid()) @db.Uuid
  storeId        String   @db.Uuid
  direction      String   // inbound, outbound
  endpoint       String
  requestHash    String?  // SHA-256 of payload
  responseStatus Int?
  errorMessage   String?
  createdAt      DateTime @default(now())

  @@index([storeId])
  @@index([createdAt])
}
```

**SQL Migration (append-only):**

```sql
-- 001_shopify_stores.sql
CREATE TABLE IF NOT EXISTS shopify_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    provider VARCHAR(32) NOT NULL DEFAULT 'shopify',
    shop_domain VARCHAR(255) NOT NULL UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    scope TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    webhook_secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_shopify_stores_company_id ON shopify_stores(company_id);
CREATE INDEX IF NOT EXISTS idx_shopify_stores_shop_domain ON shopify_stores(shop_domain);

CREATE TABLE IF NOT EXISTS shopify_store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES shopify_stores(id),
    external_order_id VARCHAR(255) NOT NULL UNIQUE,
    customer_email VARCHAR(255),
    total_amount NUMERIC(18,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'pending',
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_shopify_store_orders_store_id ON shopify_store_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_store_orders_external_id ON shopify_store_orders(external_order_id);

CREATE TABLE IF NOT EXISTS shopify_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES shopify_stores(id),
    direction VARCHAR(16) NOT NULL CHECK (direction IN ('inbound','outbound')),
    endpoint TEXT NOT NULL,
    request_hash VARCHAR(64),
    response_status INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopify_sync_logs_store_id ON shopify_sync_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_sync_logs_created_at ON shopify_sync_logs(created_at);
```

**RLS Policy (must be enabled):**

```sql
ALTER TABLE shopify_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY shopify_stores_company_isolation ON shopify_stores
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
-- Repeat similar policies for store_orders and sync_logs.
```

---

## 7. Encryption Utility (`src/lib/encryption.ts`)

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY = Buffer.from(process.env.ENCRYPTION_MASTER_KEY!, 'base64');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(ciphertextBase64: string): string {
  const data = Buffer.from(ciphertextBase64, 'base64');
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
```

---

## 8. Shopify OAuth Flow

### 8.1 Install Route

**File:** `src/app/shopify/install/route.ts`  
**Method:** `GET`  
**Query:** `?shop=myshop.myshopify.com`

1. Validate `shop` parameter (must end with `.myshopify.com`).
2. Generate CSRF `state` (random string, store in cookie/session).
3. Build Shopify OAuth URL:

```
GET https://{shop}.myshopify.com/admin/oauth/authorize
?client_id={SHOPIFY_API_KEY}
&scope={SHOPIFY_SCOPES}
&redirect_uri={APP_URL}/shopify/callback
&state={state}
&grant_options[]=per-user
```

4. Redirect user to that URL.

### 8.2 Callback Route

**File:** `src/app/shopify/callback/route.ts`  
**Method:** `GET`  
**Query:** `?code=...&hmac=...&shop=...&state=...`

1. Verify `state` matches stored CSRF token.
2. Verify `hmac` using Shopify shared secret (sort all params except `hmac` and `signature`, create query string, HMAC-SHA256 with `SHOPIFY_API_SECRET`, compare).
3. Exchange `code` for access token:

```
POST https://{shop}.myshopify.com/admin/oauth/access_token
Body: { client_id, client_secret, code }
```

4. Receive `{ access_token, scope }`.
5. Encrypt `access_token` with `encrypt()`.
6. Look up or create `Store` record:
   - `shop_domain` = shop
   - `access_token_encrypted` = encrypted token
   - `scope` = scope
   - `status` = 'connected'
   - `connected_at` = now()
7. Call KD Platform API `POST /api/v1/stores/connect`:
   - Headers: `Authorization: Bearer {PLATFORM_API_KEY}`, `Content-Type: application/json`
   - Body: `{ shopDomain, provider: 'shopify', accessTokenEncrypted, scope }`
8. Register Shopify webhooks (see Section 9).
9. Redirect merchant to KD Platform dashboard with `?storeConnected=true&shopDomain={shop}`.

### 8.3 Required Shopify Scopes

```
read_orders, write_orders, read_customers, write_customers, read_webhooks, write_webhooks
```

> If the merchant needs checkout extensibility, add `read_checkouts, write_checkouts` after verifying with platform product team.

---

## 9. Shopify Webhooks

Register these webhooks via Shopify Admin API after OAuth:

| Topic | Endpoint (on this app) | Purpose |
|-------|------------------------|---------|
| `orders/create` | `POST /api/shopify/webhooks/order/created` | New order created |
| `orders/paid` | `POST /api/shopify/webhooks/order/paid` | Order paid |
| `orders/fulfilled` | `POST /api/shopify/webhooks/order/fulfilled` | Order fulfilled |
| `app/uninstalled` | `POST /api/shopify/webhooks/app/uninstalled` | Cleanup store record |

### 9.1 Webhook Verification

**File:** `src/lib/webhook-verify.ts`

```typescript
import crypto from 'crypto';

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
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmacHeader));
}
```

Use `SHOPIFY_API_SECRET` as the secret for all Shopify webhooks.

### 9.2 Webhook Route Example

**File:** `src/app/shopify/webhooks/order/created/route.ts`

1. Read raw body as Buffer (do not parse JSON before verification).
2. Extract `X-Shopify-Hmac-Sha256` header.
3. `verifyShopifyWebhook(body, hmac, process.env.SHOPIFY_API_SECRET)`.
4. If invalid → return `401 Unauthorized`.
5. Parse JSON body.
6. Extract order fields: `id`, `email`, `total_price`, `currency`, `financial_status`, `fulfillment_status`, `created_at`.
7. Look up `Store` by `shop_domain` from `X-Shopify-Shop-Domain` header.
8. Call KD Platform `POST /api/v1/stores/:store_id/sync` with order payload.
9. Log to `StoreSyncLog`.
10. Return `200 OK` with `{ received: true }`.

> **Idempotency:** Use `external_order_id` (Shopify order `id`) with unique constraint. If already exists, update status instead of inserting duplicate.

---

## 10. Platform API Client (`src/lib/platform-client.ts`)

All calls to KD Platform must include authentication.

```typescript
export interface PlatformStoreConnectRequest {
  shopDomain: string;
  provider: 'shopify';
  accessTokenEncrypted: string;
  scope?: string;
}

export interface PlatformStoreConnectResponse {
  storeId: string;
  status: string;
}

export async function connectStoreToPlatform(
  data: PlatformStoreConnectRequest
): Promise<PlatformStoreConnectResponse> {
  const res = await fetch(`${process.env.PLATFORM_API_URL}/api/v1/stores/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PLATFORM_API_KEY}`,
      'X-KD-Signature': await signPayload(JSON.stringify(data)), // optional HMAC
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Platform API error: ${res.status}`);
  return res.json();
}

export async function syncOrderToPlatform(
  storeId: string,
  order: any
): Promise<void> {
  const res = await fetch(`${process.env.PLATFORM_API_URL}/api/v1/stores/${storeId}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PLATFORM_API_KEY}`,
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Sync error: ${res.status}`);
}
```

---

## 11. App Proxy (Optional)

If the merchant wants a "Pay with KD" button on the Shopify storefront:

**File:** `src/app/proxy/route.ts`

1. Shopify forwards requests to `https://{shop}.myshopify.com/apps/kd-pay` to this route.
2. Verify Shopify proxy signature (`signature` query param).
3. Return HTML/JSON that embeds KD Platform payment link or hosted fields.

---

## 12. Security Requirements

| Requirement | Implementation |
|-------------|--------------|
| Access token encryption | AES-256-GCM via `ENCRYPTION_MASTER_KEY`; store only encrypted value |
| Secret storage | `.env` only; never in git, database plaintext, or logs |
| Webhook verification | HMAC SHA-256 with `SHOPIFY_API_SECRET` before processing |
| SQL injection | Use Prisma ORM / parameterized queries only |
| XSS / CSRF | State parameter in OAuth; Next.js built-in CSP headers |
| Rate limiting | Middleware on webhook and install routes |
| RLS | `company_id` isolation on all DB tables |
| Card data | Never touch PAN/CVV; Shopify handles tokenization |
| Masked display | Show only last 4 characters of token in UI |

---

## 13. Testing Requirements

### Unit Tests
- `webhook-verify.test.ts`: valid and invalid HMAC
- `encryption.test.ts`: encrypt/decrypt roundtrip, tampered ciphertext throws
- `shopify-auth.test.ts`: hmac verification for callback

### Integration Tests
- OAuth callback flow (mock Shopify token endpoint)
- Webhook receipt → platform sync call
- Duplicate webhook idempotency (same `external_order_id` twice)

### Definition of Done (DoD)
- [ ] `typecheck`, `lint`, `build` all pass
- [ ] OAuth install/callback works in Shopify Partner sandbox
- [ ] Webhook HMAC verification rejects tampered payloads
- [ ] Order sync creates/updates `shopify_store_orders` without duplicates
- [ ] Access token stored encrypted; plaintext never in logs
- [ ] RLS policies enforced; store A cannot read store B's data
- [ ] `.env.example` committed with placeholder names; `.env` in `.gitignore`
- [ ] Migration SQL is append-only; no existing migration edited
- [ ] Handoff file `docs/handoffs/SHOPIFY_APP_COMPLETED.md` created with sandbox test evidence

---

## 14. Dependencies on Platform STEPs

This app depends on the following being implemented in the KD Platform (P6 STEP_PLAN_250):

| Platform STEP | Purpose |
|---------------|---------|
| Store Connection API STEP | `POST /api/v1/stores/connect`, `GET /api/v1/stores`, `POST /api/v1/stores/:id/sync` |
| Platform Webhook STEP | `POST /api/v1/webhooks/shopify/*` receivers (if platform receives directly) |
| Database Migration STEP | `shopify_stores`, `shopify_store_orders`, `shopify_sync_logs` tables |
| RLS / Auth STEP | `company_id` isolation and API key authentication |

> Do not begin Shopify app coding until Platform STEPs above are complete and the API contract is published.

---

## 15. Deployment Checklist

1. Shopify Partner Dashboard: App created, API Key/Secret copied to `.env`
2. App URL set to production domain (Vercel/Netlify/AWS)
3. Redirect URL: `https://<domain>/shopify/callback`
4. Webhook endpoints registered in app code after OAuth
5. Environment variables set on hosting platform
6. Database migration run on staging
7. Sandbox payment + webhook cycle recorded in handoff file
8. Production domain with HTTPS enforced

---

**End of Plan.**  
An AI agent can use this document to generate the complete Shopify app codebase without contacting the platform team for clarification.