# Arena.ai Agent Coding Prompt — KD SOLUTION IT Payment Platform

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only  
**Status:** Authoritative implementation prompt  
**Owner:** Platform Team / Payments Squad

---

## 1. How to Use This Prompt

Copy this entire prompt into a new Arena.ai chat session. Also upload the following planning files to the coding repository (`kd-solution-it`) so the agent can reference them:

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `docs/final/STEP_PLAN_250.md` | Total 258 STEPs; STEP 251-258 for Payroc/Maverick |
| 2 | `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| 3 | `docs/final/API_CONTRACT.md` | Exact API endpoints and JSON formats |
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

1. Add **Payroc** and **Maverick** as new acquiring processors (STEP 251-258).
2. **Separate signup flow from KYB/KYC verification flow** — signup page collects only basic account information; compliance policies appear only before KYB/KYC verification submission.
3. **Never modify STEP 1-250** — step numbers, titles, ownership, and content remain intact.
4. New STEPs 251-258 are appended only at the end.
5. Webhooks and APIs must work reliably with real-time synchronization.
6. Code must pass GitHub code review, vulnerability scanning, and security checks.

---

## ⚠️ Mandatory Rules (Never Violate)

| # | Rule |
|---|------|
| 1 | **Do not modify STEP 1-250** — step numbers, titles, ownership, and content remain 100% intact. |
| 2 | **Do not edit any committed migration** — only append new migrations with the next unused number. |
| 3 | **Never store card data (PAN, expiry, CVV) on the platform server** — use provider-hosted fields only. |
| 4 | **Access tokens must be AES-256-GCM encrypted at rest** — encryption key exists only in environment variables. |
| 5 | **Accept webhooks only after signature verification** — otherwise return `401 Unauthorized`. |
| 6 | **No compliance policies on signup page** — only basic Terms of Service. |
| 7 | **Do not accept KYB submission without all policy acceptances** — return `422 Unprocessable Entity`. |
| 8 | **No real secrets in the Git repository** — only `.env.example` with placeholders. |
| 9 | **Maverick official documentation URL** — before writing Maverick adapter code, read Maverick's official documentation (maverick.com or official Maverick developer portal). Record the verified URL in `docs/final/PROVIDER_DOCS.md`. Do not guess API endpoints or field names. |

---

## 3. Database Schema Decision (Important)

**Decision:** Use CMS as policy content/version source (Option 2).

- The existing `cms_pages` table already stores versioned policy content.
- Do **not** create a separate `policy_versions` table.
- Create **only** one new table: `merchant_policy_acceptance` with these columns:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `company_id` UUID NOT NULL REFERENCES companies(id)
  - `cms_page_id` UUID NOT NULL REFERENCES cms_pages(id)
  - `policy_version` INTEGER NOT NULL (version from `cms_pages`)
  - `accepted_at` TIMESTAMPTZ DEFAULT now()
  - `accepted_from_ip` INET NOT NULL
  - `user_agent` TEXT
  - `created_at` TIMESTAMPTZ DEFAULT now()
- Enable Row Level Security (RLS) on `merchant_policy_acceptance` using `company_id`.
- Create a unique constraint on `(company_id, cms_page_id, policy_version)` to prevent duplicate acceptances.

---

## 4. 11 Required Policies

The following 11 policies must appear on the KYB acceptance page (sourced from `cms_pages`):

1. KYC and KYB Policy
2. UBO Policy
3. AML and CFT Policy
4. Sanctions and PEP Screening Policy
5. Underwriting and Risk Assessment Policy
6. Merchant Acceptance and Prohibited and Restricted Businesses Policy
7. Chargeback and Dispute Management Policy
8. Refund and Settlement Policy
9. Fraud and Risk Management Policy
10. Data Privacy and Security Policy
11. PCI-DSS Compliance Policy

---

## 5. Step-by-Step Implementation

### Step 1: Read Planning Documents

Read these files completely before writing code:

- `docs/final/STEP_PLAN_250.md` — Steps 251-258 for Payroc/Maverick
- `docs/final/FEATURE_LIST.md` — Section 6: Payment Processors (Seven)
- `docs/final/API_CONTRACT.md` — Exact API endpoints and JSON formats
- `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` — Signup vs verification flow
- `docs/planning/DATABASE_SETUP.md` — Supabase database setup plan

### Step 2: Database Migrations (Append-Only)

Create migration files in `migrations/` using the next unused migration number:

- Policy acceptance table migration
- Payroc adapter tables migration
- Maverick adapter tables migration

Do not edit committed migrations. Include `up` and `down` sections.

### Step 3: Payroc Adapter (STEP 251-254)

Create `lib/payments/adapters/payroc/payroc-adapter.ts`:

- AES-256-GCM encrypted key storage
- Connection test before enabling provider
- Payment acceptance: sale/authorization/capture/refund/void
- Sub-merchant provisioning with idempotent webhooks
- Read Payroc official documentation during coding session; fill in `VERIFY` placeholders

### Step 4: Maverick Adapter (STEP 255-258)

Create `lib/payments/adapters/maverick/maverick-adapter.ts`:

- Same pattern as Payroc
- Read Maverick official documentation during coding session
- Record verified Maverick documentation URL in `docs/final/PROVIDER_DOCS.md`

### Step 5: Payment Registry Update

Update `lib/payments/registry.ts`:

- Add `payroc` and `maverick` entries only
- Do not modify the existing 5 provider entries
- Pass credentials via `initializePaymentRegistry()`

### Step 6: Webhook Handlers

Create:
- `src/app/api/webhooks/payroc/[storeId]/route.ts`
- `src/app/api/webhooks/maverick/[storeId]/route.ts`

Requirements:
- Verify HMAC signature **before** parsing JSON body
- Idempotency check (same event ID processed once)
- Return `200 OK`

### Step 7: Environment Variables

`.env.example` must include:

```bash
PAYROC_API_KEY=your_payroc_api_key
PAYROC_API_SECRET=your_payroc_api_secret
PAYROC_MERCHANT_ID=your_payroc_merchant_id
PAYROC_WEBHOOK_SECRET=your_payroc_webhook_secret
PAYROC_ENV=sandbox

