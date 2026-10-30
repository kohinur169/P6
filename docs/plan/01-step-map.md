// path: docs/plan/01-step-map.md

# 01 - STEP MAP (16 STEPS, 16 CHATS)

One step per chat. Each step is executed sub-step by sub-step inside that chat.
Every sub-step ends with a commit. No step starts before the previous step's
handoff document exists and the launch gate of that step is green.

Legend for the ownership column: `D` = directories the step may create or edit,
`T` = migration range it may use, `A` = API route namespace it owns.

---

## STEP 01 - FOUNDATION, GOVERNANCE AND DESIGN SYSTEM

Depends on: nothing. Blocks: everything.

Purpose: create the repository skeleton that makes every later rule enforceable
by tooling instead of by discipline.

Sub-steps:
- 01.1 Repository skeleton, `package.json`, `tsconfig.json` (strict), path aliases.
- 01.2 `next.config.js`, `middleware.ts` scaffold, route groups for public, auth,
  dashboard, admin and client portal, root layout, error and not-found boundaries.
- 01.3 Lint and format stack: ESLint with `no-explicit-any`, `no-console`,
  non-ASCII blocker, Tailwind, Prettier, Husky pre-commit and commit-msg.
- 01.4 Guard scripts: `scripts/check-english-only.sh`, `check-no-tests.sh`,
  `check-no-todo.sh`, `check-no-coming-soon.sh`, `check-money-number.sh`,
  `check-path-comment.sh`. All wired into `npm run verify`.
- 01.5 Config registries created empty but typed: `config/nav-map.ts`,
  `config/permissions.ts`, `config/plans.ts`, `config/payment-methods.ts`,
  `config/countries.ts`, `config/feature-flags.ts`.
- 01.6 Core libraries: `lib/logging/logger.ts`, `lib/errors/*`, `lib/http/*`
  (envelope, correlation id, handler wrapper), `lib/env.ts` (Zod env schema),
  `lib/utils/currency.ts`, `lib/utils/date.ts`, `lib/utils/id.ts`, `lib/utils/hash.ts`.
- 01.7 Design system: tokens, Tailwind theme, shadcn/ui base components, theme
  provider, brand logo and favicon components, motion primitives, table and form
  primitives, four-state page components (loading, error, empty, success).
- 01.8 Layouts: public shell, auth shell, dashboard shell, admin shell, client
  portal shell, mobile navigation, breadcrumbs, command palette skeleton.
- 01.9 Observability bootstrap: `instrumentation.ts`, Sentry wiring, health route,
  security headers and CSP nonce plumbing.

Ownership: D `app/(public)`, `app/(auth)` shells, `components/ui`, `components/layout`,
`config/*`, `lib/logging`, `lib/errors`, `lib/http`, `lib/env.ts`, `lib/utils`,
`styles`, `scripts`, `.github/workflows/ci.yml`, `.husky`, root config files.
T `0000` only.
A `app/api/health/`.

Acceptance gate: `npm run verify` passes on an empty feature surface; all six guard
scripts fail correctly when a violation is introduced deliberately in a scratch
branch; health route returns envelope; CSP nonce present on every response.

---

## STEP 02 - DATABASE CORE: TENANCY, RLS, AUDIT, IDEMPOTENCY, JOB QUEUE

Depends on: 01. Blocks: all data work.

Sub-steps:
- 02.1 Migration tooling: sequence naming, up and down files, idempotent guards,
  apply and rollback scripts, checksum table.
- 02.2 Extensions and primitives: `uuid_generate_v7()`, `set_updated_at()`,
  `bump_version()`, `soft_delete()`, `pg_advisory_xact_lock` helpers,
  `current_company_id()`, `current_user_id()`, `is_platform_role()`.
- 02.3 Identity tables: `companies`, `users`, `memberships`, `staff_permissions`,
  `role_enum`, `admin_staff_role_enum`.
