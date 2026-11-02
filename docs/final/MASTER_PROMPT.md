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
Supabase PostgreSQL with Auth and RLS, Supabase Storage and Amazon S3 object storage through the storage adapter layer selected by environment configuration,
payment adapters for NMI, Payoneer, Rainforest, Stripe Connect and Airwallex,
TaxCloud for United States sales tax calculation, optional supplementary identity-verification adapters for Jumio, Didit and Sumsub, with at most one active; the contracted payment processor remains authoritative for its own KYB/KYC and verification status,
universal email through SMTP or API provider, Cloudflare Turnstile, DOMPurify,
nonce-based CSP, Sentry, deployable on Vercel and Netlify.

## Provider Documentation Rule
Before coding a payment or verification adapter, fetch and read the provider's latest
official documentation and sandbox or testing pages from the provider's own website in the
same coding session. Record the verified documentation and sandbox URLs in the adapter file
header and in docs/final/PROVIDER_DOCS.md. Code from the documentation, never from memory.

## Working Method for Each Chat
- These documents live inside the project repository: docs/final/FEATURE_LIST.md,
  docs/final/MASTER_PROMPT.md and docs/final/STEP_PLAN_250.md. The owner selects this
  repository when opening a coding chat, so the agent reads everything from the repository
  itself. The owner does not paste any instruction block.
- The owner sends exactly one STEP number per message, for example `Implement STEP 001`.
  The same chat session may contain many such messages in sequence (for example STEP 001,
  then STEP 002, continuing through STEP 040). Never ask the owner to combine them into a
  range, and never begin another STEP without the owner's next explicit one-STEP request.
- Complete each requested STEP fully before waiting for the next message. After every five
  completed low/medium-risk STEPs, give a concise progress checkpoint in the same chat. Database
  migrations, authentication/security, money/ledger, KYC, provider, payout and production-release
  STEPs each require their own verification checkpoint. Continue in the same session only while
  context, access and verification remain sound; otherwise stop at the last completed handoff.
- On receiving the request, before writing any code:
  1. Read docs/final/FEATURE_LIST.md in full.
  2. Read this MASTER_PROMPT.md in full.
  3. Parse the one STEP number in the owner's latest message. Verify it is STEP 001 if the
     selected fresh repository has no handoffs, or the next uncompleted STEP on a resumed branch.
  4. Read that exact STEP block and its ownership rules.
  5. Read the preceding handoff when it exists.
  6. Pull/inspect the latest state of the working branch before coding.
- Each user message authorizes exactly its named STEP. Work only on that STEP's owned paths
  (plus explicitly listed narrow exceptions), complete its ordered sub-steps, run required checks,
  create its individual commit and handoff, then report completion and wait for the owner's next
  single-STEP message. A later user message may arrive in the same chat; re-read the latest handoff
  and branch state before continuing. Never mix STEPs into one commit or one handoff.
- Migrations are append-only, numbered in order, never edited after commit, each with a rollback.
- package.json is integrator-owned. When a package is needed, write a package request into
  the handoff file instead of editing package.json.
- STEP 001 creates the docs/handoffs/ folder. Every chat copies
  docs/final/HANDOFF_TEMPLATE.md to docs/handoffs/STEP_NNN_COMPLETED.md and fills every
  field, including the acceptance checklist for that STEP, files created, migrations added,
  environment variables added, packages requested, proof results and the next STEP dependency.
- Steps run strictly in numeric order. A STEP depends on every earlier STEP in its own
  category and on the handoff files of those STEPs. A later category may start only when
  the previous category handoff files all exist.
- At the end of every STEP (not merely at the end of the chat): run that STEP's required
  typecheck, lint, build and behavior checks, commit with `STEP NNN: title`, push, and include
  its completed handoff file in the same commit. In a multi-STEP session, reload/check the
  branch and read the just-written handoff before beginning STEP N+1.
- Never begin STEP N+1 until the owner explicitly requests it after STEP N's verification,
  commit, push and handoff all succeeded. If any check fails, stop and report the exact failed
  STEP; do not proceed until the owner requests a fix.
- Completed STEP commits, handoffs and migrations are immutable. Before resuming any existing
  project, inspect the selected branch's contiguous handoff sequence and latest commit to find
  the next uncompleted STEP; do not infer progress from chat statements. In a genuinely new
  implementation repository with no completed handoffs, start at STEP 001. Never skip a STEP,
  reopen a completed STEP or edit a committed migration. Any new schema uses a new append-only
  migration with rollback, after inspecting the repository's actual migration inventory.
