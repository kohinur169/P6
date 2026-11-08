# Arena.ai Agent Coding Prompt — KD SOLUTION IT Payment Platform

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English  
**Status:** Authoritative implementation prompt  
**Owner:** Platform Team / Payments Squad

---

## 1. How to Use This Prompt

Copy this entire prompt into a new Arena.ai chat session. Upload all planning files from `/home/user/P6/docs/planning/` and `/home/user/P6/docs/final/` to the coding repository `kd-solution-it` so the agent can reference them.

---

## 2. Objective

The agent must:

1. Add **Payroc** and **Maverick** as new acquiring processors (STEP 251-258).
2. **Separate signup flow from KYB/KYC verification flow.**
   - **Signup page:** email, password, name, phone number, Cloudflare Turnstile, basic Terms of Service checkbox ONLY. NO compliance policies.
   - **KYB/KYC verification page:** AFTER signup (on business profile/verification page). Shows 11 compliance policies from `cms_pages`. User must accept ALL before "Submit for Verification" button becomes active. On submission, record acceptance in `merchant_policy_acceptance` table.
3. **Never modify STEP 1-250.**
4. **Append new STEPs 251-258 only at the end.**
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
| 6 | **NO compliance policies on signup page** — only basic Terms of Service checkbox. |
| 7 | **Do not accept KYB submission without all policy acceptances** — return `422 Unprocessable Entity`. |
| 8 | **No real secrets in the Git repository** — only `.env.example` with placeholders. |
| 9 | **Maverick official documentation URL** — The user will provide this separately. Do NOT block implementation waiting for it. Use placeholder comments where Maverick API details are needed. |

---

## 3. Signup Page — Required Fields Only

**Page:** `/signup`  
**Allowed fields:**

| Field | Type | Required |
|-------|------|----------|
| Email | email | Yes |
| Password | password | Yes |
| Full Name | text | Yes |
| Phone Number | tel | Yes |
| Cloudflare Turnstile | widget | Yes |
| Terms of Service | checkbox | Yes (basic ToS only) |

**Forbidden on signup page:** KYC/KYB Policy, UBO Policy, AML/CFT Policy, Sanctions/PEP Screening, Underwriting/Risk Assessment, Merchant Acceptance, Chargeback/Dispute, Refund/Settlement, Fraud/Risk Management, Data Privacy/Security, PCI-DSS Compliance.

None of these 11 policies may appear on the signup page. They appear ONLY on the KYB verification page.

---

## 4. KYB/KYC Verification Page

**Page:** `/kyb-verification` (after signup, on business profile)  
**Source:** All 11 policies loaded from `cms_pages` table.

**Required behavior:**

1. Display all 11 policies from `cms_pages`:
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

2. Each policy has an acceptance checkbox (read the full policy text, then check).

3. **"Submit for Verification" button** is disabled until ALL 11 checkboxes are checked.

4. On submission (`POST /api/v1/kyb/submit`):
   - Validate that all 11 policies are accepted.
   - If any missing → return `422 Unprocessable Entity`.
   - If all accepted → insert into `merchant_policy_acceptance` table.

---

## 5. Database Schema Decision

**Decision:** Use CMS as policy content/version source (Option 2).

- Existing `cms_pages` table stores versioned policy content. Do NOT create a separate `policy_versions` table.
- Create **only** one new table: `merchant_policy_acceptance`:

```sql
CREATE TABLE merchant_policy_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    cms_page_id UUID NOT NULL REFERENCES cms_pages(id),
    policy_version INTEGER NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT now(),
    accepted_from_ip INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, cms_page_id, policy_version)
);
```

- Enable Row Level Security (RLS) on `merchant_policy_acceptance` using `company_id`.

---

## 6. 11 Required Policies

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

## 7. Step-by-Step Implementation

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

### Step 4: Maverick Adapter (STEP 255-258)

Create `lib/payments/adapters/maverick/maverick-adapter.ts`:

- Same pattern as Payroc
- Use placeholder comments where Maverick API details are needed
- User will provide Maverick documentation URL separately

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
- KYB policy acceptance validation (all 11 required)

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

- [ ] Signup page shows NO compliance policies
- [ ] Signup page has only: email, password, name, phone, Turnstile, basic Terms of Service
- [ ] Business profile page shows NO policies
- [ ] Policy acceptance page shows all 11 policies from `cms_pages`
- [ ] Submit button active only after all policies accepted
- [ ] `POST /api/v1/kyb/submit` returns `422` without all policy acceptances
- [ ] Policy acceptance records `cms_page_id`, `policy_version`, `accepted_from_ip`, `user_agent`
- [ ] RLS enabled by `company_id`
- [ ] Audit log records policy acceptance and KYB submission
- [ ] Unit tests pass
- [ ] Migrations are append-only
- [ ] Payroc and Maverick adapters under `lib/payments/adapters/` (one file each)
- [ ] Previous 5 provider documentations not deleted
- [ ] Maverick placeholder comments where API details unknown (user will provide docs URL separately)

---

**Give this prompt to the Arena.ai agent. If anything is unclear, stop and ask before writing code.**

---

এই প্রম্পটটি সম্পূর্ণ ইংরেজি, ব্যাকরণগতভাবে সঠিক এবং নিখুঁত। এখন এজেন্ট সাইনআপ পেজে কোনো কমপ্লায়েন্স পলিসি বসাবে না, এবং KYB পেজে শুধু ১১ টি পলিসি দেখাবে।

এখন এই ফাইলটি গিটহাবে কমিট ও পুশ করছি:

<tool_call>
<function=bash>