// path: docs/plan/08-gap-analysis-and-launch-readiness.md

# 08 - GAP ANALYSIS AND LAUNCH READINESS

This document answers two questions: what must be true before launch, and what
remains open after launch with an owner and a mitigation.

## 1. Live prerequisites (external, not code)

| Prerequisite | Required for launch | Notes |
| --- | --- | --- |
| Supabase project (PostgreSQL, Auth, Storage, Realtime) | Yes | Backups enabled, PITR recommended |
| Netlify site and deploy hook | Yes | Primary hosting |
| Domain, DNS, TLS, email DNS records (SPF, DKIM, DMARC) | Yes | Deliverability depends on it |
| Cloudflare Turnstile keys | Yes | Signup, login, reset, payment, contact |
| SMTP account (any provider or generic SMTP) | Yes | Platform default; tenant SMTP optional |
| Sentry project and DSN | Yes | Release tracking |
| IP intelligence provider key | Yes | VPN, proxy, Tor detection |
| Google Drive service account and root folder | No | Optional. Without it the platform stores files in Supabase Storage and everything else is unchanged |
| Provider sandbox accounts | Yes for testing | One per provider that will be enabled |
| Provider live accounts and contracts | Before live payments | MoR and facilitator terms define who remits tax |
| WhatsApp Business account and approved templates | Only if the channel is enabled | Template approval is external |
| Tax registrations per jurisdiction | Before collecting tax in that jurisdiction | Recorded in `tax_registrations` |
| Merchant bank and payout rails | Before payouts | KYB of the platform entity |
| Legal review of terms, privacy, MoR agreement, DPA | Before launch | Content slots exist in CMS |

Answers to the recurring configuration question:
- Google Drive disconnected: all data and files in Supabase, `storage_mode = supabase`.
- Google Drive connected: text and financial records stay in Supabase, files go to
  Drive, `storage_mode = auto` or `google_drive`.
- Switching later is supported by the storage migration tool; no data rewrite of
  text tables is ever required.

## 2. Blocking launch gate (all must be green)

1. `npm run verify` green: lint, type-check, guard scripts, no test files, no TODO,
   no non-ASCII, no `console.log`, no money `Number`.
2. All 16 step handoff documents present and tagged.
3. Migration up and down validated on a clean database, and on a copy of production
   shape.
4. RLS isolation proof: cross-tenant read and write attempts fail for every table.
5. Session security proof: cookie copy without device proof rejected, rotated token
   reuse revokes family, revoke all devices effective on next request.
6. Login lock proof: third attempt after lock rejected even with correct password;
   reset refused while locked; unlock path audited.
7. Payment proof per enabled provider: success, decline, 3DS challenge, 3DS failure,
   refund full and partial, duplicate webhook, invalid signature, timeout retry.
8. Card rules proof: per-invoice 24 hour rule, two authentication failures block the
   third attempt, blacklist by token, velocity limits, VPN block.
9. Credential console proof: encrypted at rest, masked display, cannot enable an
   unverified adapter, cannot enable without a successful test, step-up enforced,
   audit rows written.
10. Sub-merchant proof: KYC approval creates exactly one sub-merchant per provider,
    re-run is idempotent, requirements block routing until active.
11. Tax proof: line-level tax stored, document total equals sum of lines within
    rounding policy, snapshot immutable after issuance, filing worksheet reconciles.
12. Audit proof: hash chain verifies, tamper simulation is detected, SIEM forward
    delivers, sequence gap alert fires.
13. Storage proof: Drive-only, Supabase-only and fallback modes each upload and
    download; every object is ciphertext; migration tool moves files both ways.
14. Performance budgets met on the ten most used pages; error budget defined.
15. Backup restore rehearsed once with documented RTO and RPO results.
16. Security headers grade A on production, CSP violations monitored.
17. Incident runbook and on-call roster exist; status page works.
18. Rollback rehearsed: previous deploy restored in under 15 minutes.
19. Documentation complete: README, SECURITY, CONTRIBUTING, ERD, ADR set, API
    reference, runbooks, operator manual.
20. Residual gap list signed off with owners and dates.

## 3. Residual gaps after launch, with mitigation

### 3.1 Security

