# KD Payment Platform — API Contract Draft

**Repository:** P6 (planning source)  
**Status:** Draft for implementation  
**Language:** English only  
**Version:** 1.0  
**Owner:** Payment Platform team

This document defines the exact API contract between the KD Payment Platform backend and external clients (Shopify app, WooCommerce plugin, merchant dashboard, public API).

---

## 1. Base URL & Environments

| Environment | Base URL |
|-------------|----------|
| Development | `https://api-dev.kdplatform.example` |
| Staging | `https://api-staging.kdplatform.example` |
| Production | `https://api.kdplatform.example` |

All endpoints use HTTPS only. All request/response bodies are `application/json`.

---

## 2. Authentication

Every request must include one of the following:

### 2.1 Platform API Key (Server-to-Server)
```
Authorization: Bearer <platform_api_key>
X-KD-Signature: <HMAC_SHA256_HEX>
```
- `platform_api_key` issued from super_admin gateway page.
- `X-KD-Signature` = HMAC-SHA256(request_body, platform_secret_key).

### 2.2 Merchant Store Access Token (OAuth)
```
Authorization: Bearer <store_access_token>
```
- Store access token is AES-256-GCM encrypted at rest.
- Returned after successful OAuth install/callback (Shopify) or connect store (WooCommerce).

### 2.3 Public API Key (Client-side, rate-limited)
```
X-KD-Public-Key: <public_api_key>
```
- Used by storefront payment widgets only.
- Rate limited per merchant.

---

## 3. Common Response Envelope

All successful responses:
```json
{
  "success": true,
  "data": { ... },
  "request_id": "uuid-v7",
  "timestamp": "2026-11-07T12:00:00Z"
}
```

All error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [ { "field": "email", "issue": "required" } ],
    "request_id": "uuid-v7",
    "timestamp": "2026-11-07T12:00:00Z"
  }
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Request body failed Zod/schema validation |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Merchant does not own this resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate external_order_id, store already connected |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation (e.g., insufficient balance) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Platform error |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Webhook HMAC verification failed |

---

## 4. Store Connection Endpoints

### 4.1 POST /api/v1/stores/connect

Register a Shopify or WooCommerce store with the platform.

**Request:**
```http
POST /api/v1/stores/connect
Content-Type: application/json
Authorization: Bearer <platform_api_key>
X-KD-Signature: <hmac_sha256_hex>

{
  "provider": "shopify",
  "shop_domain": "mystore.myshopify.com",
  "access_token_encrypted": "base64_encoded_aes256gcm_ciphertext",
  "scope": "read_orders,write_orders,read_customers,write_customers,read_webhooks,write_webhooks",
  "webhook_secret": "whsec_xxx"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "store_id": "uuid-v7",
    "provider": "shopify",
    "shop_domain": "mystore.myshopify.com",
    "status": "connected",
    "connected_at": "2026-11-07T12:00:00Z",
    "masked_token_last4": "abcd"
  },
  "request_id": "uuid-v7",
  "timestamp": "2026-11-07T12:00:00Z"
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Store already connected",
    "request_id": "uuid-v7"
  }
}
```

### 4.2 GET /api/v1/stores

List connected stores for the authenticated merchant.

**Request:**
```http
GET /api/v1/stores?provider=shopify&status=connected
Authorization: Bearer <platform_api_key>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "store_id": "uuid-v7",
        "provider": "shopify",
        "shop_domain": "mystore.myshopify.com",
        "status": "connected",
        "connected_at": "2026-11-07T12:00:00Z",
        "masked_token_last4": "abcd"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 1,
      "has_more": false
    }
  },
  "request_id": "uuid-v7",
  "timestamp": "2026-11-07T12:00:00Z"
}
```

### 4.3 GET /api/v1/stores/:store_id

