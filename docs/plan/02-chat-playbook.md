// path: docs/plan/02-chat-playbook.md

# 02 - CHAT PLAYBOOK (CONTROLLED PROMPTS FOR 16 CHATS)

Rules of use:

1. One chat implements one step. Never two steps in one chat.
2. Paste block A at the top of every chat, then the block for that step.
3. Inside the chat, execute sub-steps one at a time using block C.
4. End the chat with block D. Do not close a chat before the handoff exists.
5. If an answer is cut off, send block C for the next sub-step. Never restart a step.

---

## BLOCK A - UNIVERSAL PREAMBLE (paste first in every chat)

```
PROJECT: KD SOLUTION IT - enterprise multi-tenant SaaS invoicing, payments, payroll
and accounting platform for the Asian market.

Read before writing any code, in this order:
1. docs/plan/README.md
2. docs/plan/00-project-blueprint.md
3. docs/plan/01-step-map.md
4. docs/plan/03-ownership-and-conflict-prevention.md
5. docs/plan/07-security-zero-trust-lr022.md
6. docs/plan/10-decision-register.md
7. MASTER_PROMPT .md and FEATURE_LIST.md

Absolute rules that apply to every file you write:
- English only, ASCII only. No other script anywhere, including comments and seeds.
- USD only. Money is numeric(18,4) in PostgreSQL and a decimal library in code.
  Never use JavaScript Number for money.
- Text data in Supabase PostgreSQL. Files in Google Drive when connected, otherwise
  Supabase Storage, chosen at runtime per tenant, AES-256-GCM encrypted, with
  storage_provider recorded per file.
- No test files. No TODO, FIXME, Coming Soon or placeholder text. No any types.
- No console.log. Structured logger only.
- First line of every file: // path: <relative path>
- Every table: id (UUID v7), company_id, created_at, updated_at, deleted_at,
  RLS enabled with a default-deny policy, audit trigger, version column when editable.
- Every mutation: Zod validation on client and server, sanitization, audit log row,
  correlation id, idempotency key or a documented reason it is not needed,
  optimistic locking when the record is editable.
- Roles: super_admin > ceo > admin_staff > owner > staff. Clients use tokenized
  links and never log in. Approval chain staff -> CEO -> super_admin.
- Payment partner brand names from the restricted list are never used. Use
  "Global Payout Partners" or "Local Payment Methods via Licensed Partners".
- Zero trust, zero tolerance. VPN, proxy and Tor blocking applies to signup,
  payment, KYC and admin actions. Fail closed when a required control is missing.

Repository discipline:
- Work only inside the directories, API namespaces, tables and migration range
  assigned to this step in docs/plan/03-ownership-and-conflict-prevention.md.
- Never recreate something that already exists. Search the repository first.
- Never edit a registry file owned by another step. Record the needed change in the
  handoff document under CHANGE REQUESTS.
- Conventional commits. One commit per sub-step. Run npm run verify before commit.
```

---

## BLOCK B - STEP KICKOFF BLOCKS

### STEP 01
```
This chat implements STEP 01 of 16: FOUNDATION, GOVERNANCE AND DESIGN SYSTEM.
Scope: sub-steps 01.1 to 01.9 exactly as written in docs/plan/01-step-map.md.
Own: app route-group shells, components/ui, components/layout, config/*,
lib/logging, lib/errors, lib/http, lib/env.ts, lib/utils, styles, scripts,
.github/workflows/ci.yml, .husky, root config files. Migration range 0000 only.
Do not create any domain table, any payment adapter, any feature page.
Deliver: a repository where npm run verify enforces every absolute rule with real
scripts, a health endpoint that returns the standard envelope, security headers with
CSP nonce, and the full design token layer.
Do not describe the plan again. Write the files.
```