| Gap | Impact | Mitigation | Owner step |
| --- | --- | --- | --- |
| No third-party penetration test yet | Unknown exploitable paths | Schedule external test within 60 days of launch, remediation budget reserved, critical findings block new features | 16 |
| No SOC 2 or ISO 27001 certification | Enterprise buyers may defer | Publish trust centre with controls and evidence, start readiness programme | 15, 16 |
| WAF rules require tuning in production | Some false positives or misses | Weekly rule review, staged rollout, alert on block spikes | 16 |
| Fraud thresholds are initial values | Over or under blocking | Tune with real data, review queue sampling, monthly recalibration | 16 |
| Provider sandbox differs from production behaviour | Late surprises | Canary enablement with small limits, provider certification where offered | 09 |
| IP intelligence coverage gaps in some regions | VPN may slip through | Combine provider score with ASN and behaviour signals, manual review on anomalies | 03 |
| Client portal tokens are bearer by design | Link forwarding | Short expiry, single use for actions, optional PIN or OTP gate, access logging | 11 |
| Admin impersonation is powerful | Insider risk | Dual approval, banner, full audit, session recording of actions, no credential visibility | 15 |
| Key rotation is manual | Operational risk | Rotation runbook with schedule, versioned ciphertext, rehearsal in staging | 06, 16 |

### 3.2 Compliance and legal

| Gap | Mitigation |
| --- | --- |
| Tax registrations per jurisdiction incomplete at launch | Enable collection only where registered; others show tax as zero with a clear configuration state; filing workspace ready |
| MoR contracts and DPA need legal review per market | Template in CMS, reviewed before enabling the market, versioned acceptance |
| PCI scope statement requires provider confirmation | Keep card data out of scope with hosted fields, complete SAQ A or A-EP with provider, store evidence file |
| Sanctions and PEP screening data source licensing | Use a licensed provider, document the source, record per screening |
| Data residency for specific countries | Region configuration exists, but multi-region deployment needs infrastructure budget; document current region per tenant |
| Consumer cooling-off and refund rules by country | Configurable refund policy per jurisdiction, legal review before enabling |

### 3.3 Product and feature

| Gap | Mitigation |
| --- | --- |
| Real-time co-editing is limited to presence and conflict warnings | Document the boundary; optimistic locking prevents corruption |
| Native mobile apps not included | PWA installable, responsive at 320 pixels, API available for future apps |
| Offline mode not included | Online-first, clear state messaging, retry safety |
| Some provider capabilities require provider approval per country | Capability matrix shows availability; routing excludes unavailable providers |
| Local payment method coverage depends on licensed partners | Method catalogue with availability flags and fallback guidance |
| Advanced BI and forecasting are baseline | Definition set in step 13, extension backlog recorded |
| Email and WhatsApp deliverability depends on external reputation | Warm-up plan, suppression handling, per-tenant limits |
| Bank feed coverage depends on aggregator contracts | Manual statement import always available as fallback |
| Payroll statutory rules are configuration, not legal advice | Rules reviewed per jurisdiction by the operator before enabling a country |
| Multi-currency display uses stored rates | Rate provider adapter with frozen snapshots; rates never applied retroactively |

### 3.4 Operations

| Gap | Mitigation |
| --- | --- |
| On-call staffing | Start with a documented rotation and escalation, automate alerts |
| Chargeback representment workload | Evidence pack automation, staff assignment, deadline tracking |
| Support volume at scale | Help centre, templates, ticket routing, macros |
| Disaster recovery not yet drilled in production | Quarterly drill, documented RTO and RPO, restore rehearsal before launch |
| Cost growth of storage and drive quota | Usage dashboards, retention policies, archive tier |
| Provider account stability and reserve requirements | Monitor settlement, maintain buffer, diversify providers |

## 4. Go-live sequence

1. Staging environment with sandbox providers, full launch gate executed.
2. Production deploy with providers disabled and a maintenance banner ready.
3. Super admin setup wizard, platform SMTP test, storage mode selection, provider
   credentials entered and tested one by one, each enabled separately.
4. Tenant pilot: five internal or invited tenants, KYC and sub-merchant provisioning
   observed end to end, tax calculation reviewed by finance.
5. Payment canary: low limits, manual review on 100 percent of intents for 72 hours.
6. Raise limits, reduce review sampling, monitor success rate, dispute rate, fraud
   rate and error budget for two weeks.
7. Publish status page, open signups, marketing launch.

## 5. Post-launch review cadence

- Daily: payments, webhooks dead letter, cron failures, audit chain verification.
- Weekly: fraud queue sampling, provider health, deliverability, access review.
- Monthly: dependency and secret scan report, backup restore spot check, cost review,
  tax filing calendar check.
- Quarterly: disaster recovery drill, penetration test remediation review, retention
  purge verification, role and permission review.
