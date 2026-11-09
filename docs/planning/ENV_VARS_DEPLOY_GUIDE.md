# Environment Variables Deployment Guide — KD SOLUTION IT

**Branch:** `arena/02f9dca9-p6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Purpose:** Complete list of all environment variables required to deploy the payment platform.  
**Status:** Authoritative reference — update when new services are added.

---

## ⚠️ Critical Rules

| Rule | Description |
|------|-------------|
| 1 | **Never commit `.env` with real values** — only `.env.example` with placeholders goes to Git |
| 2 | Real values go in: hosting provider env settings, GitHub Secrets, or a secrets manager |
| 3 | Use different values for `development`, `staging`, and `production` |
| 4 | `ENCRYPTION_MASTER_KEY` must be 32 bytes, base64-encoded |
| 5 | All secrets must be rotated every 90 days |

---

## 1. Supabase Database (Required — All Environments)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anonymous (public) key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase service role key (server-side only) | Yes |
| `SUPABASE_ACCESS_TOKEN` | `sbp_xxx` | Supabase CLI access token for migrations | Yes (CI/CD) |
| `SUPABASE_PROJECT_REF` | `xxxx` | Supabase project reference ID | Yes (CI/CD) |

---

## 2. Payment Processor Credentials (All 7 Providers)

### NMI (STEP 147-152)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `NMI_SECURITY_KEY` | `your_nmi_security_key` | NMI API security key | Yes |
| `NMI_PARTNER_ID` | `your_nmi_partner_id` | NMI partner/merchant ID | Yes |
| `NMI_SANDBOX_ENDPOINT` | `https://sandbox.nmi.com` | NMI sandbox gateway URL | Yes (sandbox) |
| `NMI_WEBHOOK_SECRET` | `your_nmi_webhook_secret` | NMI webhook signing secret | Yes |

### Payoneer (STEP 154-156)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `PAYONEER_CLIENT_ID` | `your_payoneer_client_id` | Payoneer OAuth client ID | Yes |
| `PAYONEER_CLIENT_SECRET` | `your_payoneer_client_secret` | Payoneer OAuth client secret | Yes |
| `PAYONEER_SANDBOX_BASE_URL` | `https://login.sandbox.payoneer.com` | Payoneer sandbox base URL | Yes (sandbox) |

### Rainforest (STEP 157-160)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `RAINFOREST_API_KEY` | `your_rainforest_api_key` | Rainforest API key | Yes |
| `RAINFOREST_SANDBOX_BASE_URL` | `https://api.sandbox.rainforestpay.com/v1` | Rainforest sandbox API URL | Yes (sandbox) |

### Stripe Connect (STEP 161-164)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `STRIPE_CONNECT_CLIENT_ID` | `ca_xxx` | Stripe Connect OAuth client ID | Yes |
| `STRIPE_CONNECT_SECRET_KEY` | `sk_test_xxx` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` | Stripe publishable key (client-side) | Yes |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Stripe webhook signing secret | Yes |

### Airwallex (STEP 165-169)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `AIRWALLEX_CLIENT_ID` | `your_airwallex_client_id` | Airwallex API client ID | Yes |
| `AIRWALLEX_API_KEY` | `your_airwallex_api_key` | Airwallex API key | Yes |
| `AIRWALLEX_SANDBOX_BASE_URL` | `https://api.sandbox.airwallex.com` | Airwallex sandbox API URL | Yes (sandbox) |
| `AIRWALLEX_WEBHOOK_SECRET` | `your_airwallex_webhook_secret` | Airwallex webhook secret | Yes |

### Payroc (STEP 251-254)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `PAYROC_API_KEY` | `your_payroc_api_key` | Payroc API key | Yes |
| `PAYROC_API_SECRET` | `your_payroc_api_secret` | Payroc API secret | Yes |
| `PAYROC_MERCHANT_ID` | `your_payroc_merchant_id` | Payroc merchant ID | Yes |
| `PAYROC_WEBHOOK_SECRET` | `your_payroc_webhook_secret` | Payroc webhook signing secret | Yes |
| `PAYROC_ENV` | `sandbox` | `sandbox` or `production` | Yes |