### STEP 02
```
This chat implements STEP 02 of 16: DATABASE CORE.
Scope: sub-steps 02.1 to 02.9. Migration range 0001 to 0099 only.
Own: migrations, seeds, lib/supabase, lib/db, types/database.ts, docs/ERD.md.
Do not create invoice, payment, payroll or accounting tables. Those belong to later
steps. Create only identity, tenancy, audit, idempotency, queue, rate limit,
settings and sequence primitives.
Every migration needs an up file and a down file, must be idempotent, and must be
covered by the rollback script.
Deliver the RLS policy framework, the audit trigger, and a documented matrix that
proves tenant isolation before this step closes.
```

### STEP 03
```
This chat implements STEP 03 of 16: IDENTITY AND ACCESS.
Scope: sub-steps 03.1 to 03.9. Migration range 0100 to 0149.
Implement LR-022 exactly as specified in docs/plan/07-security-zero-trust-lr022.md:
server-side sessions, device proof, rotating tokens with reuse detection, cookie
scope rejection, reauthentication table, revocation, audit protection.
Implement the login lock: two consecutive wrong passwords or wrong 2FA codes lock
the account for 120 minutes, the lock is database-backed, survives restart and
password reset, alerts the owner by email, and requires a privileged unlock after
email contact verification with an audit row.
Implement the approval engine, RBAC guards and VPN, proxy and Tor decisions for
signup, payment, KYC and admin actions.
```

### STEP 04
```
This chat implements STEP 04 of 16: TENANT LIFECYCLE.
Scope: sub-steps 04.1 to 04.8. Migration range 0150 to 0199.
Own onboarding, company profile and settings, branding per tenant, team management,
plans, coupons, subscriptions, entitlement engine, in-app notifications.
Do not implement the email transport, KYC review or custom domain job runner;
declare the interfaces and record a CHANGE REQUEST instead.
Server-side entitlement enforcement is mandatory: a gated feature must be
unreachable through the API even when the UI hides it.
```

### STEP 05
```
This chat implements STEP 05 of 16: COMMUNICATION LAYER.
Scope: sub-steps 05.1 to 05.8. Migration range 0200 to 0229.
Own lib/email, emails, services/email, email API and webhooks, admin template
manager. Platform SMTP plus tenant SMTP with encrypted credential storage,
fallback chain, queue with retry and suppression, template engine with English-only
validation, and the full transactional catalogue used by later steps.
Do not implement WhatsApp sending here; only the channel interface.
```

### STEP 06
```
This chat implements STEP 06 of 16: STORAGE AND KYC.
Scope: sub-steps 06.1 to 06.9. Migration range 0230 to 0269.
Implement the runtime storage decision: Google Drive when the tenant connection is
healthy, otherwise Supabase Storage, with automatic fallback and storage_provider
persisted per file. AES-256-GCM envelope encryption with per-tenant key derivation
before any upload. Upload pipeline with MIME and magic byte validation, size caps,
image re-encode, EXIF strip and malware scan hook.
Implement the storage migration tool with resumable checkpoints.
Implement KYC submission, review console, approval chain, and the single
idempotent event that triggers sub-merchant provisioning in STEP 10.
```

### STEP 07
```
This chat implements STEP 07 of 16: CRM, CATALOG, INVENTORY, SUPPLIERS, PROJECTS.
Scope: sub-steps 07.1 to 07.8. Migration range 0270 to 0329.
Own client, product, inventory, supplier, project and time tracking services,
their dashboard pages and APIs, plus the tenant dashboard widgets and the report
foundation.
Duplicate detection is mandatory on clients, products, suppliers and inventory
movements. Stock can never go negative without an explicit adjustment record.
Every list and every widget implements loading, error, empty and success states and
works at 320 pixels width.
```

