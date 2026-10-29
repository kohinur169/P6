// path: docs/final/MASTER_PROMPT.md
# KD SOLUTION IT - Master Prompt for Every Coding Chat

You are building KD SOLUTION IT, an enterprise multi-tenant SaaS payment facilitator
platform. Read docs/final/FEATURE_LIST.md in full before writing anything. That feature
list is the single source of truth for scope. Implement exactly the features in it,
completely, with production quality.

## Absolute Rules
1. English only in code, UI, comments, seeds, templates, file names and content strings.
   All user facing strings live in lib/i18n/strings/en.ts.
2. USD only. Money is numeric(18,4) in the database. Money math uses a decimal library only.
3. Text and structured data live in Supabase PostgreSQL. Files live in the storage of the
   hosting environment through the storage adapter layer. Every file is AES-256-GCM
   encrypted before upload and every file record stores storage_provider.
4. No test files of any kind. No TODO, FIXME or placeholder text anywhere.
5. TypeScript strict mode everywhere. No any types. No console.log; use structured logging.
6. Every file starts with a path comment: // path: followed by the file path.
7. Every table has id UUID v7, company_id, created_at, updated_at, deleted_at and version.
8. RLS is enabled with a default-deny policy on every table.
9. Every mutation writes an audit log entry.
10. Every form and API input is validated with Zod on client and server.
11. Every input is sanitized against XSS, SQL injection, CSRF, SSRF and header injection.
12. Every payment carries an idempotency key.
13. Every editable record uses optimistic locking through the version column.
14. Roles: super_admin, ceo, compliance_kyc, finance_ops, support, blogger, owner.
    Clients use tokenized links only. Approval chain: requester, CEO, super_admin.
15. Partner display naming uses Global Payout Partners and Local Payment Methods via Licensed Partners.
16. Zero Trust and Zero Tolerance security on every layer.
17. Performance: paginated lists, selected columns only, joined queries, no query in a loop,
    indexes on lookup columns, caching for public and summary data, heavy work in background jobs.

## Stack
Next.js 14+ App Router with Server Components, TypeScript strict, Tailwind CSS, shadcn/ui,
Supabase PostgreSQL with Auth and RLS, storage adapters for the hosting environment,
payment adapters for NMI, Payoneer, Rainforest, Stripe Connect and Airwallex,
TaxCloud for United States sales tax calculation, KYC adapters for Jumio, Didit and Sumsub
with manual KYC as the running mode until one is connected and activated,
universal email through SMTP or API provider, Cloudflare Turnstile, DOMPurify,
nonce-based CSP, Sentry, deployable on Vercel and Netlify.

## Provider Documentation Rule
Before coding a payment or verification adapter, fetch and read the provider's latest
official documentation and sandbox or testing pages from the provider's own website in the
same coding session. Record the verified documentation and sandbox URLs in the adapter file
header and in docs/final/PROVIDER_DOCS.md. Code from the documentation, never from memory.

## Working Method for Each Chat
- One chat implements exactly one STEP from docs/final/STEP_PLAN_250.md.
- At the start, pull the latest branch and read docs/final/FEATURE_LIST.md,
  docs/final/MASTER_PROMPT.md, docs/final/STEP_PLAN_250.md and the previous STEP handoff file.
- Work only on the files owned by that STEP. Never edit files owned by another STEP.
- Migrations are append-only, numbered in order, never edited after commit, each with a rollback.
- package.json is integrator-owned. When a package is needed, write a package request into
  the handoff file instead of editing package.json.
- At the end of the chat: run typecheck and lint, commit with the message format
  "STEP NNN: title", push the branch, and create docs/handoffs/STEP_NNN_COMPLETED.md listing
  files created, migrations added, environment variables added, packages requested and the
  next STEP dependency.
- Never start STEP N+1 before the handoff of STEP N exists.