### Maverick (STEP 255-258)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `MAVERICK_CLIENT_ID` | `your_maverick_client_id` | Maverick API client ID | Yes |
| `MAVERICK_CLIENT_SECRET` | `your_maverick_client_secret` | Maverick API client secret | Yes |
| `MAVERICK_MERCHANT_ID` | `your_maverick_merchant_id` | Maverick merchant ID | Yes |
| `MAVERICK_WEBHOOK_SECRET` | `your_maverick_webhook_secret` | Maverick webhook signing secret | Yes |
| `MAVERICK_ENV` | `sandbox` | `sandbox` or `production` | Yes |

---

## 3. Encryption & Security (Required — All Environments)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `ENCRYPTION_MASTER_KEY` | `base64_encoded_32_byte_key` | AES-256-GCM master key for encrypting access tokens at rest | **Yes (Critical)** |
| `SESSION_SECRET` | `random_long_string` | Session cookie signing secret | Yes |
| `JWT_SECRET` | `random_long_string` | JWT token signing secret | Yes |
| `JWT_EXPIRATION` | `1h` | JWT token expiry time | Yes |

**Generate `ENCRYPTION_MASTER_KEY`:**
```bash
openssl rand -base64 32
```

---

## 4. Authentication & Identity (Required — All Environments)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `NEXTAUTH_SECRET` | `random_long_string` | NextAuth.js session secret | Yes |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Application base URL | Yes |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth client ID (optional) | No |
| `GOOGLE_CLIENT_SECRET` | `xxx` | Google OAuth client secret (optional) | No |

---

## 5. Cloudflare Turnstile (Required — Signup Page)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | `0x4AAAA...` | Cloudflare Turnstile site key (client-side) | Yes |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAA...` | Cloudflare Turnstile secret key (server-side) | Yes |

---

## 6. Shopify App Integration (Shopify Deployment Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SHOPIFY_API_KEY` | `your_shopify_api_key` | Shopify app API key | Yes (Shopify) |
| `SHOPIFY_API_SECRET` | `your_shopify_api_secret` | Shopify app API secret | Yes (Shopify) |
| `SHOPIFY_APP_URL` | `https://yourdomain.com` | Shopify app URL | Yes (Shopify) |
| `SHOPIFY_SCOPES` | `read_orders,write_orders` | Shopify API scopes | Yes (Shopify) |

---

## 7. WooCommerce Plugin (WooCommerce Deployment Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `WC_PAYMENT_API_KEY` | `wc_key_xxx` | WooCommerce payment API key | Yes (WooCommerce) |
| `WC_PAYMENT_API_SECRET` | `wc_secret_xxx` | WooCommerce payment API secret | Yes (WooCommerce) |
| `WC_WEBHOOK_SECRET` | `your_wc_webhook_secret` | WooCommerce webhook secret | Yes (WooCommerce) |

---

## 8. Email Service (Optional — For Notifications)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SMTP_HOST` | `smtp.sendgrid.net` | SMTP server host | No |
| `SMTP_PORT` | `587` | SMTP port | No |
| `SMTP_USER` | `apikey` | SMTP username | No |
| `SMTP_PASS` | `SG.xxx` | SMTP password or API key | No |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Sender email address | No |
| `EMAIL_FROM_NAME` | `KD SOLUTION IT` | Sender display name | No |

> **Note:** Email delivery is owned by later email STEPs. Do not implement email during STEP 123.

---

## 9. CI/CD & GitHub Secrets (GitHub Actions Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SUPABASE_ACCESS_TOKEN` | `sbp_xxx` | Supabase CLI token for database deploy | Yes (CI/CD) |
| `SUPABASE_PROJECT_REF` | `xxxx` | Supabase project reference | Yes (CI/CD) |

Set these in GitHub: Settings → Secrets and variables → Actions

---

## 10. Complete `.env.example` Template

Copy this to `.env` and fill in real values:

