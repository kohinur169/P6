# Payment Processor Sandbox Registration Guide — KD SOLUTION IT

**Branch:** `arena/02f9dca9-p6`  
**Target:** All 7 payment provider adapters (NMI, Payoneer, Rainforest, Stripe Connect, Airwallex, Payroc, Maverick)  
**Purpose:** Register sandbox accounts for all payment processors so the AI agent can test each adapter end-to-end.  
**Status:** Authoritative reference — keep updated when portal URLs change.

---

## 1. Sandbox Registration Links — All 7 Processors

| # | Payment Processor | STEP Range | Sandbox Registration URL | Notes |
|---|------------------|------------|--------------------------|-------|
| 1 | NMI | 147-152 | https://nmi.com/dev-experience | Self-service sandbox. Create free account at developer portal. Sandbox endpoint: `sandbox.nmi.com`. Test cards at `docs.shuttleglobal.com/payment-providers/nmi-test-cards/`. |
| 2 | Payoneer | 154-156 | https://developer.sandbox.payoneer.com/psd2/ | Developer portal sandbox. OAuth 2.0 Client ID + Secret. QWAC certificate may be required for PSD2 registration. |
| 3 | Rainforest | 157-160 | https://docs.rainforestpay.com | Contact Rainforest support or Platform Success Manager for sandbox merchant configuration. Sandbox API: `https://api.sandbox.rainforestpay.com/v1/`. Virtual device code: `VIRTUAL_DEVICE`. |
| 4 | Stripe Connect | 161-164 | https://dashboard.stripe.com/test | Test mode toggle in Stripe Dashboard. Test client_id: `ca_FkyHCg7X8mlvCUdMDao4mMxagUfhIwXb`. Test SMS code: `000-000`. |
| 5 | Airwallex | 165-169 | https://sandbox.airwallex.com | Self-service sandbox. Create account with work email, name, country, password. API keys at Account > Developer > API keys. Sandbox API: `https://api.sandbox.airwallex.com`. |
| 6 | Payroc | 251-254 | https://payroc.com/solutions/developer-experience/ | Developer portal signup → create app → generate API key. Test base URI: `https://api.payroc.com/v1`. UAT base URI: `https://api.uat.payroc.com/v1`. |
| 7 | Maverick | 255-258 | https://maverickpayments.com/developers | Sandbox accounts available **on request only**. Navigate to Developers > API Services > Documentation. Contact Maverick support for sandbox credentials. |

---

## 2. Sandbox Credentials to Collect Per Processor

For each processor, the AI agent must record the following in `docs/final/PROVIDER_DOCS.md`:

| Field | Description |
|-------|-------------|
| Processor name | e.g., NMI, Payroc, Maverick |
| Sandbox URL | Registration/login URL |
| Sandbox API base URL | Test environment endpoint |
| Client ID / API Key | Sandbox credentials (never commit to Git) |
| Client Secret / API Secret | Sandbox secret (never commit to Git) |
| Webhook Secret | Sandbox webhook signing secret |
| Merchant ID / Account ID | Sandbox merchant identifier |
| Test card numbers | Provider-supplied test PANs |
| Webhook endpoint URL | Your app's sandbox webhook URL |
| Handoff file | `docs/handoffs/STEP_XXX_COMPLETED.md` |

---

## 3. Example `.env.example` Entries (Sandbox Only)

```bash
# NMI
NMI_SECURITY_KEY=your_nmi_sandbox_security_key
NMI_PARTNER_ID=your_nmi_partner_id
NMI_SANDBOX_ENDPOINT=https://sandbox.nmi.com

# Payoneer
PAYONEER_CLIENT_ID=your_payoneer_sandbox_client_id
PAYONEER_CLIENT_SECRET=your_payoneer_sandbox_client_secret
PAYONEER_SANDBOX_BASE_URL=https://login.sandbox.payoneer.com

# Rainforest
RAINFOREST_API_KEY=your_rainforest_sandbox_api_key
RAINFOREST_SANDBOX_BASE_URL=https://api.sandbox.rainforestpay.com/v1

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_FkyHCg7X8mlvCUdMDao4mMxagUfhIwXb
STRIPE_CONNECT_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Airwallex
AIRWALLEX_CLIENT_ID=your_airwallex_sandbox_client_id
AIRWALLEX_API_KEY=your_airwallex_sandbox_api_key
AIRWALLEX_SANDBOX_BASE_URL=https://api.sandbox.airwallex.com

# Payroc
PAYROC_API_KEY=your_payroc_sandbox_api_key
PAYROC_API_SECRET=your_payroc_sandbox_api_secret
PAYROC_MERCHANT_ID=your_payroc_sandbox_merchant_id
PAYROC_WEBHOOK_SECRET=your_payroc_sandbox_webhook_secret
PAYROC_ENV=sandbox

# Maverick
MAVERICK_CLIENT_ID=your_maverick_sandbox_client_id
MAVERICK_CLIENT_SECRET=your_maverick_sandbox_client_secret
MAVERICK_MERCHANT_ID=your_maverick_sandbox_merchant_id
MAVERICK_WEBHOOK_SECRET=your_maverick_sandbox_webhook_secret
MAVERICK_ENV=sandbox

# Encryption
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
```

