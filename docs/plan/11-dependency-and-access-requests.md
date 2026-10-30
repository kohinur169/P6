// path: docs/plan/11-dependency-and-access-requests.md

# 11 - DEPENDENCY AND ACCESS REQUESTS

Some changes cannot be made by a step because they belong to the integrator: the
shared `package.json`, external accounts, provider contracts and keys. Each item is
requested here with the exact wording, and the step continues with a guarded path
until the request is fulfilled.

## 1. Package requests to the integrator

| Id | Package | Needed by | Reason | Behavior until added |
| --- | --- | --- | --- | --- |
| P-001 | NMI Payment Component package (exact name and version to be confirmed) | 09.4 | Enables NMI front-end mode B | Mode B cannot be enabled; the console returns `dependency_missing`; mode A remains active |
| P-002 | `decimal.js` | 01 | Money arithmetic | Blocks, money cannot be implemented without it |
| P-003 | `@react-pdf/renderer` | 08 | Server side PDF | Blocks step 08 document output |
| P-004 | `isomorphic-dompurify` | 01 | Server side sanitization | Blocks any rich text feature |
| P-005 | `@supabase/supabase-js`, `@supabase/ssr` | 02, 03 | Database and auth | Blocks |
| P-006 | `zod`, `react-hook-form`, `@hookform/resolvers` | 01 | Validation | Blocks |
| P-007 | `googleapis` | 06 | Drive adapter | Drive path unavailable; Supabase path still works |
| P-008 | `nodemailer` | 05 | Generic SMTP adapter | Generic SMTP unavailable; API providers still work |
| P-009 | `@sentry/nextjs` | 01 | Monitoring | Blocks release tracking |
| P-010 | `recharts`, `zustand`, `@tanstack/react-query`, `framer-motion` | 01 | UI stack | Blocks UI work |
| P-011 | `tweetnacl` or `libsodium-wrappers` | 02 | Ed25519 audit signing | Audit signature unavailable |
| P-012 | `qrcode`, `otplib` | 03 | TOTP enrolment | 2FA unavailable |

Request format sent to the integrator:

```
PACKAGE REQUEST
Id: P-<nnn>
Package: <name>@<exact version>
Used by: STEP <nn>, sub-step <nn.x>
Why: <one sentence>
Security review: license, maintainer count, last release date, known advisories,
install size, transitive dependency count
Rollback: remove import and disable the gated capability
```

## 2. Environment variables per step

| Step | Variables |
| --- | --- |
| 01 | `NEXT_PUBLIC_APP_URL`, `SENTRY_DSN`, `ENCRYPTION_MASTER_KEY`, `AUDIT_SIGNING_KEY`, `SESSION_DEVICE_SECRET`, `CSRF_SECRET` |
| 02 | `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 03 | `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `IP_INTEL_PROVIDER`, `IP_INTEL_API_KEY` |
| 05 | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, plus per-provider API keys |
| 06 | `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`, `STORAGE_FALLBACK_ENABLED` |
| 09 | One group per provider: `<PROVIDER>_PUBLIC_KEY`, `<PROVIDER>_SECRET_KEY`, `<PROVIDER>_WEBHOOK_SECRET`, `<PROVIDER>_MERCHANT_ID`, `<PROVIDER>_API_VERSION` |
| 10 | `PAYOUT_MIN_AMOUNT`, `PLATFORM_FEE_DEFAULT_RATE`, `TAX_DEFAULT_POLICY` |
| 11 | `PORTAL_TOKEN_SECRET`, `PORTAL_TOKEN_TTL_HOURS` |
| 12 | `PAYROLL_ENCRYPTION_KEY_VERSION` |
| 14 | `WHATSAPP_*`, `SOCIAL_*`, `PUBLIC_API_HASH_SECRET` |
| 16 | `CRON_SECRET`, `SIEM_ENDPOINT`, `SIEM_TOKEN`, `UPTIME_CHECK_URL` |

Every variable is documented in `.env.example` with a one line comment and a
`required` or `optional` marker. A required variable that is missing disables the
dependent feature and fails the health check for that feature, it never falls back
to a default secret.

## 3. External accounts and access

| Account | Needed by | State to reach before launch |
| --- | --- | --- |
| Supabase project (prod and staging) | 02 | Migrations applied, backups on |
| Netlify site plus deploy hook | 16 | Production deploy verified |
| Cloudflare zone, DNS, WAF, Turnstile | 01, 16 | Zone active, Turnstile keys issued |
| Domain and email DNS records | 16 | SPF, DKIM, DMARC verified |
| SMTP or email API account | 05 | Test mail delivered to inbox |
| Sentry project | 01 | DSN issued, release tracking on |
| IP intelligence provider | 03 | Key issued, quota adequate |
| Google Cloud project with Drive API and service account | 06 | Optional, root folder created and shared with the service account |
| Provider sandbox accounts | 09 | One per provider to be implemented |
| Provider production accounts and contracts | 09, 10 | MoR or facilitator terms signed |
| Merchant bank and payout rails | 10 | KYB complete, payout test passed |
| WhatsApp Business account | 14 | Optional, templates approved |
| Tax registrations | 10 | Recorded per jurisdiction |

## 4. Provider onboarding checklist (repeat per provider)

1. Create the account and complete business verification.
2. Obtain sandbox credentials.
3. Read the current official documentation and write `VERIFICATION.md`.
4. Write and test the adapter against sandbox.
5. Record test evidence and correlation ids in the verification file.
6. Enter credentials in the super admin console, run the test action.
7. Enable in test environment, run the full payment case list.
8. Obtain production credentials, enable in production with dual approval.
9. Confirm webhook endpoint registration and signature secret.
10. Confirm settlement account, fee schedule and reserve terms.
11. Record the provider in the launch gate table with status and date.

## 5. Decisions that must come from the platform owner

These are commercial or legal inputs, not code: platform fee rate, payout hold
period, refund window per market, jurisdiction registrations, which markets launch
first, contract templates, and the identity documents used for KYB. Each is answered
in `10-decision-register.md` before the dependent sub-step runs.