MAVERICK_CLIENT_ID=your_maverick_client_id
MAVERICK_CLIENT_SECRET=your_maverick_client_secret
MAVERICK_MERCHANT_ID=your_maverick_merchant_id
MAVERICK_WEBHOOK_SECRET=your_maverick_webhook_secret
MAVERICK_ENV=sandbox

ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
```

Never commit real secrets to Git.

### Step 8: Unit Tests

Test:
- Connection test success/failure
- Successful payment creation
- Failed payment handling
- Successful refund
- Valid/invalid webhook signatures
- Idempotency (duplicate event rejection)
- RLS (company data isolation)

### Step 9: Handoff Files

Create one handoff file per completed STEP:
- `docs/handoffs/STEP_251_COMPLETED.md` through `STEP_258_COMPLETED.md`

Record: sandbox payment/refund/webhook cycle results, environment variables set, typecheck/lint/build status.

### Step 10: GitHub Code Review and Security Scan

Create pull request on `feature/payroc-maverick-integration` branch.

Required checks:
- TypeScript strict mode
- Zod validation on all forms and APIs
- ESLint and Prettier pass
- Typecheck, lint, build pass
- Unit tests pass
- GitHub CodeQL enabled
- Dependabot enabled
- Secret scanning enabled
- No real secrets in commit history

### Step 11: Production Readiness Checklist

Verify all items before go-live:
- All STEPs 1-258 complete
- Sandbox payment/refund/webhook cycle successful
- Webhook signature verification working
- Idempotency working
- RLS enabled
- Audit log active
- SSL certificate active
- Rate limiting enabled
- No secrets in `.env` file
- GitHub security scans passed

---

## ✅ Definition of Done

- [ ] Signup page shows no compliance policies
- [ ] Signup page has only basic Terms of Service checkbox
- [ ] Business profile page shows no policies
- [ ] Policy acceptance page shows all 11 policies from `cms_pages`
- [ ] Submit button active only after all policies accepted
- [ ] `POST /api/v1/kyb/submit` returns `422` without all policy acceptances
- [ ] Policy acceptance records `cms_page_id`, `policy_version`, `accepted_from_ip`, `user_agent`
- [ ] RLS enabled by `company_id`
- [ ] Audit log records policy acceptance and KYB submission
- [ ] Unit tests pass
- [ ] Migrations are append-only
- [ ] Payroc and Maverick adapters under `lib/payments/adapters/` (one file each)
- [ ] Previous 5 provider documentations in `PROVIDER_DOCS.md` not deleted
- [ ] Maverick official documentation URL recorded in `docs/final/PROVIDER_DOCS.md`

---

**Give this prompt to the Arena.ai agent. If anything is unclear, stop and ask before writing code.**

---

এই প্রম্পটটি সম্পূর্ণ ইংরেজি, ব্যাকরণগতভাবে সঠিক এবং নিখুঁত। আপনি এটি অন্য চ্যাটে Arena.ai এজেন্টকে পাঠাতে পারেন।

এখন এই ফাইলটি গিটহাবে কমিট ও পুশ করছি:






<tool_call>
<function=bash>