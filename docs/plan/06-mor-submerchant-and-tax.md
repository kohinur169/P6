// path: docs/plan/06-mor-submerchant-and-tax.md

# 06 - MERCHANT OF RECORD, SUB-MERCHANT PROVISIONING AND TAX

Owner steps: STEP 10 (orchestration, wallet, payouts, tax engine), STEP 06 (KYC
approval event), STEP 09 (provider adapters), STEP 13 (tax filing workspace).

## 1. Two operating models

Model A - Platform is Merchant of Record.
The platform sells to the end client, the tenant supplies the service, the platform
collects and remits tax, holds funds, deducts a platform fee and pays the tenant.
Used when the provider is a MoR provider, or when the platform chooses MoR terms
for a tenant segment.

Model B - Tenant is merchant under the platform master account.
A verified tenant is provisioned as a sub-merchant inside a provider that supports
platform accounts. Funds settle to the sub-merchant account, the platform retains a
configured application fee, and the platform is a facilitator, not the seller of
record. Tax is calculated by the platform and reported to the tenant; remittance is
the tenant's obligation unless the platform is the seller of record.

Every tenant has exactly one active model per provider, stored on
`sub_merchant_accounts.model`. The model is fixed at provisioning time and changing
it is a controlled migration with audit.

## 2. Sub-merchant provisioning flow (automatic after manual verification)

Stage 1 - Signup.
Tenant creates an account, company is created in `draft` status, VPN and proxy
blocked, Turnstile verified, email verified.

Stage 2 - KYC submission.
Tenant uploads documents. Files are encrypted and stored through the storage
adapter. `kyc_submissions.status = submitted`.

Stage 3 - Automated screening.
Sanctions and PEP screening, document authenticity checks, duplicate identity check
against existing tenants, device and IP risk review. Results in `kyc_checks`.

Stage 4 - Manual review.
`admin_staff` with role `kyc_reviewer` reviews. Decision requires
`compliance_officer` note for enhanced due diligence cases.

Stage 5 - Approval chain.
Reviewer recommends, CEO approves, super_admin confirms for high-risk or
above-threshold accounts. Recorded in `approval_requests` and `kyc_decisions`.
Final state: `kyc_submissions.status = approved`, `companies.kyc_status = verified`.

Stage 6 - Provisioning trigger.
Approval commits an outbox event `kyc.approved` in the same transaction. A worker
consumes it with `FOR UPDATE SKIP LOCKED`, one job per tenant per provider, with an
idempotency key `submerchant:{company_id}:{provider_code}`.

Stage 7 - Provider provisioning.
The adapter's `createSubMerchant` is called only when the provider capability is
verified in `docs/providers/<code>/VERIFICATION.md`. Result stored in
`sub_merchant_accounts` with `external_account_id`, `status`,
`capabilities`, `requirements_due_at`.

Stage 8 - Capability activation.
Provider returns pending requirements. `sub_merchant_requirements` tracks each item
with due date and evidence file. When a capability becomes active, the tenant can
accept payments for that provider; until then the provider is excluded from routing
with reason `sub_merchant_pending`.

Stage 9 - Ongoing monitoring.
Webhook driven state sync, periodic status poll, requirement deadlines, suspension
on provider action, reinstatement after remediation. Every transition is audited.

Stage 10 - Offboarding.
Account closure request, balance settlement, payout of remaining balance, provider
account deactivation, data retention per policy, audit record.

Failure handling:
- Provider call fails: job retries with backoff, then moves to
  `manual_provisioning_queue` for `payment_processor` role.
- Provider does not support sub-merchants: tenant is provisioned on a supporting
  provider, or Model A applies for that provider; the decision is written to
  `sub_merchant_events`.
- Requirements expire: collection is suspended, tenant notified, owner alerted.

Idempotency guarantees: one account per tenant per provider; re-running the job
returns the existing account; duplicate provider accounts are prevented by a unique
index on (`company_id`, `provider_code`).

