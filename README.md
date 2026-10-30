// path: README.md

# KD SOLUTION IT

Enterprise multi-tenant SaaS platform for invoicing, payments, payroll and
accounting, built for the Asian market, with Merchant of Record and payment
facilitator capabilities.

- Language: English only
- Base currency: USD, stored as numeric(18,4)
- Data: Supabase PostgreSQL. Files: Google Drive when a tenant connects it,
  otherwise Supabase Storage, AES-256-GCM encrypted either way
- Stack: Next.js 14+ App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase,
  pluggable payment adapters, universal SMTP, WhatsApp Cloud API, Netlify

## Build model

The platform is delivered in 16 steps. One step per chat. Each step is executed
sub-step by sub-step, committed after every sub-step, and closed with a handoff
document.

| Order | Document | Purpose |
| --- | --- | --- |
| 1 | `MASTER_PROMPT .md` | Absolute rules, stack, schema rules, security layers |
| 2 | `FEATURE_LIST.md` | Complete feature inventory (11 parts, 542 modules) |
| 3 | `docs/plan/` | Execution plan, 16 steps, ownership, provider matrix, security, gaps |

Start here: `docs/plan/README.md`.

## The 16 steps

| Step | Title |
| --- | --- |
| 01 | Foundation, governance and design system |
| 02 | Database core: tenancy, RLS, audit, idempotency, job queue |
| 03 | Identity and access: auth, session proof (LR-022), login lock, RBAC, approval engine |
| 04 | Tenant lifecycle: onboarding, settings, team, plans, entitlements |
| 05 | Communication layer: universal SMTP, templates, notifications |
| 06 | Storage abstraction, file security and KYC verification |
| 07 | CRM, catalog, inventory, suppliers, projects and time tracking |
| 08 | Invoicing core, document suite and PDF engine |
| 09 | Payments I: framework, 16 provider adapters, NMI dual mode, credential console, card rules, 3DS |
| 10 | Payments II: MoR, sub-merchant provisioning, wallet, payouts, disputes, tax engine |
| 11 | Client portal and tokenized journeys |
| 12 | Payroll and HR |
| 13 | Accounting, financial statements, tax filing and reporting |
| 14 | Integrations and automation |
| 15 | Admin console, CMS, SEO, analytics and marketing |
| 16 | Security hardening, compliance, deploy, CI/CD and launch gate |

## Working agreement

- `main` is the integration branch and stays deployable.
- Each step is implemented on `step/XX-short-name`, reviewed by pull request, tagged
  `step-XX-done`.
- A step writes only inside the paths, tables, API namespaces and migration range it
  owns. See `docs/plan/03-ownership-and-conflict-prevention.md`.
- Every sub-step ends with `npm run verify` and a conventional commit.
- Every step ends with `handoffs/STEP_XX_COMPLETED.md`.

## Repository layout

```
app/            Next.js route groups: public, auth, dashboard, admin, client portal, api
components/     UI primitives and feature components
lib/            Cross-cutting libraries: auth, payment, storage, email, security
services/       Business logic and transactions
config/         Static registries: nav map, permissions, plans, payment methods
migrations/     SQL migrations with matching down migrations
docs/           Architecture, plan, providers, runbooks, ADR
handoffs/       One handoff document per completed step
```

## Documents

- Feature inventory: `FEATURE_LIST.md`
- Absolute rules and stack: `MASTER_PROMPT .md`
- Execution plan: `docs/plan/README.md`
- Chat prompts: `docs/plan/02-chat-playbook.md`
- Payment providers: `docs/plan/05-payment-provider-matrix.md`
- Security and LR-022: `docs/plan/07-security-zero-trust-lr022.md`
- Launch readiness: `docs/plan/08-gap-analysis-and-launch-readiness.md`