- 02.4 Audit core: `audit_logs` with sequence number, previous hash, current hash,
  signature, `correlation_id`; append-only policies; per-table audit trigger
  function; `audit_anchors` for daily Merkle roots.
- 02.5 RLS framework: default-deny template, tenant-scope policy, platform-scope
  policy, service-role bypass policy, policy test matrix documented.
- 02.6 Integrity primitives: `idempotency_keys`, `request_log`, `outbox_events`,
  `job_queue` (FOR UPDATE SKIP LOCKED), `job_runs`, `rate_limits`,
  `duplicate_fingerprints`.
- 02.7 Settings and configuration tables: `app_settings`, `feature_flags`,
  `tenant_security_policies`, `number_sequences`.
- 02.8 Seeds: role catalogue, default security policy, default number sequences,
  default job definitions. Idempotent, ASCII only.
- 02.9 ERD document and migration runbook.

Ownership: D `migrations/**` (except step 01 file), `seeds/**`, `lib/supabase/**`,
`lib/db/**`, `types/database.ts`, `docs/ERD.md`.
T `0001 - 0099`.

Acceptance gate: every created table has columns contract, RLS, audit trigger and
indexes; rollback of the whole range restores an empty schema; RLS matrix test
script proves tenant A cannot read tenant B.

---

## STEP 03 - IDENTITY AND ACCESS: AUTH, SESSION PROOF (LR-022), LOGIN LOCK, RBAC, APPROVAL ENGINE

Depends on: 02.

Sub-steps:
- 03.1 Supabase Auth wiring: browser, server, admin clients; cookie handling;
  email verification; password policy; account enumeration prevention.
- 03.2 Session architecture (LR-022): server-side `sessions`, device secret,
  device proof HMAC, token rotation with reuse detection, absolute and idle
  expiry, `auth_level` and step-up timestamps, session list and revocation API.
- 03.3 CSRF and cookie hardening: `__Host-` cookies, same-site enforcement,
  double-submit token, `Origin` and `Sec-Fetch-Site` validation, cookie scope
  without session rejection rule.
- 03.4 Login lock: `login_attempts`, `account_locks`, 2 failures to 120 minute
  lock, applies to password and 2FA, survives password reset, owner email alert,
  privileged unlock workflow with contact verification and audit.
- 03.5 2FA: TOTP enrolment with recovery codes, mandatory for every staff role,
  step-up reauthentication table for sensitive actions, OAuth social login.
- 03.6 Network intelligence: VPN, proxy, Tor and datacenter detection adapter,
  decision matrix per action, admin whitelist, IP rate limiting.
- 03.7 RBAC: `lib/auth/roles.ts`, `lib/auth/permissions.ts`, permission guards for
  server components, route handlers and server actions, deny-by-default.
- 03.8 Approval engine: `approval_requests`, levels L1-L3, dual approval,
  delegation, SLA, escalation job, approval inbox API and audit of every transition.
- 03.9 Auth UI: login, signup, verify, 2FA challenge, forgot and reset, lock page,
  session manager page.

Ownership: D `app/(auth)/**`, `lib/auth/**`, `lib/security/network-intel.ts`,
`lib/security/csrf.ts`, `services/auth/**`, `services/approval/**`,
`app/api/auth/**`, `app/api/sessions/**`, `app/api/approvals/**` (engine only),
`components/auth/**`.
T `0100 - 0149`.

Acceptance gate: stolen cookie without device proof is rejected; replayed rotated
token revokes the family; third failed attempt after lock is rejected even with the
correct password; every auth event appears in `audit_logs`.

---

## STEP 04 - TENANT LIFECYCLE: ONBOARDING, COMPANY SETTINGS, TEAM, PLANS, ENTITLEMENTS

Depends on: 03.

Sub-steps:
- 04.1 Signup flow with Turnstile, VPN and proxy block, company creation,
  idempotent onboarding state machine.