## 3. Onboarding states

`draft -> kyc_submitted -> screening -> in_review -> approved -> provisioning ->
requirements_pending -> active -> suspended -> closed`

Rejection paths: `rejected_resubmit_allowed`, `rejected_final`. Both are audited and
notify the tenant with a reason code, never with internal notes.

## 4. Tax engine

Purpose: calculate, record, report and reconcile tax for both models, in USD, with
decimal precision, for APAC plus US requirements.

Components:
- `tax_jurisdictions`: country, region, locality, level.
- `tax_rates`: rate with effective dates and inclusive flag.
- `tax_rules`: product tax code to jurisdiction mapping with conditions.
- `tax_registrations`: tenant registrations with numbers and filing frequency.
- `tax_thresholds`: nexus and registration thresholds with running totals.
- `tax_transactions`: one row per document line with taxable amount and tax amount.
- `exemption_certificates`: customer exemptions with validity.
- `tax_filings`: period returns with status and generated worksheet file.

Calculation order:
1. Determine ship-to or place of supply from the client address; fall back to the
   billing address, never to the payer IP alone for tax jurisdiction.
2. Resolve jurisdiction chain, then applicable rules for the product tax code.
3. Apply exemption certificate if valid for the period.
4. Apply reverse charge when the buyer is a registered business in another
   jurisdiction and the rule requires it.
5. Compute with decimal arithmetic, round per line according to the configured
   policy, sum to document totals, store per line and per jurisdiction.
6. Freeze the result on the document snapshot; later rate changes never alter an
   issued document.

Rate sources: manual table entries by `finance_analyst`, plus optional external
calculation adapters (`stripe_tax`, `avalara`, `taxjar`) declared as interfaces in
STEP 10. An external adapter result is stored as an advisory record with its source,
and the internal ledger remains authoritative unless the tenant enables the adapter
as the source of truth.

Coverage in v1:
- US sales tax at state, county, city and special district levels, with economic
  nexus thresholds per state.
- VAT and GST configuration for APAC jurisdictions the platform registers in,
  inclusive pricing support, B2B reverse charge, digital services rules.
- Withholding tax records for cross-border payouts.
- MoR tax liability ledger: collected, remitted, refunded, adjusted, with a monthly
  reconciliation to provider settlement.

Filing:
- Filing calendar generated from registrations and frequency.
- Worksheet per jurisdiction and period: taxable base, tax collected, credits,
  refunds, net due.
- Worksheet PDF stored through the storage adapter, linked to `tax_filings`.
- Submission is manual by `finance_analyst` and recorded with evidence file and
  confirmer identity. The platform never files automatically without an explicit
  registration and approval.

Operational prerequisites tracked in the launch gate: which jurisdictions the
platform registers in, which are tenant obligations, and the provider contracts
that define who remits. Each jurisdiction has an owner and a status row in
`tax_registrations` before it is enabled for collection.

## 5. Money movement summary

```
Client pays 100.00
  provider fee                  -> recorded on payments.fee_amount
  platform application fee      -> wallet_ledger entry (platform_fee)
  tax portion (Model A)         -> mor tax liability ledger
  tenant available balance      -> wallets.available_balance
Payout request -> approval chain -> payout_batches -> provider transfer
  hold period enforced, payout cannot exceed available balance
```

Wallet is double entry: every movement creates a ledger row and a balance snapshot;
balances are recomputed and verified by a reconciliation job.

## 6. Security requirements specific to this module

- Sub-merchant provisioning requires KYC approval; no bypass flag exists.
- Provider credentials are read only through the credential service, decrypted in
  memory per request, never cached in plaintext.
- Payout changes and requirement overrides require step-up reauthentication and dual
  approval above threshold.
- Every provisioning, requirement, capability, payout and tax filing transition
  writes an audit row with correlation id.
- Tax tables are versioned by effective date; editing an old rate is forbidden,
  a new rate row is created instead.