```bash
# ============================================================
# 1. Supabase Database (REQUIRED)
# ============================================================
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ACCESS_TOKEN=sbp_your_access_token
SUPABASE_PROJECT_REF=your_project_ref

# ============================================================
# 2. Payment Processor Credentials (REQUIRED)
# ============================================================

# NMI
NMI_SECURITY_KEY=your_nmi_security_key
NMI_PARTNER_ID=your_nmi_partner_id
NMI_SANDBOX_ENDPOINT=https://sandbox.nmi.com
NMI_WEBHOOK_SECRET=your_nmi_webhook_secret

# Payoneer
PAYONEER_CLIENT_ID=your_payoneer_client_id
PAYONEER_CLIENT_SECRET=your_payoneer_client_secret
PAYONEER_SANDBOX_BASE_URL=https://login.sandbox.payoneer.com

# Rainforest
RAINFOREST_API_KEY=your_rainforest_api_key
RAINFOREST_SANDBOX_BASE_URL=https://api.sandbox.rainforestpay.com/v1

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_xxx
STRIPE_CONNECT_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Airwallex
AIRWALLEX_CLIENT_ID=your_airwallex_client_id
AIRWALLEX_API_KEY=your_airwallex_api_key
AIRWALLEX_SANDBOX_BASE_URL=https://api.sandbox.airwallex.com
AIRWALLEX_WEBHOOK_SECRET=your_airwallex_webhook_secret

# Payroc
PAYROC_API_KEY=your_payroc_api_key
PAYROC_API_SECRET=your_payroc_api_secret
PAYROC_MERCHANT_ID=your_payroc_merchant_id
PAYROC_WEBHOOK_SECRET=your_payroc_webhook_secret
PAYROC_ENV=sandbox

# Maverick
MAVERICK_CLIENT_ID=your_maverick_client_id
MAVERICK_CLIENT_SECRET=your_maverick_client_secret
MAVERICK_MERCHANT_ID=your_maverick_merchant_id
MAVERICK_WEBHOOK_SECRET=your_maverick_webhook_secret
MAVERICK_ENV=sandbox

# ============================================================
# 3. Encryption & Security (REQUIRED — CRITICAL)
# ============================================================
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
SESSION_SECRET=random_long_session_secret
JWT_SECRET=random_long_jwt_secret
JWT_EXPIRATION=1h

# ============================================================
# 4. Authentication & Identity (REQUIRED)
# ============================================================
NEXTAUTH_SECRET=random_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# ============================================================
# 5. Cloudflare Turnstile (REQUIRED — Signup Page)
# ============================================================
CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAxxxx
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAxxxx

# ============================================================
# 6. Shopify App (Shopify Deployment Only)
# ============================================================
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=https://yourdomain.com
SHOPIFY_SCOPES=read_orders,write_orders

# ============================================================
# 7. WooCommerce Plugin (WooCommerce Deployment Only)
# ============================================================
WC_PAYMENT_API_KEY=wc_key_xxx
WC_PAYMENT_API_SECRET=wc_secret_xxx
WC_WEBHOOK_SECRET=your_wc_webhook_secret

# ============================================================
# 8. Email Service (Optional)
# ============================================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=KD SOLUTION IT
```

---

## 11. Where to Set Environment Variables

| Platform | Where to Set |
|----------|-------------|
| **Vercel** | Project Settings → Environment Variables |
| **Netlify** | Site settings → Environment variables |
| **Railway** | Variables tab |
| **Render** | Environment tab |
| **AWS Elastic Beanstalk** | Configuration → Software → Environment properties |
| **Docker** | `.env` file or `-e` flag |
| **GitHub Actions** | Settings → Secrets and variables → Actions |

---

## 12. Pre-Deploy Checklist

Before deploying, confirm:

- [ ] `.env` file exists (not committed to Git)
- [ ] `ENCRYPTION_MASTER_KEY` is 32 bytes base64-encoded
- [ ] All 7 payment processor credentials are set
- [ ] Supabase URL and keys are correct
- [ ] Cloudflare Turnstile keys are set
- [ ] Webhook secrets are configured for all providers
- [ ] `PAYROC_ENV` and `MAVERICK_ENV` set to `sandbox` for testing
- [ ] GitHub Secrets configured for CI/CD (if using GitHub Actions)
- [ ] No real secrets in `.env.example`

---

এই তালিকা অনুযায়ী সকল এনভায়রনমেন্ট ভেরিয়েবল সেট করলে প্রজেক্টটি সঠিকভাবে ডিপ্লয় করা যাবে।