> **Never commit real secrets to Git.** Use `.env.example` with placeholders only. Real values go in environment variables or a secrets manager.

---

## 4. AI Agent Security Audit Guide — Line-by-Line Code Review

This guide instructs an AI agent to audit the entire payment platform codebase line-by-line, identify security gaps, feature gaps, and bugs, and produce fixes.

### Phase 1: Pre-Audit Setup

1. Clone the coding repo: `https://github.com/kohinur169/kd-solution-it`
2. Switch to branch: `feature/payroc-maverick-integration`
3. Install dependencies: `npm install` (or equivalent)
4. Run typecheck: `tsc --noEmit`
5. Run lint: `eslint .`
6. Run tests: `npm test` (or equivalent)
7. Confirm all planning files are present in `docs/planning/` and `docs/final/`

### Phase 2: Security Audit Checklist (Line-by-Line)

The AI agent must review **every file** in these directories:

| Directory | What to Audit |
|-----------|---------------|
| `lib/payments/adapters/` | All 7 provider adapters (NMI, Payoneer, Rainforest, Stripe Connect, Airwallex, Payroc, Maverick) |
| `lib/payments/registry.ts` | Payment provider registry initialization |
| `src/app/api/webhooks/` | Webhook handlers for all providers |
| `src/app/api/kyb/` | KYB/KYC policy acceptance endpoints |
| `src/app/api/auth/` | Authentication, signup, login |
| `src/app/api/payments/` | Payment acceptance, refund, void, capture |
| `middleware/` | Authentication middleware, RBAC, RLS |
| `migrations/` | Database migration files |
| `.env.example` | Environment variable templates |

For each file, the agent must check:

#### A. Authentication & Authorization
- [ ] All API routes require valid authentication (session/JWT)
- [ ] Company-scoped access: user can only access their own `company_id` data
- [ ] Admin routes require admin role check
- [ ] No hardcoded credentials or API keys in source code
- [ ] Access tokens stored encrypted at rest (AES-256-GCM)
- [ ] Encryption key exists only in environment variables, never in code

#### B. Input Validation
- [ ] All request bodies validated with Zod schemas
- [ ] All query parameters validated
- [ ] No raw SQL string concatenation — use parameterized queries / ORM
- [ ] File uploads validated for type, size, malware scan
- [ ] Webhook payloads validated before processing

#### C. Webhook Security
- [ ] HMAC signature verified **before** parsing JSON body
- [ ] Webhook timestamp tolerance checked (replay attack prevention)
- [ ] Idempotency key checked — same event ID processed once only
- [ ] Webhook returns `200 OK` only after successful processing
- [ ] Invalid signatures return `401 Unauthorized`

#### D. Payment Data Security
- [ ] **Never** store card PAN, expiry, CVV on platform servers
- [ ] Use provider-hosted fields (NMI Collect.js, Stripe Elements, etc.)
- [ ] Card data tokenized immediately — token stored, not raw data
- [ ] PCI-DSS scope: platform does not touch raw card data
- [ ] Refund/void operations require proper authorization

#### E. KYB/KYC Policy Flow
- [ ] **Signup page shows NO compliance policies** — only email, password, name, phone, Turnstile, basic Terms of Service
- [ ] KYB verification page shows all 11 policies from `cms_pages`
- [ ] "Submit for Verification" button disabled until all 11 policies accepted
- [ ] `POST /api/v1/kyb/submit` returns `422` without all policy acceptances
- [ ] Policy acceptance records `cms_page_id`, `policy_version`, `accepted_from_ip`, `user_agent`
- [ ] RLS enabled on `merchant_policy_acceptance` by `company_id`

#### F. Dependencies & Supply Chain
- [ ] `package.json` dependencies have no known vulnerabilities (run `npm audit`)
- [ ] GitHub Dependabot enabled
- [ ] No abandoned/unmaintained packages
- [ ] Lock file committed (`package-lock.json` or `yarn.lock`)

#### G. Secrets & Configuration
- [ ] `.env` not committed to Git (in `.gitignore`)
- [ ] `.env.example` has only placeholders
- [ ] GitHub secret scanning enabled
- [ ] Gitleaks scan configured in CI/CD
- [ ] No connection strings with embedded passwords in code