- 04.2 Onboarding wizard: company profile, industry presets, branding, invoice
  settings, first-run experience.
- 04.3 Company settings: profile, addresses, tax identity, branding per tenant,
  invoice defaults, custom domain record and verification job.
- 04.4 Team management: staff invite, role assignment, permission editor, staff
  activity monitoring, staff security policy.
- 04.5 Plans, coupons and subscription tables plus platform entitlement engine:
  `plans`, `subscriptions`, `coupons`, `entitlements`, `usage_counters`.
- 04.6 Entitlement enforcement middleware and UI gating components.
- 04.7 Notification system: in-app notifications, preferences, event catalogue.
- 04.8 One-click backup request flow (records only; execution in step 16).

Ownership: D `app/(dashboard)/onboarding/**`, `app/(dashboard)/settings/**`,
`app/(dashboard)/team/**`, `services/tenant/**`, `services/entitlement/**`,
`services/notification/**`, `app/api/team/**`, `app/api/settings/**`,
`app/api/tenant/**`, `components/onboarding/**`, `components/settings/**`.
T `0150 - 0199`.

Acceptance gate: two tenants cannot see each other's settings; plan limits enforced
server-side and in UI; every settings change writes audit and bumps `version`.

---

## STEP 05 - COMMUNICATION LAYER: UNIVERSAL SMTP, TEMPLATES, NOTIFICATIONS, DELIVERABILITY

Depends on: 03, 04.

Sub-steps:
- 05.1 Mail adapter contract and providers: Resend, SendGrid, SES, Mailgun,
  Postmark, Brevo, generic SMTP. Platform level and tenant level.
- 05.2 Credential storage for SMTP (AES-256-GCM), connection test, fallback chain.
- 05.3 Queue, retry with backoff, bounce and complaint processing, suppression list.
- 05.4 Template engine: database templates, variable schema, preview, versioning,
  per-tenant override, English only validation.
- 05.5 Transactional catalogue: verification, invite, invoice, reminder, receipt,
  payment failure, dispute, payroll, security alert, lock alert, unlock notice.
- 05.6 Deliverability: SPF, DKIM, DMARC guidance records, warm-up plan, rate caps,
  unsubscribe and consent handling.
- 05.7 Outbound API and admin email template manager UI.
- 05.8 WhatsApp and SMS channel interfaces declared here, implemented in step 14.

Ownership: D `lib/email/**`, `emails/**`, `services/email/**`,
`app/api/email/**`, `app/api/webhooks/email/**`, `components/email/**`,
`app/(admin)/emails/**`.
T `0200 - 0229`.

Acceptance gate: every outbound mail is queued, retried, logged and suppressible;
tenant SMTP failure falls back to platform SMTP; no template contains non-ASCII.

---

## STEP 06 - STORAGE ABSTRACTION, FILE SECURITY AND KYC VERIFICATION

Depends on: 02, 03, 04.

Sub-steps:
- 06.1 Storage adapter contract with `google_drive` and `supabase` implementations.
- 06.2 AES-256-GCM envelope encryption, per-tenant key derivation (HKDF), key
  versioning and rotation, streaming encrypt and decrypt.
- 06.3 Runtime routing per tenant with health check, automatic fallback, and
  `storage_provider` persisted per file.
- 06.4 Upload pipeline: MIME sniffing, magic bytes, size caps, image re-encode,
  malware scan hook, EXIF strip, antivirus verdict, signed access URLs.
- 06.5 File registry, deduplication by content hash, lifecycle rules, retention
  and secure deletion.
- 06.6 Migration tool between Drive and Supabase with resumable checkpoints.
- 06.7 KYC submission: document types, liveness and selfie capture, consent,
  encrypted upload, status machine.
- 06.8 KYC review console: queue, reviewer assignment, decision, rejection reason,
  resubmission, approval chain to CEO then super_admin.
