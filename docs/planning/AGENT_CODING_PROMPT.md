# Arena.ai Agent Coding Prompt — KD SOLUTION IT Payment Platform

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only (code, comments, strings, documentation)  
**Status:** Authoritative implementation prompt  
**Owner:** Platform Team / Payments Squad

---

## 1. How to Use This Prompt

Copy this entire prompt into a new Arena.ai chat session. Also upload the following planning files to the coding repository (`kd-solution-it`) so the agent can reference them:

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `docs/final/STEP_PLAN_250.md` | Total 258 STEPs; STEP 251-258 for Payroc/Maverick |
| 2 | `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| 3 | `docs/final/API_CONTRACT.md` | Exact API endpoints, request/response JSON |
| 4 | `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` | Signup vs verification flow correction |
| 5 | `docs/planning/DATABASE_SETUP.md` | Supabase database setup plan |
| 6 | `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md` | Master coding instructions |
| 7 | `docs/planning/payroc-adapter-template.ts` | Payroc adapter code template |
| 8 | `docs/planning/maverick-adapter-template.ts` | Maverick adapter code template |
| 9 | `docs/planning/payment-registry-update-template.ts` | Payment registry update template |
| 10 | `docs/planning/webhook-handler-template.ts` | Webhook handler code template |
| 11 | `docs/planning/migration-0251-payroc-adapter.sql` | Payroc database migration |
| 12 | `docs/planning/migration-0255-maverick-adapter.sql` | Maverick database migration |
| 13 | `docs/planning/WEBHOOK_API_RELIABILITY_GUIDE.md` | Webhook and API reliability guide for live production |
| 14 | `docs/planning/CODE_REVIEW_SECURITY_CHECKLIST.md` | Code review and security checklist |
| 15 | `docs/planning/PRODUCTION_READINESS_CHECKLIST.md` | Production readiness checklist |

---

## 2. Objective

The agent must complete the following tasks:

1. Add **Payroc** and **Maverick** as new acquiring processors in the payment facilitator platform (STEP 251-258).
2. **Separate signup flow from KYB/KYC verification flow** — signup page should collect only basic account information; compliance policies should be shown only before KYB/KYC verification submission.
3. **Never modify STEP 1-250** — step numbers, titles, ownership, and content of steps 1 through 250 must remain intact.
4. New STEPs 251-258 must be appended only at the end.
5. Webhooks and APIs must work reliably with real-time synchronization.
6. The code must pass GitHub code review, vulnerability scanning, and security checks.

---

## ⚠️ Mandatory Rules (Never Violate)

| # | Rule |
|---|------|
| 1 | **Do not modify STEP 1-250** — step numbers, titles, ownership, and content must remain 100% intact. |
| 2 | **Do not edit any committed migration** — only append new migrations with the next unused number. |
| 3 | **Never store card data (PAN, expiry, CVV) on the platform server** — use provider-hosted fields only. |
| 4 | **Access tokens must be AES-256-GCM encrypted at rest** — encryption key exists only in environment variables. |
| 5 | **Accept webhooks only after signature verification** — otherwise return `401 Unauthorized`. |
| 6 | **No compliance policies on signup page** — only basic Terms of Service. |
| 7 | **Do not accept KYB submission without all policy acceptances** — return `422 Unprocessable Entity`. |
| 8 | **No real secrets in the Git repository** — only `.env.example` with placeholders. |

---

## 📋 Step 1: Read Planning Documents

Before writing any code, read these files completely:

- `docs/final/STEP_PLAN_250.md` — Steps 251-258 for Payroc and Maverick
- `docs/final/FEATURE_LIST.md` — Section 6: Payment Processors (Seven)
- `docs/final/API_CONTRACT.md` — Exact API endpoints, request/response JSON
- `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` — Signup vs verification flow
- `docs/planning/DATABASE_SETUP.md` — Supabase database setup plan

---

## 🗄️ Step 2: Create Database Migrations (Append-Only)

Create the following migration files in the coding repository under `migrations/`. Use the next unused migration number (inspect the real migration inventory first).

### 2.1 Migration: `0261_policy_versions.sql`

```sql
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content_url TEXT NOT NULL,
    effective_from TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version_int INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_key ON policy_versions(policy_key);
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_versions_public_read ON policy_versions
    FOR SELECT TO authenticated
    USING (is_active = true);