Get single store details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "store_id": "uuid-v7",
    "company_id": "uuid-v7",
    "provider": "woocommerce",
    "shop_domain": "example.com",
    "status": "connected",
    "connected_at": "2026-11-07T12:00:00Z",
    "webhook_secret_configured": true,
    "created_at": "2026-11-07T10:00:00Z"
  },
  "request_id": "uuid-v7"
}
```

### 4.4 DELETE /api/v1/stores/:store_id

Disconnect a store and revoke its access token.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "store_id": "uuid-v7",
    "status": "disconnected",
    "disconnected_at": "2026-11-07T12:05:00Z"
  },
  "request_id": "uuid-v7"
}
```

---

## 5. Order Sync Endpoints

### 5.1 POST /api/v1/stores/:store_id/sync

Push orders from Shopify/WooCommerce to the platform. Idempotent on `external_order_id`.

**Request:**
```http
POST /api/v1/stores/:store_id/sync
Content-Type: application/json
Authorization: Bearer <store_access_token>

{
  "orders": [
    {
      "external_order_id": "5098765432",
      "customer_email": "john@example.com",
      "total_amount": 125.5000,
      "currency": "USD",
      "status": "paid",
      "order_date": "2026-11-07T10:30:00Z",
      "line_items": [
        {
          "sku": "SKU-001",
          "name": "Product A",
          "quantity": 2,
          "unit_price": 50.0000,
          "total_price": 100.0000
        }
      ]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "synced": 1,
    "skipped": 0,
    "errors": []
  },
  "request_id": "uuid-v7"
}
```

### 5.2 GET /api/v1/stores/:store_id/orders

Retrieve synced orders for a store.

**Request:**
```http
GET /api/v1/stores/:store_id/orders?status=paid&page=1&page_size=50
Authorization: Bearer <store_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid-v7",
        "external_order_id": "5098765432",
        "customer_email": "john@example.com",
        "total_amount": 125.5000,
        "currency": "USD",
        "status": "paid",
        "synced_at": "2026-11-07T10:35:00Z",
        "created_at": "2026-11-07T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total": 42,
      "has_more": true
    }
  },
  "request_id": "uuid-v7"
}
```

---

## 6. Payment Endpoints

### 6.1 POST /api/v1/payments

Initiate a payment from a connected store.

**Request:**
```http
POST /api/v1/payments
Content-Type: application/json
Authorization: Bearer <platform_api_key>
X-KD-Signature: <hmac_sha256_hex>

{
  "store_id": "uuid-v7",
  "external_order_id": "5098765432",
  "amount": 125.5000,
  "currency": "USD",
  "customer_email": "john@example.com",
  "return_url": "https://mystore.com/checkout/success",
  "cancel_url": "https://mystore.com/checkout/cancel",
  "test_mode": false,
  "idempotency_key": "uuid-v7-payment-001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid-v7",
    "status": "pending",
    "payment_url": "https://pay.kdplatform.example/p/uuid-v7",
    "expires_at": "2026-11-07T12:30:00Z",
    "created_at": "2026-11-07T12:00:00Z"
  },
  "request_id": "uuid-v7"
}
```

### 6.2 GET /api/v1/payments/:id

