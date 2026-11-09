# Environment Variables Deployment Guide — KD SOLUTION IT

**Branch:** `arena/02f9dca9-p6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Purpose:** Complete list of all environment variables required to deploy the payment platform.  
**Status:** Authoritative reference — update when new services are added.  
**Important:** Payment processor credentials (API Key, Secret, Merchant ID, Webhook Secret) are NOT in environment variables. They are managed by Super Admin via dashboard UI and encrypted with `ENCRYPTION_MASTER_KEY` in the database. See `CREDENTIALS_ARCHITECTURE.md`.

---

## ⚠️ Critical Rules

| Rule | Description |
|------|-------------|
| 1 | **Never commit `.env` with real values** — only `.env.example` with placeholders goes to Git |
| 2 | Real values go in: hosting provider env settings, GitHub Secrets, or a secrets manager |
| 3 | Use different values for `development`, `staging`, and `production` |
| 4 | `ENCRYPTION_MASTER_KEY` must be 32 bytes, base64-encoded |
| 5 | All secrets must be rotated every 90 days |
| 6 | Payment processor credentials are managed via Super Admin dashboard, NOT environment variables |

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

## 2. Encryption & Security (Required — All Environments)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `ENCRYPTION_MASTER_KEY` | `base64_encoded_32_byte_key` | AES-256-GCM master key to encrypt processor credentials in database | **Yes (Critical)** |
| `SESSION_SECRET` | `random_long_string` | Session cookie signing secret | Yes |
| `JWT_SECRET` | `random_long_string` | JWT token signing secret | Yes |
| `JWT_EXPIRATION` | `1h` | JWT token expiry time | Yes |

**Generate `ENCRYPTION_MASTER_KEY`:**
```bash
openssl rand -base64 32
```

---

## 3. Authentication & Identity (Required — All Environments)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `NEXTAUTH_SECRET` | `random_long_string` | NextAuth.js session secret | Yes |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Application base URL | Yes |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth client ID (optional) | No |
| `GOOGLE_CLIENT_SECRET` | `xxx` | Google OAuth client secret (optional) | No |

---

## 4. Cloudflare Turnstile (Required — Signup Page)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | `0x4AAAA...` | Cloudflare Turnstile site key (client-side) | Yes |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAA...` | Cloudflare Turnstile secret key (server-side) | Yes |

---

## 5. Shopify App Integration (Shopify Deployment Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SHOPIFY_API_KEY` | `your_shopify_api_key` | Shopify app API key | Yes (Shopify) |
| `SHOPIFY_API_SECRET` | `your_shopify_api_secret` | Shopify app API secret | Yes (Shopify) |
| `SHOPIFY_APP_URL` | `https://yourdomain.com` | Shopify app URL | Yes (Shopify) |
| `SHOPIFY_SCOPES` | `read_orders,write_orders` | Shopify API scopes | Yes (Shopify) |

---

## 6. WooCommerce Plugin (WooCommerce Deployment Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `WC_PAYMENT_API_KEY` | `wc_key_xxx` | WooCommerce payment API key | Yes (WooCommerce) |
| `WC_PAYMENT_API_SECRET` | `wc_secret_xxx` | WooCommerce payment API secret | Yes (WooCommerce) |
| `WC_WEBHOOK_SECRET` | `your_wc_webhook_secret` | WooCommerce webhook secret | Yes (WooCommerce) |

---

## 7. Email Service (Optional — For Notifications)

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

## 8. CI/CD & GitHub Secrets (GitHub Actions Only)

| Variable | Example Value | Description | Required |
|----------|--------------|-------------|----------|
| `SUPABASE_ACCESS_TOKEN` | `sbp_xxx` | Supabase CLI token for database deploy | Yes (CI/CD) |
| `SUPABASE_PROJECT_REF` | `xxxx` | Supabase project reference | Yes (CI/CD) |

Set these in GitHub: Settings → Secrets and variables → Actions

---

## 9. Complete `.env.example` Template

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
# 2. Encryption & Security (REQUIRED — CRITICAL)
# ============================================================
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
SESSION_SECRET=random_long_session_secret
JWT_SECRET=random_long_jwt_secret
JWT_EXPIRATION=1h

# ============================================================
# 3. Authentication & Identity (REQUIRED)
# ============================================================
NEXTAUTH_SECRET=random_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# ============================================================
# 4. Cloudflare Turnstile (REQUIRED — Signup Page)
# ============================================================
CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAxxxx
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAxxxx

# ============================================================
# 5. Shopify App (Shopify Deployment Only)
# ============================================================
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=https://yourdomain.com
SHOPIFY_SCOPES=read_orders,write_orders

# ============================================================
# 6. WooCommerce Plugin (WooCommerce Deployment Only)
# ============================================================
WC_PAYMENT_API_KEY=wc_key_xxx
WC_PAYMENT_API_SECRET=wc_secret_xxx
WC_WEBHOOK_SECRET=your_wc_webhook_secret

# ============================================================
# 7. Email Service (Optional)
# ============================================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=KD SOLUTION IT

# NOTE: Payment processor credentials (NMI, Stripe, Payroc, Maverick, etc.)
# are NOT in this file. They are managed via Super Admin dashboard UI
# and encrypted with ENCRYPTION_MASTER_KEY in the database.
# See: docs/planning/CREDENTIALS_ARCHITECTURE.md
```

---

## 10. Where to Set Environment Variables

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

## 11. Payment Processor Credentials — NOT in Environment Variables

The following credentials are **NOT** set as environment variables. They are added by Super Admin through the dashboard UI and encrypted in the database:

| Processor | Credentials Managed By |
|-----------|----------------------|
| NMI | Super Admin dashboard → encrypted in DB |
| Payoneer | Super Admin dashboard → encrypted in DB |
| Rainforest | Super Admin dashboard → encrypted in DB |
| Stripe Connect | Super Admin dashboard → encrypted in DB |
| Airwallex | Super Admin dashboard → encrypted in DB |
| Payroc | Super Admin dashboard → encrypted in DB |
| Maverick | Super Admin dashboard → encrypted in DB |

Only `ENCRYPTION_MASTER_KEY` is needed as environment variable to enable encryption/decryption of these credentials.

---

## 12. Pre-Deploy Checklist

Before deploying, confirm:

- [ ] `.env` file exists (not committed to Git)
- [ ] `ENCRYPTION_MASTER_KEY` is 32 bytes base64-encoded
- [ ] Supabase URL and keys are correct
- [ ] Cloudflare Turnstile keys are set
- [ ] GitHub Secrets configured for CI/CD (if using GitHub Actions)
- [ ] No real secrets in `.env.example`
- [ ] Super Admin dashboard can access database to store encrypted credentials
- [ ] `ENCRYPTION_MASTER_KEY` is available to the application at runtime

এই তালিকা অনুযায়ী সকল এনভায়রনমেন্ট ভেরিয়েবল সেট করলে প্রজেক্টটি সঠিকভাবে ডিপ্লয় করা যাবে। পেমেন্ট প্রসেসরের 크레デンশিয়াল গুলো সুপার অ্যাডমিন ড্যাশবোর্ড থেকে এনক্রিপ্ট করে সেভ করতে পারবেন।