- 06.9 KYC-gated feature switches and verified badge propagation to sub-merchant
  provisioning trigger.

Ownership: D `lib/storage/**`, `lib/encryption/**`, `services/storage/**`,
`services/kyc/**`, `app/api/storage/**`, `app/api/kyc/**`, `app/(admin)/kyc/**`,
`app/(dashboard)/verification/**`, `scripts/storage-migrate.ts`.
T `0230 - 0269`.

Acceptance gate: Drive disconnected tenants still upload successfully; every stored
object is ciphertext; encryption key never leaves environment; KYC approval emits
the provisioning event exactly once.

---

## STEP 07 - CRM, CATALOG, INVENTORY, SUPPLIERS, PROJECTS AND TIME TRACKING

Depends on: 02, 04.

Sub-steps:
- 07.1 Clients: CRUD, profile, contacts, addresses, tags, search and filter,
  merge and duplicate detection, activity timeline, statement view.
- 07.2 Products and services catalogue, price books, tax codes, units.
- 07.3 Inventory: stock levels, warehouses, movements, adjustments, transfers,
  valuation method, low stock alerts, inventory documents.
- 07.4 Suppliers, purchase orders, supplier bills and payments.
- 07.5 Projects, tasks, time tracking, billable hours to invoice conversion.
- 07.6 Dashboard home for tenant: revenue overview, charts, summary cards,
  customization per user, four states for every widget.
- 07.7 Tenant reports foundation: sales, payment, expense, client, inventory,
  project, report export and scheduling hooks.
- 07.8 E-commerce sync interfaces declared (Shopify, WooCommerce) for step 14.

Ownership: D `services/client/**`, `services/product/**`, `services/inventory/**`,
`services/supplier/**`, `services/project/**`, `app/(dashboard)/clients/**`,
`app/(dashboard)/products/**`, `app/(dashboard)/inventory/**`,
`app/(dashboard)/suppliers/**`, `app/(dashboard)/projects/**`,
`app/(dashboard)/page.tsx` dashboard widgets, `app/api/clients/**`,
`app/api/products/**`, `app/api/inventory/**`, `app/api/suppliers/**`,
`app/api/projects/**`, `components/client/**`, `components/charts/**`.
T `0270 - 0329`.

Acceptance gate: duplicate client creation is blocked by fingerprint; stock cannot
go negative without an explicit adjustment record; every list has four states and
works at 320px width.

---

## STEP 08 - INVOICING CORE, DOCUMENT SUITE AND PDF ENGINE

Depends on: 06, 07.

Sub-steps:
- 08.1 Invoice schema: documents, line items, taxes, discounts, totals snapshot.
- 08.2 Gapless numbering with advisory lock, prefix and suffix patterns,
  per-tenant sequences, void handling.
- 08.3 Calculation engine: decimal-only, rounding policy, tax inclusive and
  exclusive, per-line and document discounts, foreign display currency with frozen
  rate snapshot.
- 08.4 Invoice state machine: draft, pending approval, sent, viewed, partial,
  paid, overdue, void, disputed; allowed transitions enforced in service layer.
- 08.5 Document suite: estimate, credit note, debit note, proforma, deposit
  invoice, recurring invoice, instalment plan, retainer.
- 08.6 Approval and send workflow: staff draft, owner approval, owner-only send.
- 08.7 PDF engine: server-side rendering, US-style professional layout, templates,
  branding auto-fill, print CSS, A4 and Letter, watermark for void.
- 08.8 Immutable snapshot: hash, storage upload, download route, verification tool.
- 08.9 Billing lifecycle: reminders, late fees, dunning schedules, batch and bulk
  operations, duplicate invoice detection.

Ownership: D `services/invoice/**`, `services/document/**`, `services/pdf/**`,
`lib/pdf/**`, `pdf-templates/**`, `app/(dashboard)/invoices/**`,
`app/(dashboard)/estimates/**`, `app/api/invoices/**`, `app/api/pdf/**`,
`components/invoice/**`, `components/pdf/**`.
T `0330 - 0369`.