Check payment status.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid-v7",
    "store_id": "uuid-v7",
    "external_order_id": "5098765432",
    "amount": 125.5000,
    "currency": "USD",
    "status": "paid",
    "provider_transaction_id": "prov_12345",
    "paid_at": "2026-11-07T12:15:00Z",
    "created_at": "2026-11-07T12:00:00Z"
  },
  "request_id": "uuid-v7"
}
```

---

## 7. Webhook Endpoints

### 7.1 Shopify Webhooks (Platform receives from Shopify App)

**Endpoint:** `POST /api/v1/webhooks/shopify/order/created`  
**Endpoint:** `POST /api/v1/webhooks/shopify/order/paid`  
**Endpoint:** `POST /api/v1/webhooks/shopify/order/fulfilled`  
**Endpoint:** `POST /api/v1/webhooks/shopify/app/uninstalled`

**Request Headers:**
```
Content-Type: application/json
X-Shopify-Hmac-Sha256: <base64_hmac_sha256>
X-Shopify-Shop-Domain: mystore.myshopify.com
```

**Request Body (example - order/paid):**
```json
{
  "id": 5098765432,
  "email": "john@example.com",
  "total_price": "125.50",
  "currency": "USD",
  "financial_status": "paid",
  "fulfillment_status": "fulfilled",
  "created_at": "2026-11-07T10:30:00Z",
  "line_items": [
    {
      "sku": "SKU-001",
      "name": "Product A",
      "quantity": 2,
      "price": "50.00"
    }
  ]
}
```

**Response (200 OK):**
```json
{ "received": true }
```

**Verification:** Compute HMAC-SHA256 of raw request body using `SHOPIFY_API_SECRET`. Compare with `X-Shopify-Hmac-Sha256` header. Reject with 401 if mismatch.

---

### 7.2 WooCommerce Webhooks (Platform receives from WooCommerce Plugin)

**Endpoint:** `POST /api/v1/webhooks/woocommerce/order/created`  
**Endpoint:** `POST /api/v1/webhooks/woocommerce/order/updated`  
**Endpoint:** `POST /api/v1/webhooks/woocommerce/order/deleted`

**Request Headers:**
```
Content-Type: application/json
X-KD-Signature: <hmac_sha256_hex>
```

**Request Body (example):**
```json
{
  "id": 12345,
  "order_key": "wc_order_abc123",
  "customer_email": "john@example.com",
  "total": "125.50",
  "currency": "USD",
  "status": "processing",
  "date_created": "2026-11-07T10:30:00Z",
  "line_items": [
    {
      "sku": "SKU-001",
      "name": "Product A",
      "quantity": 2,
      "total": "100.00"
    }
  ]
}
```

**Response (200 OK):**
```json
{ "received": true }
```

**Verification:** Compute HMAC-SHA256 of raw request body using `webhook_secret` configured in WooCommerce settings. Compare with `X-KD-Signature` header. Reject with 401 if mismatch.

---

### 7.3 Platform Webhook to Store (Outbound)

Platform sends payment status updates to the store's registered callback URL.

**Endpoint:** `<store_registered_callback_url>/kd-webhook/payment-updated`

**Request:**
```http
POST https://mystore.com/kd-webhook/payment-updated
Content-Type: application/json
X-KD-Signature: <hmac_sha256_hex>

{
  "payment_id": "uuid-v7",
  "external_order_id": "5098765432",
  "status": "paid",
  "amount": 125.5000,
  "currency": "USD",
  "paid_at": "2026-11-07T12:15:00Z"
}
```

**Expected Response (200 OK):**
```json
{ "received": true }
```

---

## 8. Idempotency

- Every payment request must include `idempotency_key`.
- Store sync is idempotent on `external_order_id` (unique constraint).
- Repeating the same idempotency key returns the cached result without side effects.
- Idempotency keys expire after 24 hours.

---

## 9. Webhook Signature Verification (Pseudocode)

```python
def verify_webhook(body: bytes, signature_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)
```

---

## 10. Data Types

| Type | Format | Example |
|------|--------|---------|
| UUID v7 | string | `0191a2b3-c4d5-6e7f-8901-234567890abc` |
| Amount | numeric(18,4) string | `"125.5000"` |
| Timestamp | ISO 8601 UTC | `2026-11-07T12:00:00Z` |
| Currency | ISO 4217 | `USD` |
| Shop domain | string | `mystore.myshopify.com` |

---

## 11. Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/v1/stores/connect` | 10 req/min per IP |
| `/api/v1/stores/:id/sync` | 60 req/min per store |
| `/api/v1/payments` | 100 req/min per store |
| Webhooks | 1000 req/min per store |

Exceeding limits returns `429 Too Many Requests`.

---

## 12. Implementation Notes for Shopify App & WooCommerce Plugin

1. **Encryption:** AES-256-GCM with 12-byte IV, 16-byte auth tag. Store `IV + tag + ciphertext` as base64.
2. **HMAC Signing:** Use SHA-256. Compare signatures using constant-time comparison.
3. **Card Data:** Never collect PAN/expiry/CVV in plugin/app code. Use hosted payment page redirect or iframe.
4. **RLS:** Platform enforces `company_id` isolation. Store ID must belong to authenticated merchant.
5. **Audit Log:** Every connect/disconnect/sync/payment must be audit logged.

---

**End of API Contract.**