### STEP 08
```
This chat implements STEP 08 of 16: INVOICING CORE AND PDF ENGINE.
Scope: sub-steps 08.1 to 08.9. Migration range 0330 to 0369.
Gapless numbering through a PostgreSQL advisory lock. Decimal-only calculation,
with the rounding policy stated in code and applied identically in preview, PDF and
ledger. Full document suite: invoice, estimate, credit note, debit note, proforma,
deposit, recurring, instalment.
US-style professional invoice layout that a US marketplace reviewer accepts.
Immutable snapshot per issued document: hash, upload to the resolved storage
provider, verification tool.
No money arithmetic with Number anywhere in this step.
```

### STEP 09
```
This chat implements STEP 09 of 16: PAYMENTS I.
Scope: sub-steps 09.1 to 09.13. Migration range 0370 to 0419.
All 16 adapters, one file each, one registry file: Stripe, NMI, Adyen,
Verifone (2Checkout), Braintree, BlueSnap, Square, Payoneer, FastSpring, Paddle,
PayPro Global, PayPal, Payarc, Rapyd, Authorize.Net, Custom.
Before writing any adapter, read that provider's current official documentation
from its own site and write docs/providers/<provider>/VERIFICATION.md with the
fetched urls, api version, auth scheme, endpoint list, webhook signature scheme,
test data source, 3DS parameters and capture and refund flow. No verification record
means the adapter cannot be enabled and the payment is rejected, never rerouted.
NMI has two front-end modes: Collect.js as the default, and Payment Component which
requires an npm package that the integrator must add. Both modes share one server
module and the NMI REST API. Only one mode is active per provider, switching
requires a successful test, and every switch is audited.
Implement the super admin credential console: enter, encrypt, test, enable or
disable any provider without a deployment, step-up reauthentication required,
masked display only, adapter-exists guard, no enable without a successful test.
Implement routing that fails closed, webhook signature verification with idempotent
processing, and the full card rule set: tokenization only, one card per invoice per
24 hours after success, two card or authentication failures on one token in 24
hours blocks the third attempt, balance failures excluded, blacklist by token and
fingerprint, velocity limits, 3DS preference, and manual review when postal code and
IP country do not both match the invoice.
```

### STEP 10
```
This chat implements STEP 10 of 16: PAYMENTS II.
Scope: sub-steps 10.1 to 10.12. Migration range 0420 to 0459.
Merchant of Record model with ledger split, sub-merchant provisioning orchestrated
from the KYC approval event, per-provider sub-merchant adapters where the provider
supports it, requirement collection loop, virtual wallet, payout engine with
approval chain, chargeback and dispute handling with evidence packs, consent and
delivery evidence, tax engine with jurisdictions, product tax codes, thresholds,
exemption certificates, tax ledger and filing worksheets, plus client subscription
billing for tenant customers.
Provisioning must be idempotent: one sub-merchant account per tenant per provider,
retries safe, manual fallback queue when the provider call fails or the capability
is missing.
```

### STEP 11
```
This chat implements STEP 11 of 16: CLIENT PORTAL.
Scope: sub-steps 11.1 to 11.8. Migration range 0460 to 0489.
Tokenized, login-free access with HMAC tokens, scoped and expiring, single-use for
state-changing actions, with leak detection and no-index headers.
Pages: invoice view, payment, estimate approval, receipt, client hub, contract
signing, expired. Optional access gate with PIN or email OTP.
Tenant branding and white-label tiers applied to the portal. Client email journey.
E-signature with evidence hash. Every token access is audited.
Portal payment reuses STEP 09 rules without duplicating them.
```

### STEP 12
```
This chat implements STEP 12 of 16: PAYROLL AND HR.
Scope: sub-steps 12.1 to 12.9. Migration range 0490 to 0549.
Employee records, salary structures, configurable payroll tax rules, pay run with
approval chain and lock, payslip generation and delivery, employee self-service
token portal, leave and attendance, payroll payments through the STEP 10 payout
engine, and payroll reports.
Payroll posts to accounting only through a documented journal interface that
STEP 13 consumes. Locked pay runs are immutable. All amounts decimal, USD base,
with statutory currency display only.
```