Acceptance gate: 10 concurrent invoice creations produce a gap-free sequence;
totals are byte-identical between preview, PDF and ledger; voided invoice retains
its snapshot; no `Number` used for money anywhere in the diff.

---

## STEP 09 - PAYMENTS I: GATEWAY FRAMEWORK, 16 ADAPTERS, NMI DUAL MODE, CREDENTIAL CONSOLE, CARD RULES, 3DS

Depends on: 02, 03, 06, 08.

Sub-steps:
- 09.1 Adapter contract, registry, capability matrix, mode enum, error taxonomy.
- 09.2 Documentation verification protocol and folder scaffolding; no adapter is
  written before its verification record exists.
- 09.3 Adapters batch A: Stripe, PayPal, Braintree, Authorize.Net.
- 09.4 Adapters batch B: NMI (Collect.js and Payment Component modes), Adyen,
  Rapyd, Square.
- 09.5 Adapters batch C: Verifone (2Checkout), BlueSnap, Payoneer, Payarc.
- 09.6 Adapters batch D: Paddle, FastSpring, PayPro Global, Custom HTTPS gateway.
- 09.7 Super admin credential console: enter, encrypt, test, enable or disable a
  provider without deployment; step-up reauthentication; masked display only;
  adapter-exists guard; successful test required before enable.
- 09.8 Routing engine: deterministic rules, tenant and invoice constraints, mode
  selection, fail-closed on no match.
- 09.9 Payment execution: idempotency keys, retries, state machine, receipts,
  partial payments and allocation, surcharge and fees.
- 09.10 Hosted checkout, payment links, embedded SDK and iframe integration modes.
- 09.11 Webhooks: signature verification per provider, replay window, idempotent
  processing, ordering tolerance, dead letter and replay tool.
- 09.12 Card rules: tokenization only, per-invoice 24 hour single-card rule,
  failure counters, blacklist by token and fingerprint, velocity limits, 3DS
  policy with postal code and IP country matching, manual review queue.
- 09.13 Refunds, void, chargeback intake, payment reports and reconciliation view.

Ownership: D `lib/payment/**`, `services/payment/**`, `app/(admin)/gateways/**`,
`app/api/payments/**`, `app/api/webhooks/**`, `app/(dashboard)/payments/**`,
`components/payment/**`, `docs/providers/**`.
T `0370 - 0419`.

Acceptance gate: every adapter compiles against the contract and returns typed
errors; enabling a provider without verification record is impossible; duplicate
webhook delivery changes nothing twice; card data never reaches our server.

---

## STEP 10 - PAYMENTS II: MoR, SUB-MERCHANT PROVISIONING, WALLET, PAYOUTS, DISPUTES, TAX ENGINE

Depends on: 09.

Sub-steps:
- 10.1 MoR model: platform as seller of record, contract records, ledger split.
- 10.2 Sub-merchant provisioning orchestrator: verification event to provider
  sub-account, idempotent job, retry, manual fallback queue, capability sync.
- 10.3 Provider-specific sub-merchant adapters for providers that support it.
- 10.4 Requirements loop: provider requirement collection, evidence upload,
  deadline tracking, suspension and reinstatement.
- 10.5 Virtual wallet, platform fee deduction, hold period, balance ledger.
- 10.6 Payout engine: payout requests, approval chain, batch processing, status
  reconciliation, payout statements.
- 10.7 Chargebacks and disputes: intake, evidence pack generator, representment
  tracking, loss accounting.
- 10.8 Consent and delivery evidence chain, immutable payment audit chain.
- 10.9 Tax engine: tax rates, jurisdictions, product tax codes, nexus and threshold
  tracking, exemption certificates, tax calculation service, tax transaction ledger.