#### H. Error Handling & Logging
- [ ] Errors do not leak stack traces to client
- [ ] Sensitive data not logged (API keys, tokens, card data)
- [ ] All errors logged server-side with request ID for traceability
- [ ] Graceful failure on webhook processing errors

### Phase 3: Feature Gap Analysis

Compare against `docs/final/FEATURE_LIST.md` Section 6 (Payment Processors — Seven) and `docs/final/STEP_PLAN_250.md` STEPs 1-258:

| Check | Status | Notes |
|-------|--------|-------|
| All 7 provider adapters exist under `lib/payments/adapters/` | | NMI, Payoneer, Rainforest, Stripe Connect, Airwallex, Payroc, Maverick |
| Payroc adapter (STEP 251-254) implemented | | |
| Maverick adapter (STEP 255-258) implemented | | |
| Payment registry updated with payroc + maverick | | Do not modify existing 5 providers |
| Webhook handlers for payroc + maverick created | | |
| Database migrations for payroc + maverick created | | Append-only, next unused migration numbers |
| `.env.example` includes payroc + maverick vars | | |
| Signup page has no compliance policies | | Only basic Terms of Service |
| KYB page shows 11 policies from `cms_pages` | | |
| `merchant_policy_acceptance` table exists | | With RLS enabled |
| Unit tests pass for all adapters | | Connection, payment, refund, webhook, idempotency, RLS |
| Handoff files created for STEP 251-258 | | `docs/handoffs/STEP_251_COMPLETED.md` ... |

### Phase 4: Bug & Error Fix Workflow

When the AI agent finds a security gap, feature gap, or bug:

1. **Document the issue** in `docs/handoffs/BUG_REPORT.md`:
   - File path and line number
   - Issue type: security / feature-gap / bug / compliance
   - Severity: critical / high / medium / low
   - Description of the problem
   - Required fix

2. **Apply the fix** following these rules:
   - Do not modify STEP 1-250
   - Do not edit committed migrations — append new ones
   - Do not store real secrets in Git
   - All changes must pass typecheck, lint, and tests

3. **Commit with message format:**
   ```
   fix: <description of fix>
   
   Files: <file paths>
   STEP: <step number if applicable>
   ```

4. **Create pull request** on `feature/payroc-maverick-integration` branch

5. **Run GitHub security scans:** CodeQL, Dependabot, secret scanning

### Phase 5: Production Readiness Verification

Before go-live, the AI agent must confirm:

- [ ] All STEPs 1-258 complete and committed
- [ ] Sandbox payment → refund → webhook cycle successful for all 7 processors
- [ ] Webhook signature verification working for all providers
- [ ] Idempotency working (duplicate events rejected)
- [ ] RLS enabled on all company-scoped tables
- [ ] Audit log active for KYB submission and policy acceptance
- [ ] SSL certificate active on production domain
- [ ] Rate limiting enabled on all API endpoints
- [ ] No secrets in `.env` file
- [ ] GitHub security scans passed (CodeQL, Dependabot, Gitleaks, Dependency Review)
- [ ] TypeScript strict mode enabled
- [ ] Zod validation on all forms and APIs
- [ ] ESLint and Prettier pass
- [ ] Typecheck, lint, build all pass
- [ ] Unit tests pass

---

## 5. How to Use This Guide with an AI Agent

1. Copy this entire document into a new Arena.ai chat session.
2. Upload all planning files from `/home/user/P6/docs/planning/` and `/home/user/P6/docs/final/` to the coding repository.
3. Tell the agent: "Run the security audit guide from `PAYMENT_PROCESSOR_SANDBOX_REGISTRATION_GUIDE.md`. Audit line-by-line. Report all gaps in `docs/handoffs/BUG_REPORT.md`. Fix all critical and high issues."
4. Review the agent's bug report before approving fixes.

---

## 6. Important Warnings

- **Maverick sandbox:** Available on request only. Contact Maverick support at maverickpayments.com/developers before STEP 255-258 can be fully tested.
- **Rainforest sandbox:** Contact Rainforest support for sandbox merchant configuration.
- **Never use real card data in sandbox.** Use provider-supplied test card numbers only.
- **Never commit `.env` with real values.** Only `.env.example` with placeholders.
- **Do not modify STEP 1-250.** Append new STEPs only.

---

এই গাইডলাইনটি নিশ্চিত করে যে সকল পেমেন্ট প্রসেসরের স্যান্টিব অ্যাকাউন্ট রেজিস্টার করা যাবে এবং AI এজেন্ট লাইন বাই লাইন কোড অডিট করে সিকিউরিটি গ্যাপ, ফিচার গ্যাপ এবং বাগ খুঁজে বের করে ফিক্স করবে।