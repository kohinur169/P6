// path: docs/plan/12-feature-crosswalk.md

# 12 - FEATURE CROSSWALK (FEATURE LIST TO OWNING STEP)

Purpose: no feature in `FEATURE_LIST.md` is left without an owning step, and no
feature is claimed by two steps.

Rules of use:
- Each step chat reads only its own chapters, in addition to the global rules.
- A module that spans steps is split by module letter, not by interpretation. The
  split is written below and is final.
- The step handoff contains a coverage checklist listing every module and every
  feature line the step implemented, with the delivered file or route for each.
- A feature that cannot be implemented because a provider, registration or external
  decision is missing is recorded as a gated feature with the gate name, never
  dropped and never replaced with placeholder text.

## Part 1 - Core foundation, branding and public shell (375 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Brand identity, design tokens, motion, theming | 01 |
| B | Layout architecture, page templates, public and auth layouts | 01 |
| C | Responsive and mobile first standards, mobile navigation and gestures | 01 |
| D | Page state completeness: loading, error, empty, success | 01 |
| E | Navigation integrity, central nav map, command palette | 01 |
| F | Accessibility WCAG 2.1 AA | 01 |
| G | Public site pages, legal, support, pricing, lead pages, SEO basics | 15 |
| H | Content completeness, English only, proofreading, i18n ready structure | 01 and 15 |
| I | Visual excellence, charts, easter eggs | 01 |
| J | Design QA and consistency rules | 01 |
| K | Illustration system and image optimization | 01 and 15 |
| L | Footer and shared components | 01 |
| M | Print and export design | 08 |

## Part 2 - Auth, onboarding and settings (391 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Authentication: Supabase auth, social login, 2FA, sessions, login security | 03 |
| B | Universal SMTP: platform and tenant mail, deliverability | 05 |
| C | Onboarding: signup, wizard, industry presets, first run | 04 |
| D | Company profile, branding settings, invoice settings | 04 |
| E | Team management, invitations, roles, staff monitoring and security | 04 |
| F | KYC upload, review, gated features | 06 |
| G | Custom domain setup and verification | 04 and 15 |
| H | Notification system and preferences | 04 and 05 |
| I | Platform billing, plans, subscriptions, coupons, entitlements | 04 |
| J | Gateway settings for tenants | 09 |
| K | Tenant security policies | 04 |
| L | One click backup | 04 and 16 |

## Part 3 - Invoicing and business core (476 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Invoice core: CRUD, lines, calculation, numbering, statuses, metadata | 08 |
| B | US style professional invoice, templates, branding auto fill | 08 |
| C | Server side PDF engine, optimization, snapshots | 08 |
| D | Estimates, credit notes, debit notes, proforma, deposit, recurring, instalments | 08 |
| E | Service business billing, projects, time tracking, billable hours | 07 |
| F | Client CRM: CRUD, profile, search, activity, statements, data quality | 07 |
| G | Product and service catalog | 07 |
| H | Inventory and warehouse | 07 |
| I | Suppliers, purchase orders, supplier bills | 07 |
| J | E-commerce integration Shopify and WooCommerce | 14 |
| K | Tenant dashboard and visualisation | 07 |
| L | Reports: sales, payment, expense, tax, client, inventory, project | 07 and 13 |
| M | Billing lifecycle: reminders, late fees, dunning | 08 |
| N | Tax management and international tax | 10 |
| O | Batch and bulk operations | 08 |

## Part 4 - Payments, gateways and MoR (423 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Gateway framework and 16 provider integrations, custom adapter | 09 |
| B | Local payment methods through licensed partners, payout partner management | 09 and 10 |
| C | Payment processing, records, receipts, refunds, partials, fees | 09 |
| D | Payment links, hosted checkout, pluggable integration modes | 09 |
| E | Digital wallets, Apple Pay and Google Pay through provider SDK | 09 |
| F | Platform wallet, fee deduction, hold period, payout processing | 10 |
| G | Merchant of Record architecture, KYC gated routing, risk and settlement | 10 |
| H | Chargebacks, disputes, evidence packs, prevention | 10 |
| I | Consent evidence, delivery proof, audit chain | 10 |
| J | Subscription billing for tenant clients | 10 |
| K | BNPL and instalment financing interfaces | 10 |
| L | Payment security and compliance, PCI scope, fraud prevention, audit | 09 and 16 |
| M | Payment reports and analytics | 09 |

## Part 5 - Client experience (275 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Token generation, optional gate, token page security, expired handling | 11 |
| B | Invoice, payment, estimate, receipt, client hub pages | 11 |
| C | Client email journey and delivery tracking | 11 |
| D | Tenant branding applied to client surfaces | 11 |
| E | White label tier, platform brand removal, domain gating | 11 and 15 |
| F | Form and input safety UX | 11 |
| G | Document integrity, approval workflow, e-signature | 11 |
| H | Owner only send workflow | 11 and 08 |
| I | Collection and dunning UX | 11 |
| J | Industry presets and template library | 04 |
| K | Tenant lifecycle and growth UX | 04 and 15 |
| L | Client data quality UX | 07 |