### STEP 13
```
This chat implements STEP 13 of 16: ACCOUNTING AND REPORTING.
Scope: sub-steps 13.1 to 13.11. Migration range 0550 to 0619.
Chart of accounts, manual and automated journals, financial statements, bank
reconciliation, expenses, fixed assets and depreciation, budgets, period close,
tax filing workspace, and the reporting and business intelligence layer.
Debits must equal credits per entry and per period. A closed period rejects
postings. Every statement must reconcile to the ledger and every report to its
source tables.
```

### STEP 14
```
This chat implements STEP 14 of 16: INTEGRATIONS AND AUTOMATION.
Scope: sub-steps 14.1 to 14.12. Migration range 0620 to 0669.
WhatsApp Cloud API with templates, consent and delivery tracking; social adapters
and scheduler; public REST API v1 with scoped keys, rate limits and OpenAPI;
outbound webhooks with signatures and retries; Zapier and Make; bank feeds; receipt
OCR; contracts and e-signature service; multi-channel messaging; Shopify and
WooCommerce sync; support tickets and help centre; migration wizard.
Every integration secret is encrypted. Every inbound payload is verified, sanitized
and idempotent.
```

### STEP 15
```
This chat implements STEP 15 of 16: ADMIN CONSOLE, CMS, SEO, ANALYTICS AND MARKETING.
Scope: sub-steps 15.1 to 15.12. Migration range 0670 to 0699.
Admin dashboard, user and tenant management with audited impersonation and banner,
plan and coupon management, CMS for every public page, blog, SEO with eight JSON-LD
schemas, sitemap and robots, analytics and pixels behind consent, A/B tests, trust
signals, marketing automation, all public pages, platform intelligence, engineering
tools, growth and retention tools, and the first-run setup wizard.
Every public page is CMS editable, English only, and carries the required metadata.
```

### STEP 16
```
This chat implements STEP 16 of 16: HARDENING, COMPLIANCE AND LAUNCH.
Scope: sub-steps 16.1 to 16.12. Migration range 0700 to 0749.
Run the full security audit against docs/plan/07-security-zero-trust-lr022.md and
fix every finding. Complete the fraud engine, immutable audit verification, SIEM
adapters, compliance suite, PCI scope statement, performance budgets, reliability
and backup procedures, Netlify and Docker deployments, the complete CI/CD pipeline,
monitoring and incident runbooks, and all documentation.
Then execute the launch gate in docs/plan/08-gap-analysis-and-launch-readiness.md
and record the signed readiness entry with the residual gap list.
```

---

## BLOCK C - SUB-STEP CONTINUATION (use inside the same chat)

```
Continue STEP <NN> with sub-step <NN.x> only.
Before writing: state in one line which files you will create or modify and which
already exist, so no duplicate is produced.
Write complete production code, no placeholders.
Then run npm run verify and fix every failure.
Then commit with a conventional commit message that names the sub-step.
Then report: files created, files modified, migrations added, checks run, and the
exact next sub-step.
```

## BLOCK D - CLOSING A CHAT (mandatory)

```
Close STEP <NN>.
1. Run npm run verify, the guard scripts and the rollback of this step's migration
   range, then re-apply.
2. Fill docs/plan/09-handoff-and-definition-of-done.md checklist and report any
   item that is not green with the reason.
3. Write handoffs/STEP_<NN>_COMPLETED.md with: features implemented, files created,
   files modified, tables and migrations added, dependencies added, environment
   variables added, change requests for other steps, open items, and the exact
   starting point for STEP <NN+1>.
4. Commit and tag step-<NN>-done.
```

## BLOCK E - RECOVERY (only if a chat was interrupted)

```
The previous session was interrupted during STEP <NN> at sub-step <NN.x>.
Read the repository state and handoffs/STEP_<NN>_COMPLETED.md part file if present.
List what is already implemented, then continue from the first incomplete sub-step.
Do not rewrite completed files. Do not renumber migrations.
```