- 10.10 Tax reporting and filing worksheets, MoR tax liability report.
- 10.11 Client subscription billing for tenant customers, dunning, BNPL interfaces.
- 10.12 Payment security analytics: gateway health, success rate, fraud signals.

Ownership: D `services/mor/**`, `services/wallet/**`, `services/payout/**`,
`services/dispute/**`, `services/tax/**`, `app/(admin)/payouts/**`,
`app/(admin)/disputes/**`, `app/(dashboard)/wallet/**`, `app/api/wallet/**`,
`app/api/payouts/**`, `app/api/tax/**`, `app/api/sub-merchants/**`,
`app/(admin)/sub-merchants/**`.
T `0420 - 0459`.

Acceptance gate: verifying a tenant creates exactly one sub-merchant account per
provider, retries are idempotent, requirements expiry suspends collection, tax is
computed with decimal precision and stored per line, payout cannot exceed available
balance.

---

## STEP 11 - CLIENT PORTAL AND TOKENIZED JOURNEYS

Depends on: 08, 09.

Sub-steps:
- 11.1 Token service: HMAC signing, rotation, scopes, expiry, single-use actions.
- 11.2 Token pages: invoice view, payment, estimate approval, receipt, client hub,
  contract signing, expired page.
- 11.3 Security gate: optional PIN or email OTP, rate limits, bot defense, token
  leak detection, referrer policy, no-index headers.
- 11.4 Client email journey: send, reminder, receipt, statement, dispute notice.
- 11.5 Tenant branding applied to portal, white-label tiers, custom domain routing.
- 11.6 Document workflow: approval trail, e-signature capture with evidence hash.
- 11.7 Client data quality UX: merge requests, deduplication prompts, timeline.
- 11.8 Accessibility, mobile behaviour and four states for every portal page.

Ownership: D `app/(client-portal)/**`, `services/token/**`,
`services/client-portal/**`, `app/api/portal/**`, `components/portal/**`.
T `0460 - 0489`.

Acceptance gate: token reuse beyond scope is rejected; portal renders without login;
payment from portal reuses step 09 rules; every token access is audited.

---

## STEP 12 - PAYROLL AND HR

Depends on: 04, 06, 13 table interfaces reserved in 12.1.

Sub-steps:
- 12.1 Employee profiles, departments, designations, contracts, documents.
- 12.2 Salary structures, components, attendance inputs, proration.
- 12.3 Payroll tax rules engine (configurable per jurisdiction), statutory
  deductions, employer contributions.
- 12.4 Pay run processing: draft, preview, approval chain, lock, reversal.
- 12.5 Payslip generation and delivery, employee self-service token portal.
- 12.6 Payroll to accounting journal interface (posted by step 13).
- 12.7 Leave and attendance management, balances, accrual rules.
- 12.8 Payroll payments and payout integration with step 10.
- 12.9 Payroll reports, compliance files, audit pack.

Ownership: D `services/payroll/**`, `services/hr/**`, `app/(dashboard)/payroll/**`,
`app/(dashboard)/hr/**`, `app/api/payroll/**`, `app/api/hr/**`,
`components/payroll/**`.
T `0490 - 0549`.

Acceptance gate: payroll totals reconcile to payslips and journal draft; locked pay
run is immutable; self-service tokens expire and are scoped.

---

## STEP 13 - ACCOUNTING, FINANCIAL STATEMENTS, TAX FILING AND REPORTING

Depends on: 08, 09, 10, 12.

Sub-steps:
- 13.1 Chart of accounts, account types, opening balances, multi-entity support.
- 13.2 Journal entries: manual, reversal, recurring, attachments, approval.
- 13.3 Automated journals from invoices, payments, expenses, payroll, payouts.
- 13.4 Financial statements: profit and loss, balance sheet, cash flow, equity,
  trial balance, comparative periods.
