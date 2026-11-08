# AI Agent Security Audit Guide — KD SOLUTION IT

**Branch:** `arena/02f9dca9-p6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Purpose:** Step-by-step instructions for an AI agent to audit payment platform code line-by-line, find security gaps, feature gaps, and bugs, then fix them.  
**Audience:** Arena.ai agent or human reviewer following this guide.

---

## Overview

This guide tells an AI agent exactly what to do, in what order, and how to report results. Follow all 6 phases in order. Do not skip any phase.

---

## Phase 1 — Pre-Audit Setup (Do First)

Before the AI agent reads any code, complete these steps:

### Step 1.1: Clone the coding repository

```bash
git clone https://github.com/kohinur169/kd-solution-it.git
cd kd-solution-it
git checkout feature/payroc-maverick-integration
```

### Step 1.2: Install dependencies

```bash
npm install
# or: yarn install
# or: pnpm install
```

### Step 1.3: Run baseline checks

```bash
# TypeScript typecheck
npx tsc --noEmit

# Lint
npx eslint .

# Tests
npm test
```

Record whether these pass or fail. If they fail, fix them before continuing.

### Step 1.4: Confirm planning files exist

In the planning repo (`/home/user/P6`), confirm these files are present:

| File | Purpose |
|------|---------|
| `docs/final/STEP_PLAN_250.md` | 258 total STEPs; STEP 251-258 for Payroc/Maverick |
| `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| `docs/final/API_CONTRACT.md` | Exact API endpoints and JSON formats |
| `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` | Signup vs KYB verification flow |
| `docs/planning/DATABASE_SETUP.md` | Supabase database setup plan |
| `docs/planning/AGENT_CODING_PROMPT.md` | Main coding prompt for AI agent |
| `docs/planning/PAYMENT_PROCESSOR_SANDBOX_REGISTRATION_GUIDE.md` | Sandbox links for all 7 processors |

---

## Phase 2 — Line-by-Line Security Audit

The AI agent must review **every file** in these directories:

| Directory | Files to Audit |
|-----------|---------------|
| `lib/payments/adapters/` | All 7 provider adapters: NMI, Payoneer, Rainforest, Stripe Connect, Airwallex, Payroc, Maverick |
| `lib/payments/registry.ts` | Payment provider registry |
| `src/app/api/webhooks/` | All webhook route handlers |
| `src/app/api/kyb/` | KYB policy acceptance endpoints |
| `src/app/api/auth/` | Signup, login, authentication |
| `src/app/api/payments/` | Payment, refund, void, capture |
| `middleware/` | Auth middleware, RBAC, RLS |
| `migrations/` | Database migration files |
| `.env.example` | Environment variable templates |

### For each file, check these 8 categories:

#### A. Authentication & Authorization
- [ ] Every API route requires valid authentication (session or JWT)
- [ ] Users can only access their own `company_id` data (company-scoped)
- [ ] Admin routes require admin role verification
- [ ] No hardcoded API keys, passwords, or secrets in source code
- [ ] Access tokens encrypted at rest (AES-256-GCM)
- [ ] Encryption key exists only in environment variables

#### B. Input Validation
- [ ] All request bodies validated with Zod schemas
- [ ] All query parameters validated
- [ ] No raw SQL string concatenation — use parameterized queries or ORM
- [ ] File uploads validated for type, size, and malware
- [ ] Webhook payloads validated before processing

#### C. Webhook Security
- [ ] HMAC signature verified **before** parsing JSON body
- [ ] Webhook timestamp tolerance checked (prevents replay attacks)
- [ ] Idempotency key checked — same event ID processed once only
- [ ] Webhook returns `200 OK` only after successful processing
- [ ] Invalid signatures return `401 Unauthorized`

#### D. Payment Data Security
- [ ] **Never** store card PAN, expiry, or CVV on platform servers
- [ ] Use provider-hosted fields (NMI Collect.js, Stripe Elements, etc.)
- [ ] Card data tokenized immediately — store token, not raw data
- [ ] Platform stays out of PCI-DSS scope for raw card data
- [ ] Refund/void operations require proper authorization