## Part 6 - WhatsApp, social, API and integrations (413 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | WhatsApp Cloud API: config, templates, sending, automation, campaigns, tracking, inbound, consent | 14 |
| B | Social connections, adapters, calendar, scheduler, rules, analytics | 14 |
| C | In-app sharing widgets | 14 |
| D | Public REST API v1, endpoints, features, docs, outgoing webhooks | 14 |
| E | Zapier, Make, Chrome extension, developer portal | 14 |
| F | Bank feed aggregator, transaction import, smart reconciliation | 14 |
| G | Receipt OCR and smart entry | 14 |
| H | Contracts and e-signature | 14 |
| I | Multi channel messaging engine and campaigns | 14 |
| J | Help centre, tickets, feedback and NPS | 14 |
| K | Migration wizard and import | 14 |

## Part 7 - Super admin, SEO, analytics and marketing (445 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Admin dashboard, user management, impersonation, tenant management, communication | 15 |
| B | Plan, subscription, coupon management UI | 15 |
| C | CMS editor, blog, email template manager, status and incidents | 15 |
| D | SEO depth, eight JSON-LD schemas, sitemap, robots, audit, verification | 15 |
| E | Analytics and pixels with consent | 15 |
| F | Conversion optimisation, A/B tests, trust signals | 15 |
| G | Marketing automation, campaigns, drip, lead generation | 15 |
| H | Platform first run setup wizard and health checks | 15 |
| I | Entitlement and monetisation engine | 04 and 15 |
| J | Legal and trust pages | 15 |
| K | Platform intelligence and revenue analytics | 15 |
| L | Platform engineering: background jobs, config, monitoring and alerts | 16 |
| M | Growth and retention tools | 15 |

## Part 8 - Payroll, HR, accounting and reports (356 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Payroll: employees, structures, tax, pay runs, payslips, self service, leave, payouts, reports | 12 |
| B | HR: organisation, onboarding, offboarding, performance light | 12 |
| C | Expenses: CRUD, recurring, policy, reports | 13 |
| D | Double entry accounting, chart of accounts, journals | 13 |
| E | Financial statements | 13 |
| F | Bank reconciliation | 13 |
| G | Fixed assets and depreciation | 13 |
| H | Budget management | 13 |
| I | Multi-book accounting and consolidation | 13 |
| J | Financial periods and close | 13 |
| K | Tax filing and compliance | 13 and 10 |
| L | Accounting grade audit trail | 13 and 16 |
| M | Financial intelligence and forecasting | 13 |

## Part 9 - Security, compliance and performance (296 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Multi tenant isolation, RLS, storage isolation, isolation verification | 02 and 06 |
| B | Encryption and secret management | 06 and 16 |
| C | Application security: SQL injection, XSS, CSRF, SSRF, headers | 01 and 03 |
| D | Bot, brute force and abuse prevention | 03 and 16 |
| E | File upload security | 06 |
| F | Token leak and link protection | 11 |
| G | Privacy: GDPR, CCPA, PDPA, retention, DSAR | 16 |
| H | Supply chain and CI security | 16 |
| I | Webhook security | 09 and 14 |
| J | Performance budgets and Core Web Vitals | 16 |
| K | Database engineering: schema, migrations, runtime | 02 |
| L | Concurrency and race conditions | 02, 08, 09 |
| M | Netlify runtime behaviour | 16 |
| N | Storage abstraction and file lifecycle | 06 |
| O | Media optimisation | 06 and 15 |
| P | Asia specific: infrastructure, timezone, display localisation, tax, payments | 04, 10, 13 |
| Q | Enterprise and B2B features | 15 |
| R | Edge cases for invoice, payment, tenant, system | owning steps, recorded in handoffs |
| S | Observability and incident response | 16 |
| T | Delivery quality gate | 16 |

## Part 10 - Deploy, CI and final polish (150 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Deploy and hosting: Netlify, Docker, VPS, environment matrix | 16 |
| B | Cron job catalogue and scheduling | 16 |
| C | Delivery quality gate and CI | 16 |
| D | Documentation and governance | 16 |
| E | Observability and incident | 16 |
| F | Domain and email infrastructure | 16 |
| G | Customer lifecycle and offboarding | 15 and 16 |
| H | Release and cost optimisation | 16 |
| I | Final UX polish | 16 |
| J | Innovative differentiators | 15 |

## Part 11 - Enhanced security, roles and zero trust (425 features)

| Chapter | Content | Owning step |
| --- | --- | --- |
| A | Role hierarchy, CEO role, admin staff role, global approval engine | 03 |
| B | File upload security in depth | 06 |
| C | Immutable audit log and SIEM | 02 and 16 |
| D | Fraud: user behaviour analytics, payment fraud engine, account fraud | 16 |
| E | Data governance, jurisdiction compliance, data residency | 16 |
| F | Dependency and supply chain security | 16 |
| G | Monitoring, alerting, incident response | 16 |
| H | VPN, proxy and IP security | 03 |
| I | Input security on server and client | 01 and 03 |
| J | Chargeback and refund documentation | 10 |
| K | User, device, IP and activity tracking | 16 |
| L | Zero trust architecture and zero tolerance policy | 03 and 16 |
| M | Conflict and duplicate prevention | 02, 08, 09 |

## Coverage accounting

- Total feature chapters: 11 parts, 128 chapter groups, 542 modules.
- Every module above is assigned to exactly one primary step; the four modules that
  are intentionally split are marked in the tables and split at module letter level.
- Each handoff records a coverage row per module with delivered artifacts and a
  count of implemented feature lines.
- The final launch gate requires the consolidated coverage report to show zero
  unassigned modules and zero modules without a delivered artifact.