- 13.5 Bank reconciliation: statement import, matching rules, adjustment entries.
- 13.6 Expenses module with policies, receipts, approvals, recurring expenses.
- 13.7 Fixed assets, depreciation schedules, disposal.
- 13.8 Budgets and variance analysis.
- 13.9 Period close, lock, reopening with approval, closing checklist.
- 13.10 Tax filing workspace connected to the step 10 tax engine.
- 13.11 Reporting and business intelligence: saved reports, scheduling, exports,
  forecast and cash flow projection.

Ownership: D `services/accounting/**`, `services/report/**`,
`app/(dashboard)/accounting/**`, `app/(dashboard)/expenses/**`,
`app/(dashboard)/reports/**`, `app/api/accounting/**`, `app/api/reports/**`,
`components/accounting/**`.
T `0550 - 0619`.

Acceptance gate: debits equal credits per entry and per period; statements tie to
ledger; closed period rejects postings; every report reconciles to source tables.

---

## STEP 14 - INTEGRATIONS AND AUTOMATION

Depends on: 05, 07, 08, 11.

Sub-steps:
- 14.1 WhatsApp Cloud API: configuration, templates, sending, delivery tracking,
  inbound replies, consent and compliance.
- 14.2 Social platform adapters, composer, scheduler, approval flow, analytics.
- 14.3 Public REST API v1: keys, scopes, rate limits, pagination, idempotency,
  OpenAPI document, developer portal.
- 14.4 Outbound webhooks with signing, retries and delivery log.
- 14.5 Automation ecosystem: Zapier, Make, Chrome extension endpoints.
- 14.6 Bank feeds and transaction import with smart reconciliation.
- 14.7 Receipt OCR and smart entry.
- 14.8 Contracts and e-signature service shared with step 11.
- 14.9 Multi-channel messaging router and campaigns.
- 14.10 E-commerce sync: Shopify and WooCommerce order to invoice.
- 14.11 Support: help centre, tickets, feedback and NPS.
- 14.12 Migration wizard for import from other platforms.

Ownership: D `lib/whatsapp/**`, `lib/social/**`, `lib/integrations/**`,
`lib/ocr/**`, `services/whatsapp/**`, `services/social/**`, `services/webhook/**`,
`services/support/**`, `services/import/**`, `app/api/public/v1/**`,
`app/api/whatsapp/**`, `app/api/social/**`, `app/api/integrations/**`,
`app/(dashboard)/support/**`, `app/(admin)/support/**`.
T `0620 - 0669`.

Acceptance gate: API key scoped requests cannot cross tenants; outbound webhook
signature verifies; WhatsApp send respects consent and template state.

---

## STEP 15 - ADMIN CONSOLE, CMS, SEO, ANALYTICS AND MARKETING

Depends on: 04, 05, 11, 14.

Sub-steps:
- 15.1 Admin dashboard, user and tenant management, impersonation with audit and
  banner, admin communication tools.
- 15.2 Plan, subscription and coupon management UI.
- 15.3 CMS for every public page, blog, categories, revisions, scheduling.
- 15.4 SEO: metadata, eight JSON-LD schemas, sitemap, robots, audit report,
  search engine verification.
- 15.5 Analytics and pixels: GA4, GTM, Meta, others, consent gating.
- 15.6 Conversion optimisation: A/B tests, trust signals, calculators, free tools.
- 15.7 Marketing automation: campaigns, drip sequences, lead capture.
- 15.8 Public site pages: all public routes, legal, support, pricing, features,
  industries, status page.
- 15.9 Platform intelligence: revenue analytics, tenant intelligence, health.
- 15.10 Platform engineering tools: background job monitor, config manager,
  feature flags UI, monitoring dashboards.
- 15.11 Growth and retention tools, lifecycle and offboarding flows.
- 15.12 First-run platform setup wizard and health checks.