#### E. KYB/KYC Policy Flow (Critical)
- [ ] **Signup page shows NO compliance policies** — only email, password, name, phone, Turnstile, basic Terms of Service
- [ ] KYB verification page shows all 11 policies from `cms_pages`
- [ ] "Submit for Verification" button disabled until all 11 policies accepted
- [ ] `POST /api/v1/kyb/submit` returns `422` without all policy acceptances
- [ ] Policy acceptance records `cms_page_id`, `policy_version`, `accepted_from_ip`, `user_agent`
- [ ] RLS enabled on `merchant_policy_acceptance` by `company_id`

#### F. Dependencies & Supply Chain
- [ ] `npm audit` reports no known vulnerabilities
- [ ] GitHub Dependabot enabled
- [ ] No abandoned or unmaintained packages
- [ ] Lock file committed (`package-lock.json` or `yarn.lock`)

#### G. Secrets & Configuration
- [ ] `.env` not committed to Git (listed in `.gitignore`)
- [ ] `.env.example` contains only placeholders, no real values
- [ ] GitHub secret scanning enabled
- [ ] Gitleaks scan configured in CI/CD
- [ ] No connection strings with embedded passwords in code

#### H. Error Handling & Logging
- [ ] Errors do not leak stack traces to the client
- [ ] Sensitive data not logged (API keys, tokens, card data)
- [ ] All errors logged server-side with a request ID
- [ ] Webhook processing failures handled gracefully

---

## Phase 3 — Feature Gap Analysis

Compare the code against `docs/final/FEATURE_LIST.md` Section 6 and `docs/final/STEP_PLAN_250.md`:

| Check | Required | Status (Yes/No) | Notes |
|-------|----------|-----------------|-------|
| NMI adapter (STEP 147-152) | `lib/payments/adapters/nmi/` | | |
| Payoneer adapter (STEP 154-156) | `lib/payments/adapters/payoneer/` | | |
| Rainforest adapter (STEP 157-160) | `lib/payments/adapters/rainforest/` | | |
| Stripe Connect adapter (STEP 161-164) | `lib/payments/adapters/stripe-connect/` | | |
| Airwallex adapter (STEP 165-169) | `lib/payments/adapters/airwallex/` | | |
| Payroc adapter (STEP 251-254) | `lib/payments/adapters/payroc/` | | |
| Maverick adapter (STEP 255-258) | `lib/payments/adapters/maverick/` | | |
| Payment registry updated | `lib/payments/registry.ts` | | Add payroc + maverick only |
| Webhook handlers | `src/app/api/webhooks/` | | payroc + maverick |
| Database migrations | `migrations/` | | Append-only, new numbers |
| `.env.example` vars | `.env.example` | | payroc + maverick vars present |
| Signup page — no policies | Frontend signup | | Only basic Terms of Service |
| KYB page — 11 policies | Frontend KYB | | From `cms_pages` |
| `merchant_policy_acceptance` table | Database | | With RLS enabled |
| Unit tests pass | `npm test` | | All adapters tested |
| Handoff files | `docs/handoffs/` | | STEP_251_COMPLETED.md ... STEP_258_COMPLETED.md |

---

## Phase 4 — Bug & Error Fix Workflow

When the AI agent finds a security gap, feature gap, or bug:

### Step 4.1: Document the issue

Create or update `docs/handoffs/BUG_REPORT.md` with this format:

```markdown
## Bug Report — <Date>

| # | File | Line | Issue Type | Severity | Description | Required Fix |
|---|------|------|------------|----------|-------------|--------------|
| 1 | lib/payments/adapters/payroc/payroc-adapter.ts | 42 | security | high | API key stored in plaintext | Move to env var, encrypt at rest |
| 2 | src/app/api/kyb/submit/route.ts | 15 | compliance | critical | Missing all-11-policies check | Add Zod validation for all policies |
| 3 | src/app/api/webhooks/payroc/route.ts | 8 | security | high | Webhook body parsed before signature check | Verify HMAC before parsing |
```

Issue types: `security`, `feature-gap`, `bug`, `compliance`  
Severity: `critical`, `high`, `medium`, `low`

### Step 4.2: Apply fixes