- If anything in the STEP conflicts with FEATURE_LIST.md, FEATURE_LIST.md wins and the
  conflict must be written into the handoff file. For approved scope amendments, the current
  FEATURE_LIST.md and STEP_PLAN_250.md supersede only the advisory “Next STEP” title in an
  older completed handoff; never edit that completed handoff or its underlying completed work.
- Ownership/permission prompt protocol: first compare the requested path with the STEP-specific
  File Ownership Rules. If the path is explicitly listed as a narrow exception, it is authorized
  only for that STEP and only for the stated behavior; record the exact path and reason in the
  handoff. If no exception covers it, do not edit. In Arena's permission card, use “Revise
  options or write your own…” and submit the exact paths plus reasons and the allowed boundary;
  do not treat a generic “Allow necessary shared changes” click as blanket permission. If the
  custom-text field is unavailable, stop and ask in chat before making that edit. After approval,
  edit only those listed paths and no others.
- Before coding, verify all six authoritative files are accessible under docs/final/ and the
  root README identifies them as the only active scope and workflow instructions. For the new
  implementation repository, include the complete docs/planning/ archive bundle and its README
  because the owner requested the full planning history; do not copy old application code,
  migrations, handoffs, or conflicting root specifications. Mark every docs/planning document as
  historical/background. It may be consulted for rationale, but never followed as instructions
  or used to override docs/final/. FEATURE_LIST.md governs scope, MASTER_PROMPT.md governs method,
  and STEP_PLAN_250.md governs step order/ownership. If any archive banner, README or final file
  is missing or conflicts with that authority order, stop before coding and ask the owner.

## Production Readiness Rules (apply to every STEP)
- Definition of done for every STEP: the implemented scope works end to end, typecheck
  passes, lint passes, and the production build passes for the touched area. A STEP that
  fails any of these is not complete and its handoff must say so.
- Every STEP that adds a database migration must run the migration and its rollback on a
  clean database and record the result in the handoff file.
- Every STEP that touches money must prove balanced double-entry ledger postings for its
  flows and record the proof in the handoff file.
- Every STEP that touches a provider must complete a sandbox cycle (payment, refund where
  supported, and webhook delivery) and record the provider documentation URLs, the sandbox
  URLs and the sandbox result in the handoff file.
- For merchant onboarding, keep processor KYB/KYC status separate from optional Jumio/Didit/Sumsub IDV. Never let platform IDV override a processor restriction or rejection, and never treat an unavailable or unresolved check as a pass.
- Risk-tier, sanctions, re-KYC, transaction review and payout code must fail closed on unknown/stale status. Payout requires persisted fulfilment proof, applicable post-fulfilment delay, provider eligibility, verified bank and all risk/hold/dispute gates. Manual review above USD 5,000 must block capture until approved.
- CEO and super_admin risk-policy edits must be versioned, effective-dated, audited and approved by distinct authorized actors; policy changes are prospective and cannot silently weaken a transaction's captured policy version. Support cannot perform KYC approval, tier policy changes or payout release.
- Risk policy values and their definitions (monthly period, chargeback denominator/window/sample minimum, completed order and fulfilment evidence) must be explicit. An unset value or unresolved case fails closed; stricter overlapping limits win.
- Every STEP that adds an environment variable must add it to .env.example with a
  description and must read it through the validated environment schema only.
- No secret, key, token or credential may appear in code, commits, logs, error messages
  or handoff files.
- Every STEP must keep the performance rules: paginated lists, selected columns, joined
  queries, no queries in loops, background jobs for heavy work.
- The final STEP verifies the full go-live gate lists in FEATURE_LIST.md sections 33 and 34 on
  staging before any production switch is recommended.

## Acceptance Checklist Required in Every Handoff
- The exact behaviours named in the STEP title were exercised manually on staging or in
  sandbox and the observed result is written in the handoff.
- For UI STEPs: desktop and mobile widths were checked, keyboard navigation works, and
  text is readable in light and dark themes.
- For API STEPs: success, validation failure, unauthorized and cross-tenant requests were
  exercised and the results are written in the handoff.
- For money STEPs: the ledger entries created by the flow are shown balanced in the handoff.
- A STEP is not complete while any item of this checklist is unproven.