Ownership: D `app/(admin)/**` except kyc, gateways, payouts, disputes,
sub-merchants, `app/(public)/**`, `lib/seo/**`, `lib/analytics/**`,
`lib/cms/**`, `services/cms/**`, `services/marketing/**`, `services/admin/**`,
`components/admin/**`, `components/marketing/**`.
T `0670 - 0699`.

Acceptance gate: every public page is CMS editable and English only; JSON-LD
validates; CMS change is audited and versioned.

---

## STEP 16 - SECURITY HARDENING, COMPLIANCE, DEPLOY, CI/CD AND LAUNCH GATE

Depends on: 09, 10, 13, 15 and all previous.

Sub-steps:
- 16.1 Full security audit against `07-security-zero-trust-lr022.md`, with a
  written finding list and fixes for each finding.
- 16.2 Fraud engine: risk scoring, behaviour analytics, anomaly detection,
  device tracking, IP and network tracking, account fraud rules.
- 16.3 Immutable audit completion: hash chain verification cron, anchor upload,
  SIEM forwarder adapters, tamper alerting.
- 16.4 Compliance: GDPR, CCPA, PDPA, data classification, retention, DSAR handler,
  consent manager, cookie policy, data residency configuration.
- 16.5 Compliance evidence: PCI scope statement and SAQ records, security page,
  trust centre content, sub-processor list.
- 16.6 Performance: budgets, caching, image pipeline, bundle analysis, query
  tuning, load test record.
- 16.7 Reliability: cron catalogue, dead man switch, backup and restore scripts,
  disaster recovery runbook and drill record.
- 16.8 Deployment: Netlify configuration, Docker and compose alternative, nginx,
  environment matrix, migration gate, rollback procedure.
- 16.9 CI/CD: lint, type-check, guard scripts, SAST, dependency audit, secret scan,
  build, preview deploy, production gate, CODEOWNERS and PR template.
- 16.10 Monitoring and incident response: Sentry release tracking, uptime checks,
  alert routing, incident runbooks, status page automation.
- 16.11 Documentation completion: README, SECURITY, CONTRIBUTING, CHANGELOG, ERD,
  ADR set, API reference, runbooks, operator manual.
- 16.12 Launch gate execution and signed readiness record.

Ownership: D `.github/**`, `.husky/**`, `docker/**`, `netlify.toml`,
`instrumentation.ts`, `lib/security/**` completion, `lib/compliance/**`,
`cron/**`, `workers/**`, `scripts/backup.sh`, `scripts/restore.sh`,
`docs/RUNBOOKS/**`, `docs/ADR/**`, `SECURITY.md`, `CONTRIBUTING.md`,
`README.md`, `CHANGELOG.md`, `docs/API.md`, `app/(admin)/health/**`.
T `0700 - 0749`.

Acceptance gate: launch checklist is 100 percent green, zero open critical finding,
production deploy reproducible from a clean clone, rollback rehearsed.

---

## Dependency order and safe parallelism

```
01 -> 02 -> 03 -> 04 -> 05
                     \-> 06 -> 08 -> 09 -> 10 -> 11
             04 -> 07 --------/                  |
                                   12 -> 13 -----+
                                                   14 -> 15 -> 16
```

Safe parallel pairs when two chats run at once: 05 with 07, 06 with 07,
12 with 11. All other combinations are sequential.

## Migration ranges (reserved, non-overlapping)

| Step | Range | Step | Range |
| --- | --- | --- | --- |
| 01 | 0000 | 09 | 0370 - 0419 |
| 02 | 0001 - 0099 | 10 | 0420 - 0459 |
| 03 | 0100 - 0149 | 11 | 0460 - 0489 |
| 04 | 0150 - 0199 | 12 | 0490 - 0549 |
| 05 | 0200 - 0229 | 13 | 0550 - 0619 |
| 06 | 0230 - 0269 | 14 | 0620 - 0669 |
| 07 | 0270 - 0329 | 15 | 0670 - 0699 |
| 08 | 0330 - 0369 | 16 | 0700 - 0749 |