Rules for fixing:
- **Do not modify STEP 1-250** — step numbers, titles, and content remain intact
- **Do not edit committed migrations** — append new migrations with next unused number
- **Do not store real secrets in Git** — use `.env.example` placeholders only
- All changes must pass: typecheck, lint, and tests

### Step 4.3: Commit fixes

```bash
git add <changed-files>
git commit -m "fix: <short description>

Files: <file paths>
Severity: <critical/high/medium/low>
STEP: <step number if applicable>"
```

### Step 4.4: Create pull request

Create PR on branch `feature/payroc-maverick-integration`. Required checks before merge:

- [ ] TypeScript strict mode
- [ ] Zod validation on all forms and APIs
- [ ] ESLint and Prettier pass
- [ ] Typecheck, lint, build all pass
- [ ] Unit tests pass
- [ ] GitHub CodeQL scan passed
- [ ] Dependabot alerts reviewed
- [ ] Secret scanning passed
- [ ] No real secrets in commit history

---

## Phase 5 — Production Readiness Verification

Before go-live, confirm every item:

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
- [ ] ESLint and Prettier pass
- [ ] Typecheck, lint, build all pass
- [ ] Unit tests pass

---

## Phase 6 — How to Give This to an AI Agent

Copy the text below and paste it into a new Arena.ai chat session:

---

**PASTE THIS INTO ARENA.AI:**

You are an expert payment platform security auditor. Your task is to audit the KD SOLUTION IT payment platform codebase line-by-line.

**Repository:** https://github.com/kohinur169/kd-solution-it  
**Branch:** feature/payroc-maverick-integration

Follow this exact process:

**Phase 1 — Setup:**
1. Clone the repo and checkout the branch.
2. Run `npm install`, `tsc --noEmit`, `eslint .`, and `npm test`.
3. Record pass/fail for each.

**Phase 2 — Line-by-Line Security Audit:**
Review every file in:
- `lib/payments/adapters/`
- `lib/payments/registry.ts`
- `src/app/api/webhooks/`
- `src/app/api/kyb/`
- `src/app/api/auth/`
- `src/app/api/payments/`
- `middleware/`
- `migrations/`
- `.env.example`

Check these 8 categories: Authentication, Input Validation, Webhook Security, Payment Data Security, KYB/KYC Policy Flow, Dependencies, Secrets, Error Handling.

**Critical KYB rules:**
- Signup page: NO compliance policies. Only email, password, name, phone, Turnstile, basic Terms of Service.
- KYB page: Show all 11 policies from `cms_pages`.
- Submit button disabled until all 11 accepted.
- `POST /api/v1/kyb/submit` returns 422 without all policies.

**Phase 3 — Feature Gap Analysis:**
Compare against STEP_PLAN_250.md and FEATURE_LIST.md Section 6. Confirm all 7 adapters exist and are implemented.

**Phase 4 — Bug Reporting:**
Document all findings in `docs/handoffs/BUG_REPORT.md` using the table format.

**Phase 5 — Fixing:**
Fix all critical and high issues. Do not modify STEP 1-250. Do not edit committed migrations. Do not store real secrets in Git.

**Phase 6 — Verification:**
Run typecheck, lint, build, and tests. All must pass.

Report your findings clearly. Stop and ask if anything is unclear before writing code.

---

**END OF PASTE**

---

## Important Warnings

| Warning | Reason |
|---------|--------|
| Maverick sandbox is on-request only | Contact Maverick support at maverickpayments.com/developers before STEP 255-258 testing |
| Rainforest sandbox requires support contact | Email Rainforest support for sandbox merchant configuration |
| Never use real card data in sandbox | Use provider-supplied test card numbers only |
| Never commit `.env` with real values | Only `.env.example` with placeholders |
| Do not modify STEP 1-250 | Append new STEPs only; never renumber |

---

এই গাইডলাইন অনুসরণ করলে AI এজেন্ট সহজ ও সঠিকভাবে লাইন-বাই-লাইন কোড অডিট করে সিকিউরিটি গ্যাপ, ফিচার গ্যাপ এবং বাগ খুঁজে বের করতে পারবে এবং ফিক্স করবে।