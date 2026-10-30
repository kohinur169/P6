// path: docs/plan/10-decision-register.md

# 10 - DECISION REGISTER

Status values: `accepted` (in force), `proposed` (needs confirmation before the
owning step starts), `answered` (confirmed by the product owner).

## Accepted decisions

| Id | Decision | Rationale | Owning step |
| --- | --- | --- | --- |
| D-001 | The project is delivered in exactly 16 steps, one chat per step, each step executed sub-step by sub-step | Keeps every answer inside a single response budget and prevents skipped work | all |
| D-002 | `main` is the integration branch. Each step is a branch `step/XX-slug`, merged by pull request and tagged `step-XX-done` | Traceable, reversible, always deployable | all |
| D-003 | Migrations use a zero padded sequence prefix inside reserved per-step ranges instead of wall clock timestamps | Guarantees identical order on every machine and prevents two steps from claiming the same slot. Functionally equivalent to timestamp ordering and recorded here as an accepted deviation | 02 |
| D-004 | All 16 payment providers are in the registry from the first payment commit; each has its own adapter file and one shared registry entry | Matches the provider requirement and keeps enablement independent of code | 09 |
| D-005 | NMI mode A Collect.js is the default front-end mode; mode B Payment Component stays disabled until the npm package is added by the integrator | Never ship a mode that cannot be tested | 09 |
| D-006 | Card rules: one successful token per invoice per 24 hours; two authentication failures on one token in 24 hours block the third attempt; balance failures excluded; blacklist by token or fingerprint; velocity limits in `config/payment-limits.ts` | Explicit, testable, provider agnostic | 09 |
| D-007 | 3DS is always requested when supported. Without completed 3DS, payment proceeds only when billing postal code and payer IP country both match the invoice, otherwise manual review | Satisfies the verification requirement without a provider-specific fork | 09 |
| D-008 | Login lock: 2 consecutive failures, 120 minutes, database backed, unaffected by password reset, owner email alert, privileged unlock after contact verification, uniform error text | Persistence across restarts and no account enumeration | 03 |
| D-009 | Storage provider is decided per tenant at runtime with automatic fallback; `storage_provider` recorded per file; Drive is optional | Matches the dual mode requirement and keeps the platform usable without Drive | 06 |
| D-010 | Role model is `super_admin`, `ceo`, `admin_staff`, `owner`, `staff`. The names Account, Bloger and KYC Manager from the feature inventory map to `admin_staff` sub-roles `finance_analyst`, `content_manager`, `kyc_reviewer` | Keeps one role hierarchy across the whole platform and avoids a second parallel role system | 02, 03 |
| D-011 | Clients never log in. Access is by HMAC token links with scope, expiry, single use for state changes, and optional PIN or OTP gate | Removes a whole class of account takeover risk | 11 |
| D-012 | LR-022 is implemented as server side sessions plus device proof plus rotating tokens with reuse detection plus reauthentication matrix plus revocation via security stamp plus append only hash chained audit | Strongest available defence against cookie replay and session theft without a native mobile client | 03 |
| D-013 | Money uses `numeric(18,4)` in PostgreSQL, `Decimal` in services, string in JSON, `Decimal` in forms. Rounding policy: half up to 4 decimals per line, sum after rounding, document total equals sum of rounded lines | Deterministic and reproducible in preview, PDF and ledger | 08 |
| D-014 | Decimal library is `decimal.js` | Allowed by the specification and mature | 01 |
| D-015 | PDF rendering is `@react-pdf/renderer` on the server | Server side, deterministic, no browser dependency | 08 |
| D-016 | Background work uses a database queue with `FOR UPDATE SKIP LOCKED` plus pg_cron, with a Redis adapter interface reserved | No extra infrastructure required on Netlify | 02 |
| D-017 | File encryption uses AES-256-GCM with per-tenant keys derived by HKDF from the master key; key version stored with ciphertext | Rotation without data loss | 06 |
| D-018 | Tax engine is built in house, with optional external calculation adapters (`stripe_tax`, `avalara`, `taxjar`) that never become the ledger of record unless enabled by the tenant | One authoritative ledger plus flexibility | 10 |
| D-019 | Sub-merchant provisioning is event driven from KYC approval, idempotent per tenant per provider, with a manual fallback queue | Automatic where possible, never duplicated | 10 |
| D-020 | Audit entries are hash chained and signed with an Ed25519 key held in environment, with a daily Merkle anchor uploaded to storage | Tamper evidence without an external ledger service | 02, 16 |
| D-021 | Impersonation requires dual approval, shows a persistent banner, blocks credential screens, and writes a start and end audit row with reason | Insider risk control | 15 |
| D-022 | Restricted payment brand names are replaced by "Global Payout Partners" and "Local Payment Methods via Licensed Partners" in all UI, code and documentation | Absolute rule 5 | all |
| D-023 | No automated test files exist in the repository. Quality is enforced by guard scripts, migration round trips, and recorded manual test cases inside each handoff document | Absolute rule 4 | all |
| D-024 | The English-only guard covers code, comments, seeds, documents and commit messages | Absolute rule 1 | 01 |
| D-025 | Every provider adapter requires `docs/providers/<code>/VERIFICATION.md` written from that provider's own documentation in the same session, and enablement is blocked without it | Prevents memory based integration | 09 |
| D-026 | One hundred percent of payment intents enter manual review for the first 72 hours of live payment traffic, then sampling drops by configuration | Controlled go live | 09, 16 |
| D-027 | Custom gateway adapter accepts only an owner defined HTTPS endpoint with HMAC signing, strict allowlist and no redirects | Prevents SSRF through a custom adapter | 09 |

## Open questions (answer before the owning step starts)

| Id | Question | Default if unanswered | Blocks |
| --- | --- | --- | --- |
| Q-001 | Which npm package and version for NMI Payment Component should be requested from the integrator | Mode B stays disabled | 09.4 |
| Q-002 | Which jurisdictions are registered for tax at launch, and for which of them is the platform the seller of record | Only US and the platform home jurisdiction enabled, tax shown as zero elsewhere | 10.9 |
| Q-003 | Priority order of the first three providers to enable live | Stripe, PayPal, NMI | 16.12 |
| Q-004 | Is Google Drive connected at launch or later | Later; Supabase Storage only | 06.3 |
| Q-005 | Default platform fee percentage and payout hold period in days | 3.5 percent, 7 days | 10.5 |
| Q-006 | Which countries need payroll statutory rules in v1 | One configured country, others disabled | 12.3 |
| Q-007 | Session idle timeout and absolute timeout values | Idle 30 minutes, absolute 12 hours, admin 8 hours | 03.2 |
| Q-008 | Are WhatsApp and social channels enabled at launch or behind a flag | Behind a flag, disabled | 14.1, 14.2 |
| Q-009 | Which SIEM adapter is required first | Generic webhook plus Splunk HEC | 16.3 |
| Q-010 | Retention period per data category | 7 years for financial and audit, 2 years for security events, 90 days for request logs | 16.4 |

## Change control

A new decision is added with the next free id, status `proposed`, and the step that
will apply it. A decision is never edited in place after the owning step has been
merged; it is superseded by a new row that references it.
