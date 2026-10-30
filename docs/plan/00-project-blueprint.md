// path: docs/plan/00-project-blueprint.md

# 00 - PROJECT BLUEPRINT

## 1. Product definition

KD SOLUTION IT is a multi-tenant SaaS platform for invoicing, payments, payroll,
accounting and business management. The platform is also a Merchant of Record
(MoR) and a payment facilitator: a verified tenant can be provisioned as a
sub-merchant under the platform master accounts of supported providers.

- Base currency: USD. All money stored as `numeric(18,4)`. All arithmetic through
  a decimal library (`decimal.js`). JavaScript `Number` is never used for money.
- Language: English only. ASCII only in code, UI, comments, seeds, documents.
- Text and structured data: Supabase PostgreSQL.
- Files: Google Drive when the tenant has a connected Drive; otherwise Supabase
  Storage. Decision is made at runtime per tenant. Every file is AES-256-GCM
  encrypted before upload. Every file record stores `storage_provider`.
- Tenancy: single database, shared schema, `company_id` on every tenant table,
  RLS enabled with default-deny on every table.

## 2. Architecture layers

```
app/            Next.js App Router (public, auth, dashboard, admin, client portal, api)
services/       Business logic. No HTTP, no React. Transaction boundaries live here.
lib/            Cross-cutting: supabase, auth, security, payment, storage, email, crypto
config/         Static registries: nav-map, permissions, plans, payment-methods countries
schemas/        Zod schemas shared by client and server
types/          Generated database types plus domain types
components/     UI primitives and feature components
migrations/     SQL migrations with matching down migrations
workers/ cron/  Queue processors and scheduled handlers
docs/           Architecture, plans, runbooks, ADRs, provider verification records
handoffs/       One handoff document per completed step
```

Rule: `app/` never talks to the database directly for writes. Route handlers and
server actions validate with Zod, sanitize, then call a service. Services own
transactions, audit writes, idempotency and optimistic locking.

## 3. Invariants applied to every file

1. First line of every file: `// path: <relative-path>`.
2. TypeScript strict, no `any`, explicit return types on exported functions.
3. No `console.log`. Structured logger only (`lib/logging/logger.ts`).
4. No test files, no `TODO`, no `FIXME`, no `Coming Soon`, no placeholder copy.
5. Every mutation: Zod validation (client and server), sanitization, audit log row,
   correlation ID, and either an idempotency key or a documented reason not to need one.
6. Every editable record: `version` column and optimistic locking on update.
7. Every monetary value: `numeric(18,4)`, `Decimal` in code, string in JSON
   boundary, never `Number`.
8. Every provider brand name in the restricted list is replaced by
   "Global Payout Partners" or "Local Payment Methods via Licensed Partners".
9. Every externally reachable endpoint: rate limit, CSRF protection for
   cookie-authenticated state changes, origin check, and structured error envelope.
10. Fail closed: if a required secret, provider, or verification record is missing,
    the feature is disabled and the request is rejected with a typed error.

## 4. Standard request envelope

Every API route returns:

```
{ "data": <payload> | null,
  "error": { "code": string, "message": string, "details": unknown, "correlation_id": string } | null,
  "meta": { "request_id": string, "timestamp": string, "version": number | null } }
```

Error codes live in `lib/errors/codes.ts` (owned by STEP 01). A code is added once
and never renamed.

## 5. Standard table contract

```
id            uuid primary key default uuid_generate_v7()
company_id    uuid not null references companies(id)   -- nullable only for platform tables
created_at    timestamptz not null default now()
updated_at    timestamptz not null default now()
deleted_at    timestamptz null
version       integer not null default 0               -- editable tables
```

Plus: RLS enabled with a default-deny policy, an audit trigger, a partial unique
index that ignores soft-deleted rows, an index on `company_id`, and an index on
`created_at`.

Platform-level tables (plans, providers, cms, audit) set `company_id` nullable and
use a platform-scope policy instead of a tenant-scope policy.

## 6. Environment variables (names only, values never in the repository)

Core: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`DATABASE_URL`, `ENCRYPTION_MASTER_KEY`, `ENCRYPTION_KEY_VERSION`,
`AUDIT_SIGNING_KEY`, `SESSION_DEVICE_SECRET`, `CSRF_SECRET`, `CRON_SECRET`,
`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SENTRY_DSN`,
`IP_INTEL_PROVIDER`, `IP_INTEL_API_KEY`, `SMTP_*` (platform and tenant defaults),
`GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`,
`WHATSAPP_*`, `STRIPE_*`, `PAYPAL_*`, `NMI_*`, `ADYEN_*`, `RAPYD_*`, and one
group per remaining provider.

Provider API keys entered through the super admin console are stored encrypted in
`payment_provider_credentials` (AES-256-GCM, key from environment). They are
never returned to the browser; only a masked suffix and `last_updated_at` are
exposed.

## 7. Storage resolution rule

```
if tenant.storage_mode == 'google_drive' and drive connection healthy -> google_drive
else if tenant.storage_mode == 'google_drive' and fallback allowed   -> supabase
else                                                                  -> supabase
```

`storage_mode` is `auto | google_drive | supabase`. `auto` means Drive when a
connection exists, otherwise Supabase. Every file row records the provider that
actually stored it, so a later move is a data operation, not a guess. The move
tool is `scripts/storage-migrate.ts` plus a service function; it is idempotent,
resumable and writes an audit row per file.

## 8. Roles and authority

`super_admin > ceo > admin_staff > owner > staff`. Clients never log in; they use
HMAC tokenized links.

`admin_staff` sub-roles: `kyc_reviewer`, `payment_processor`, `support_agent`,
`content_manager`, `compliance_officer`, `fraud_analyst`, `finance_analyst`.

Approval levels: L1 staff request, L2 CEO approval, L3 super_admin approval.
Critical actions require dual approval (CEO plus super_admin). Every approval
transition is audited and stored in `approval_requests` with SLA and escalation.

## 9. Payment architecture summary

- 16 adapters, one file per provider, one registry file.
- Adapter contract in `lib/payment/adapters/base.ts` (owned by STEP 09).
- Provider mode (for example NMI `collect_js` vs `payment_component`) is stored in
  `payment_provider_settings`; only one mode is active per provider at a time;
  a mode switch requires a successful test and writes an audit row.
- An adapter that has no `docs/providers/<provider>/VERIFICATION.md` record cannot
  be enabled. The registry returns `adapter_not_verified` and the payment is
  rejected, not rerouted.
- Routing is deterministic. If no route matches, the payment is rejected.

## 10. Definition of done pointer

Every step finishes with `docs/plan/09-handoff-and-definition-of-done.md` checks,
a handoff document in `handoffs/`, and a git tag `step-XX-done`.