```

### 2.2 Migration: `0262_merchant_policy_acceptance.sql`

```sql
CREATE TABLE IF NOT EXISTS merchant_policy_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    policy_version_id UUID NOT NULL REFERENCES policy_versions(id),
    accepted_at TIMESTAMPTZ DEFAULT now(),
    accepted_from_ip INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version_int INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_merchant_policy_acceptance_company_id ON merchant_policy_acceptance(company_id);
ALTER TABLE merchant_policy_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_policy_acceptance_company_isolation ON merchant_policy_acceptance
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

### 2.3 Migration: `0263_kyc_submissions_update.sql`

```sql
ALTER TABLE kyc_submissions
ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
```

### 2.4 Migration: `0251_payroc_adapter.sql` and `0255_maverick_adapter.sql`

Copy from `docs/planning/migration-0251-payroc-adapter.sql` and `docs/planning/migration-0255-maverick-adapter.sql`.

---

## 🔌 Step 3: Build Payroc Adapter (STEP 251-254)

### 3.1 File: `lib/payments/adapters/payroc/payroc-adapter.ts`

Copy code from `docs/planning/payroc-adapter-template.ts` and fill in the following:

1. `PAYROC_ENV_CONFIG` — set correct base URL (read Payroc official documentation in coding session)
2. `PayrocPaymentRequestSchema` — set correct field names
3. `testConnection()` method — set correct endpoint
4. `createSubMerchant()` — set correct request/response format
5. `processPayment()` — set correct payment endpoint
6. `verifyPayrocWebhookSignature()` — verify correct header name
7. Status mapping functions — update according to Payroc's actual statuses

### 3.2 Security
- Store access token AES-256-GCM encrypted in database
- Provider cannot be enabled when connection test fails
- Never display full key after saving; show only last 4 characters

---

## 🔌 Step 4: Build Maverick Adapter (STEP 255-258)

### 4.1 File: `lib/payments/adapters/maverick/maverick-adapter.ts`

Copy code from `docs/planning/maverick-adapter-template.ts` and fill in:

1. `MAVERICK_ENV_CONFIG` — set correct base URL
2. `MaverickPaymentRequestSchema` — set correct field names
3. `testConnection()` method — set correct endpoint
4. `createSubMerchant()` — set correct request/response format
5. `processPayment()` — set correct payment endpoint
6. `verifyMaverickWebhookSignature()` — verify correct header name
7. Status mapping functions — update according to Maverick's actual statuses

---

## 📦 Step 5: Update Payment Registry

### 5.1 File: `lib/payments/registry.ts`

Copy code from `docs/planning/payment-registry-update-template.ts`.

Ensure:
- Do not modify entries for the existing 5 providers
- Add only `payroc` and `maverick` new entries
- Pass new credentials in `initializePaymentRegistry()` function

---

## 🪝 Step 6: Build Webhook Handlers (STEP 254/258)

### 6.1 File: `src/app/api/webhooks/payroc/[storeId]/route.ts`
Copy from `docs/planning/webhook-handler-template.ts`.

### 6.2 File: `src/app/api/webhooks/maverick/[storeId]/route.ts`
Copy from same template.

Ensure:
- Verify HMAC signature **before** parsing JSON request body
- Perform idempotency check (same event must not be processed twice)
- Return `200 OK` response

---

## 🔐 Step 7: Environment Variables Setup

### 7.1 File: `.env.example`

Add the following variables:

```bash
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

# Encryption (environment variables only, never in git)
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
```

---

## 🧪 Step 8: Write Unit Tests

Test the following:

1. `testConnection()` success/failure cases
2. `processPayment()` successful payment
3. `processPayment()` failed payment
4. `refundPayment()` successful refund
5. `verifyPayrocWebhookSignature()` valid/invalid signature
6. `verifyMaverickWebhookSignature()` valid/invalid signature
7. Idempotency: processing same transaction twice must not create duplicate
8. RLS: Company A sees its own data, Company B cannot see Company A's data

---

## 📋 Step 9: Create Handoff Files

After completing each STEP, create:

- `docs/handoffs/STEP_251_COMPLETED.md` — Payroc documentation verification
- `docs/handoffs/STEP_252_COMPLETED.md` — Payroc encrypted key + connection test
- `docs/handoffs/STEP_253_COMPLETED.md` — Payroc payment acceptance
- `docs/handoffs/STEP_254_COMPLETED.md` — Payroc sub-merchant provisioning + webhook
- `docs/handoffs/STEP_255_COMPLETED.md` — Maverick documentation verification
- `docs/handoffs/STEP_256_COMPLETED.md` — Maverick encrypted key + connection test
- `docs/handoffs/STEP_257_COMPLETED.md` — Maverick payment acceptance
- `docs/handoffs/STEP_258_COMPLETED.md` — Maverick sub-merchant provisioning + webhook

Each handoff file must record:
- Sandbox payment, refund, webhook cycle successful or not
- Environment variables set or not
- Typecheck, lint, build passed or not

---

## 🔍 Step 10: GitHub Code Review, Security, and Vulnerability Scan

After coding, perform the following steps on GitHub:

### 10.1 Create Pull Request
```bash
git checkout -b feature/payroc-maverick-integration
git add .
git commit -m "feat: add Payroc and Maverick acquiring processors"
git push origin feature/payroc-maverick-integration
```

Create a pull request on GitHub and assign reviewers.

### 10.2 Code Review Checklist
- Path comment on first line of every file (`// path: ...`)
- TypeScript strict mode enabled
- Zod validation on every form and API endpoint
- No real secrets in `.env` file (only in `.env.example`)
- Security headers set
- Rate limiting enabled

### 10.3 Security Scan Tools

**CodeQL (GitHub built-in):**
```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"
on:
  push:
    branches: [main, arena/02f9dca9-p6]
  pull_request:
    branches: [main, arena/02f9dca9-p6]
jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

**Secret Scanning:** Enable in GitHub repository Settings → Security → Secret scanning.

**Dependabot:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Gitleaks (optional):**
```bash
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
```

### 10.4 Dependency Vulnerability Scan
```bash
npm audit --audit-level=high
```

### 10.5 Production Deployment Gate
Set GitHub environment protection rules:
- Pull request approval required before deploying to production
- Code review approval from at least 2 reviewers
- Status checks must pass (typecheck, lint, build, test)

---

## 🏁 Step 11: Production Readiness Checklist

Verify all checklist items are true before going live:

| # | Checkpoint |
|---|-----------|
| 1 | All STEP 1-258 passed |
| 2 | Typecheck, lint, build passed |
| 3 | Unit tests passed |
| 4 | Sandbox payment, refund, webhook cycle successful |
| 5 | Webhook signature verification working |
| 6 | Idempotency key working |
| 7 | RLS enabled |
| 8 | Audit log active |
| 9 | SSL certificate active |
| 10 | Rate limiting enabled |
| 11 | No secrets in `.env` file |
| 12 | GitHub security scan passed |

---

## ❌ Errors to Avoid (Critical)

1. **Read the real API documentation:** Fill in `VERIFY` placeholders in templates by reading Payroc/Maverick official documentation during the coding session. Do not guess.
2. **Do not edit committed migrations:** Only append new migrations.
3. **Do not modify old STEPs:** STEP 1-250 must not be changed.
4. **Card data:** Platform server must never see PAN/expiry/CVV.
5. **Webhook signature:** Never process a webhook without verification.
6. **Environment variables:** Never put real values in Git repository.

---

## ✅ Definition of Done

- [ ] Signup page shows no compliance policies
- [ ] Signup page has only basic Terms of Service
- [ ] Business profile page shows no policies
- [ ] Policy acceptance page shows all 11 policies
- [ ] Submit button active only after all policies accepted
- [ ] `POST /api/v1/kyb/submit` returns `422` without policy acceptance
- [ ] Policy acceptance records `accepted_from_ip` and `user_agent`
- [ ] RLS enabled by `company_id`
- [ ] Audit log records policy acceptance and KYB submission
- [ ] Unit tests pass
- [ ] Migration is append-only, no old migration edited
- [ ] Payroc and Maverick adapters exist under `lib/payments/adapters/` (one file each)
- [ ] `docs/final/PROVIDER_DOCS.md` previous 5 provider documentations not deleted

---

**Give this prompt to the Arena.ai agent. If anything is unclear, stop and ask before writing code.**
