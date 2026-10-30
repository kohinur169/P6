// path: FEATURE_LIST_V2.md

# KD SOLUTION IT - FEATURE LIST V2 (SINGLE SOURCE OF TRUTH)

Document: FEATURE_LIST_V2
Version: 2.0
Scope: Payment platform, merchant of record and payment facilitator for online
businesses. Invoicing, payment collection, sub-merchant onboarding, ledger,
settlement and payouts.
Base currency: USD only.
Language: English only, ASCII only, in code, UI, comments, seeds and documents.
Supersedes: FEATURE_LIST (v1) and the planning documents under docs/plan.
Status of this document: feature scope only. No implementation plan is contained
here.

Every feature below carries a stable identifier. An identifier is never reused and
never renumbered. A feature is either implemented or listed in section 29.

---

## 1. NON-NEGOTIABLE PLATFORM RULES

- PLT-01 English only. No other script in UI, code, comments, seeds, emails or
  documents. Guard script blocks any non-ASCII character in tracked files.
- PLT-02 USD only. Every money value is numeric(18,4) in PostgreSQL and a decimal
  library in application code. JavaScript Number is never used for money.
- PLT-03 No conversion or display of client amounts in another currency.
- PLT-04 Text and structured data in PostgreSQL. Files in the hosting storage
  provider, encrypted at rest with AES-256-GCM.
- PLT-05 No test files, no TODO, no FIXME, no placeholder text, no Coming Soon.
- PLT-06 TypeScript strict, no any type, explicit return types.
- PLT-07 No console logging. Structured logger with correlation id only.
- PLT-08 Every file starts with a path comment.
- PLT-09 Every table has id (UUID v7), company_id, created_at, updated_at,
  deleted_at, RLS default-deny, audit trigger, and version column when editable.
- PLT-10 Every mutation has Zod validation, sanitization, audit entry, correlation
  id, and idempotency key where a repeat is possible.
- PLT-11 Every API route is authenticated, authorized, rate limited and CSRF
  protected when cookie authenticated.
- PLT-12 Fail closed. A missing credential, capability or approval blocks the
  action instead of degrading silently.
- PLT-13 No restricted payment brand names in UI, code or documents. Use Global
  Payout Partners or Local Payment Methods via Licensed Partners.
- PLT-14 Hosting target is Vercel or Netlify or a VPS with Docker. No function may
  depend on a hosting specific feature that the others cannot provide.
- PLT-15 Every feature must satisfy the performance rules in section 27.

## 2. ROLES, PERMISSIONS AND DELEGATION

- ROLE-01 Platform roles: super_admin, ceo, compliance_kyc, support, blogger.
- ROLE-02 super_admin holds every permission and can perform every action.
- ROLE-03 super_admin delegates permission sets to ceo, compliance_kyc, support and
  blogger. Delegation is granular, reversible and audited.
- ROLE-04 ceo operates the platform under super_admin, approves compliance and
  underwriting decisions, and confirms high impact actions initiated by
  super_admin (two person rule).
- ROLE-05 compliance_kyc performs KYC and KYB review, underwriting, sanctions and
  PEP review, risk limits, dispute document review, reserve decisions and
  suspension or reactivation recommendations.
- ROLE-06 support handles tickets, merchant communication, billing questions and
  document collection. Support cannot approve KYC, change limits or move money.
- ROLE-07 blogger creates, edits, schedules and publishes blog posts and assigned
  CMS pages. No access to merchant data, payments or settings.
- ROLE-08 Each role has its own dashboard with only the permitted modules.
- ROLE-09 Permission matrix is enforced server side, never only in the UI.
- ROLE-10 High impact actions require a second confirmation: platform fee and hold
  changes, reserve release, refunds above threshold, payout approval, processor
  credential changes, country switches, plan price changes, merchant suspension
  and reactivation, data export, KYC provider switch.
- ROLE-11 Every role change, delegation change, permission grant and revocation is
  audited with actor, target, before and after.
- ROLE-12 Employee offboarding revokes all sessions, API keys and delegated
  permissions the same day, with a signed checklist.
- ROLE-13 Encryption key custody is assigned to the ceo and recorded in the
  security policy with a named backup custodian.
- ROLE-14 Platform staff never appear as merchant staff. Merchants have exactly
  one user account (the owner) and cannot invite staff.
- ROLE-15 Merchants never see platform internals, processor credentials, risk
  scores or other merchants data.

## 3. BUSINESS, LEGAL AND COMPLIANCE FRAMEWORK

- GOV-01 Merchant of Record and payment facilitator model defined in the merchant
  agreement, with the platform as seller of record for platform subscriptions.
- GOV-02 Client funds held in a segregated account, separate from platform
  operating funds, with a documented reconciliation between ledger and bank.
- GOV-03 Named responsible officer for compliance, recorded in policy and visible
  to processors during underwriting.
- GOV-04 AML and CFT policy with risk based approach, customer due diligence,
  enhanced due diligence, ongoing monitoring and record keeping.
- GOV-05 SAR preparation workspace. The system assembles the internal case file,
  timeline and evidence. Filing to the competent authority is performed by the
  compliance team. The system never files automatically.
- GOV-06 KYC and KYB policy covering identity of the person, legitimacy of the
  business, trade licence, ownership and address.
- GOV-07 UBO policy. Every business entity records beneficial owners holding 25
  percent or more, with identity documents and verification status.
- GOV-08 Sanctions and PEP screening policy aligned with UN, OFAC, EU and local
  lists, using a licensed data provider, with rescreening on a schedule and on
  every material change.
- GOV-09 Underwriting and risk assessment policy with a written scoring model,
  manual override with reason, and periodic review.
- GOV-10 Merchant acceptance policy with prohibited and restricted business list,
  including drugs, unlicensed crypto, unlicensed gambling, weapons, counterfeit
  goods, adult content restrictions, MLM and deceptive products.
- GOV-11 Prohibited business list is enforced at onboarding through MCC and
  business description review, and at transaction level through monitoring.
- GOV-12 Chargeback and dispute management policy, including evidence standards,
  response windows and merchant responsibility for losses.
- GOV-13 Refund and settlement policy published to merchants, including hold
  period, reserve, refund fee treatment and payout minimum.
- GOV-14 Data privacy and security policy aligned with GDPR, CCPA and applicable
  local law, with lawful basis, retention and subject rights.
- GOV-15 PCI DSS scope statement. Card data never enters platform systems;
  hosted fields or provider SDK only; annual attestation renewal recorded.
- GOV-16 Fraud and risk management policy covering stolen cards, card testing,
  account takeover, friendly fraud and merchant fraud, with automatic controls and
  manual review.
- GOV-17 Responsible automated decisioning policy. Any automatic block, limit or
  suspension is reviewable by a human within a stated time, with reason codes
  shown to the merchant.
- GOV-18 Cyber insurance policy maintained and renewed annually, with the renewal
  date tracked in the compliance calendar.
- GOV-19 Compliance calendar with licence renewals, PCI attestation, insurance,
  policy reviews, sanctions list updates and processor reviews.
- GOV-20 Written liquidity plan covering processor settlement delays, large
  chargebacks and reserve shortfalls, funded from platform capital.
- GOV-21 Negative balance recovery procedure: ledger offset, reserve draw, saved
  balance offset, formal demand, suspension, and legal escalation per agreement.
- GOV-22 Legal templates versioned and accepted by each merchant with timestamp,
  IP address, device fingerprint and document hash.
- GOV-23 Records retained for 7 years for financial, KYC, dispute and audit data,
  unless a longer period is required by a jurisdiction.

## 4. ACCOUNT, AUTHENTICATION AND SESSION SECURITY

- AUTH-01 Email and password signup with email verification.
- AUTH-02 Password policy with length, strength, breach list check and rotation
  warning.
- AUTH-03 Two factor authentication with TOTP and downloadable backup codes.
- AUTH-04 Backup codes are generated by the merchant in advance, stored hashed,
  single use, and replaceable.
- AUTH-05 Lost 2FA with exhausted backup codes is recovered through support with
  identity verification and additional documents, recorded and audited, followed
  by forced re-enrolment.
- AUTH-06 Account lock after two consecutive failures of password or 2FA code,
  for 120 minutes, stored in the database, unaffected by restart or password
  reset.
- AUTH-07 Lock notification email to the account owner with time, IP country and
  device summary, without any unlock link.
- AUTH-08 Unlock only by a permitted role after verified contact with the owner,
  with reason, actor and audit entry.
- AUTH-09 Uniform error messages that do not reveal whether an account exists or
  is locked.
- AUTH-10 Server side session record with device binding, rotating token, reuse
  detection, idle and absolute expiry, and instant revocation.
- AUTH-11 Session list for the merchant with device, location, last activity and
  revoke action, plus revoke all devices.
- AUTH-12 Revocation on password change, email change, 2FA reset, role change,
  lock, suspension and administrative action.
- AUTH-13 Step-up reauthentication with password and TOTP for sensitive actions:
  bank account change, payout approval, processor settings, data export, account
  closure, API credential rotation.
- AUTH-14 CSRF protection with double submit token and origin checks on every
  cookie authenticated mutation.
- AUTH-15 Rate limiting on login, password reset, verification and payment
  submission, per account and per IP.
- AUTH-16 Bot protection on signup, login and payment pages with a challenge that
  does not block assistive technology.
- AUTH-17 No VPN, proxy or Tor blocking. IP and device signals are recorded and
  used for risk scoring and manual review only.
- AUTH-18 Login history visible to the merchant with export.
- AUTH-19 Email address change requires reauthentication and confirmation from both
  the old and the new address.
- AUTH-20 Owner identity cannot be transferred between accounts. Ownership change
  requires a formal migration case reviewed by compliance.

## 5. MERCHANT ONBOARDING, KYC AND KYB

- KYC-01 Signup captures business name, business address, contact details, person
  name, phone, website and business type before KYC.
- KYC-02 Business information fields adapt to what each processor requires, with a
  shared canonical model and a per processor mapping.
- KYC-03 MCC selection from a searchable list at onboarding and in profile
  settings.
- KYC-04 Business registration document upload with number, jurisdiction and
  validity date.
- KYC-05 Owner identity document upload: front, back and selfie, with quality and
  liveness guidance.
- KYC-06 Address verification: utility bill within 3 months, bank statement, or
  equivalent document, with issue date validation.
- KYC-07 Source of funds declaration with supporting document upload.
- KYC-08 Bank statement upload for underwriting, with configurable number of
  months requested per risk tier.
- KYC-09 Website verification: ownership proof by DNS record, meta tag or file
  upload, plus a check that the site describes the declared business.
- KYC-10 Document quality checks: file type, size, resolution, legibility and
  duplicate document hash detection.
- KYC-11 KYC case state machine: draft, submitted, screening, in review,
  additional information requested, approved, rejected with resubmission,
  rejected final.
- KYC-12 Manual review is the default at launch. Automatic verification is off
  until a provider is connected.
- KYC-13 Optional automatic identity verification providers: Jumio, Didit and
  Sumsub, each behind one adapter interface.
- KYC-14 Super admin selects exactly one active automatic provider. When none is
  selected, manual review applies. The merchant never sees which path is used.
- KYC-15 Four eye review for high risk merchants: two reviewers must agree, with
  separate decision records.
- KYC-16 Review queue with assignment, priority, age, SLA countdown and bulk
  filters.
- KYC-17 KYC decision requires reason code, notes and evidence reference.
- KYC-18 Additional information request with document checklist and merchant
  upload portal.
- KYC-19 Screening results recorded per provider, per list and per screening date,
  with match decision and reviewer note.
- KYC-20 Final approval chain: compliance_kyc recommends, ceo approves, super_admin
  confirms for high risk or above threshold.
- KYC-21 Approval emits one idempotent event that triggers sub-merchant
  provisioning.
- KYC-22 Rejection informs the merchant with reason category and resubmission
  path, never with internal notes.
- KYC-23 Periodic review schedule by risk tier with automated reminder and
  document refresh.
- KYC-24 Document retention and access logging. Every view and download of a KYC
  document is recorded.
- KYC-25 KYC data is encrypted at rest and masked in UI by default with explicit
  reveal action.

## 6. DUPLICATE ACCOUNT AND IDENTITY INTEGRITY

- DUP-01 One owner identity may hold exactly one merchant account. Multiple
  businesses under one owner are not permitted.
- DUP-02 Duplicate detection runs on email, normalized phone, business
  registration number, tax identifier, legal business name, address, bank account
  number, identity document number and document hash.
- DUP-03 Device fingerprint, IP history and browser signals are stored and
  compared across signups.
- DUP-04 Any match above the configured threshold blocks automatic approval and
  routes the case to compliance review with the match evidence.
- DUP-05 Cross account network analysis shows linked accounts, shared bank
  accounts, shared devices and shared documents.
- DUP-06 A blocked signup receives a neutral message and a support path, without
  revealing which signal matched.
- DUP-07 Confirmed duplicate accounts are suspended, merged where legal, and the
  decision is audited with evidence.
- DUP-08 The rule is documented as layered detection with human decision, because
  identity uniqueness cannot be proven by technology alone.
- DUP-09 All duplicate checks are re-run on KYC submission, on bank account change
  and on payout destination change.
- DUP-10 False positive appeal path with document verification and reviewer
  decision.

## 7. SUB-MERCHANT PROVISIONING AND PROCESSOR CAPABILITY

- SUB-01 Five processors are integrated: NMI, Rainforest, Stripe Connect,
  Payoneer and Airwallex.
- SUB-02 Capability matrix is explicit per processor: payment acceptance, sub
  merchant creation, payout destination, refunds, disputes, saved cards.
- SUB-03 NMI creates the sub-merchant inside the NMI gateway. Rainforest creates a
  merchant through its onboarding and underwriting flow. Stripe Connect creates a
  connected account. Payoneer and Airwallex act as payout and holding rails with
  connected accounts where the merchant is onboarded for payouts.
- SUB-04 Payoneer does not accept card payments. A merchant whose only connection
  is Payoneer cannot take card payments, and the dashboard states this clearly
  with the action needed to enable card acceptance.
- SUB-05 Airwallex connected accounts support payouts, wallets and platform split
  payments. Payment acceptance through Airwallex is enabled only when the merchant
  is onboarded to that capability; otherwise it is used as a payout rail.
- SUB-06 Automatic provisioning after KYC approval creates exactly one account per
  merchant per processor, keyed by an idempotency key.
- SUB-07 Manual provisioning fallback queue with assignment, notes and SLA, used
  when the processor call fails or the processor requires human onboarding.
- SUB-08 Processor requirement tracking: each requirement has a code, description,
  due date, status and evidence file, and is surfaced to the merchant as a task.
- SUB-09 Capability activation is progressive. Payments are blocked for a
  processor until its capability is active, and the reason is shown.
- SUB-10 Webhook and polling synchronisation of merchant status: onboarding,
  active, restricted, suspended, deactivated, closed.
- SUB-11 Processor credential entry, test and enable or disable from the super
  admin console without a deployment.
- SUB-12 Credentials encrypted with AES-256-GCM, key material only in environment
  variables, displayed only as a masked suffix with last update time.
- SUB-13 Processor enabled only after a successful connection test and only if the
  adapter exists in the code registry.
- SUB-14 Adapter documentation record per processor with the source URLs, API
  version, endpoint list, auth scheme, webhook signature scheme, test data and
  verification date, written from the processor documentation in the same session
  as the adapter code.
- SUB-15 Statement descriptor composed of the platform prefix KD and the merchant
  business name, with length rules per processor and validation on save.
- SUB-16 Each processor connection has an independent health state, error budget
  and automatic exclusion from routing when unhealthy.
- SUB-17 Account closure request: balance paid out after hold and reserve release,
  processor account deactivated, saved card tokens deleted, records retained.
- SUB-18 Processor outage runbook with merchant facing status and queued retries.

## 8. PAYMENTS, CHECKOUT AND PAYMENT LINKS

- PAY-01 Hosted checkout page served by the platform, with card fields rendered
  only through the processor hosted fields or SDK.
- PAY-02 Processor selection by deterministic routing rules. No route match means
  the payment is rejected, never rerouted to another processor.
- PAY-03 Payment methods follow processor capability: cards, wallets and bank
  methods available in the connected processor.
- PAY-04 Idempotency key on every payment creation, refund and capture.
- PAY-05 Card data never read, stored, logged or key logged by the platform.
- PAY-06 Processor fraud signals, AVS, CVV and 3DS outcomes are honoured. The
  platform adds no card blocking rules beyond processor decisions and velocity
  limits.
- PAY-07 Velocity limits per merchant, per client and per IP, with thresholds set
  by super admin.
- PAY-08 Tokenized invoice payment link. After a successful payment the link is
  permanently closed for that invoice and further attempts are rejected.
- PAY-09 Payment link creation outside an invoice, shareable, with amount, expiry,
  description and optional client email.
- PAY-10 Payment link and hosted checkout availability controlled by the merchant
  plan.
- PAY-11 Partial payment allowed with a minimum of 20 USD per payment.
- PAY-12 Overpayment is rejected. Remaining balance is tracked on the document.
- PAY-13 Payment receipt page and PDF with processor reference, timestamp and
  amount.
- PAY-14 Payment attempt log visible to the merchant with decline reason category.
- PAY-15 Manual payment recording for bank transfer or offline settlement, with
  evidence upload and approval.
- PAY-16 Refund from dashboard, full or partial, bounded by captured amount minus
  refunded amount.
- PAY-17 Test and sandbox mode per merchant, isolated from the live ledger and
  clearly labelled in the UI.
- PAY-18 Multi processor failover is not automatic. A failed processor shows an
  actionable error and the merchant decides.
- PAY-19 Webhook intake per processor with signature verification, replay window
  and idempotent processing.
- PAY-20 Out of order webhook handling with monotonic state transitions.
- PAY-21 Dead letter queue with replay tool for failed webhook processing.
- PAY-22 Checkout page performance budget: no blocking third party script before
  the payment element is interactive.

## 9. REFUNDS, DISPUTES AND CHARGEBACKS

- DSP-01 Dispute intake from processor webhook with reason code, amount, deadline
  and evidence requirements.
- DSP-02 Dispute dashboard with status, deadline countdown and required documents.
- DSP-03 Merchant writes the dispute response and uploads documents. Compliance
  team reviews and submits through the processor.
- DSP-04 Structured evidence pack assembled in one action: invoice, delivery
  proof, communication log, client identity, terms acceptance, refund policy and
  transaction timeline, exported as a single PDF.
- DSP-05 Response deadline is 24 hours by default, extendable to 48 hours by super
  admin, computed in the merchant time zone.
- DSP-06 Overdue undisputed cases escalate automatically to compliance and to the
  merchant with reminder emails.
- DSP-07 Chargeback loss, including processor fees, is charged to the merchant
  ledger.
- DSP-08 Chargeback fee is configurable by super admin.
- DSP-09 Chargeback ratio monitoring with configurable thresholds based on card
  network programmes, not a fixed micro percentage.
- DSP-10 Accounts exceeding the configured chargeback threshold are suspended
  pending underwriting review.
- DSP-11 Refund fee treatment configured by super admin: platform fee returned or
  retained, per refund, with a default rule and per merchant override.
- DSP-12 Refund status synchronised from processor webhook and reflected in the
  ledger.
- DSP-13 Dispute outcome recorded with final amount, fee and ledger entries.
- DSP-14 Fraud reports and processor alerts stored against the merchant risk file.

## 10. LEDGER, FEES, SETTLEMENT, RESERVE AND PAYOUTS

- LEDG-01 Double entry ledger for the whole platform. Every movement has a debit
  and a credit and every entry balances to zero.
- LEDG-02 Merchant sub-ledger per merchant with available, pending, reserved and
  held balances.
- LEDG-03 Platform fee percentage configurable by super admin, per plan and per
  merchant override, effective dated.
- LEDG-04 Settlement hold period in days configurable by super admin, per plan and
  per merchant override.
- LEDG-05 Rolling reserve rate and release period configurable by super admin, with
  merchant specific override.
- LEDG-06 Reserve conditions disclosed at onboarding and accepted by the merchant
  with timestamp and document hash.
- LEDG-07 Reserve retained after account closure until the chargeback window
  closes.
- LEDG-08 Negative balance handled by reserve draw, then future settlement offset,
  then formal demand, then suspension.
- LEDG-09 Payout minimum of 100 USD. Amounts below the minimum roll over, and any
  remaining balance is paid after the holding period.
- LEDG-10 Payout request, approval and processing states with audit at every step.
- LEDG-11 Payout destination added by the merchant in profile, and created
  automatically in Payoneer or Airwallex through the API.
- LEDG-12 Bank account change requires manual verification first. The 96 hour
  cooling period starts only after verification passes.
- LEDG-13 During the cooling period payouts are disabled. The previous verified
  destination is not used as a fallback.
- LEDG-14 If verification fails, the cooling period never starts and the previous
  verified destination remains active.
- LEDG-15 Failed payout triggers an email to the merchant with the reason category
  and a retry path, and an alert to support.
- LEDG-16 Settlement statement downloadable as CSV and PDF per period.
- LEDG-17 Daily reconciliation between processor settlement reports and the ledger.
- LEDG-18 Reconciliation mismatch creates a case with owner, amount, age and a 3
  day resolution target, escalating after that.
- LEDG-19 Fee, refund, reserve, chargeback and payout entries all appear in the
  merchant statement with reference identifiers.
- LEDG-20 Ledger is append only. Corrections are new entries, never edits.
- LEDG-21 Balance is derived from entries and verified by a periodic recompute job.
- LEDG-22 Currency is USD for all ledger entries. Any processor settlement in
  another currency records the original amount, the rate and the USD amount with
  the rate source frozen on the entry.
- LEDG-23 Test mode transactions are written to a separate ledger scope and never
  affect live balances.

## 11. PLATFORM SUBSCRIPTION BILLING

- BILL-01 Plans with monthly and annual price, feature limits and a published
  pricing page.
- BILL-02 No coupons, promo codes or discount system for platform subscriptions.
- BILL-03 Subscription charge is collected through the platform master
  sub-merchant account on the processors where the platform itself is onboarded.
- BILL-04 Saved card for subscription billing is stored as a processor token at
  that processor only, with an explicit mandate consent recorded.
- BILL-05 Mandate consent text, timestamp, IP, device and document hash stored and
  shown in the merchant portal.
- BILL-06 When the merchant balance is zero or insufficient, the saved card is
  charged for the platform bill.
- BILL-07 Failed subscription charge after the due date restricts the account.
  All services stop, while login, billing page and support remain available.
- BILL-08 Warning emails start 7 days before the due date and continue until
  resolution.
- BILL-09 Service restoration is automatic on successful payment.
- BILL-10 Invoice and receipt for the platform subscription are generated and
  available in the billing page.
- BILL-11 Plan change is prorated, with an effective date and an audit entry.
- BILL-12 Plan price change is published 30 days before it takes effect, and the
  applicable price is versioned.
- BILL-13 Plan limits enforced server side: payment links, transaction volume,
  processor connections, users and storage.
- BILL-14 Suspended merchant can pay to restore service, and services return
  immediately on successful payment.

## 12. SALES TAX

- TAX-01 Sales tax collection is available through TaxCloud only.
- TAX-02 Collection applies to United States merchants and United States buyers
  only. Merchants outside the United States have no tax calculation and no tax
  lines.
- TAX-03 Auto collection toggle per merchant, off by default, enabled only when the
  merchant has a TaxCloud connection.
- TAX-04 Tax is calculated at checkout through the TaxCloud connection and stored
  on the payment and on the invoice as a tax line with jurisdiction reference.
- TAX-05 Tax exempt customer flag and certificate upload, passed to the tax
  calculation.
- TAX-06 Tax amount, jurisdiction and rate snapshot are stored with the document
  and never recalculated after issuance.
- TAX-07 Tax configuration health check shows missing connection, invalid
  credentials and calculation failures.
- TAX-08 No tax filing, no tax return, no tax report module. Only collection and
  the stored tax amounts.

## 13. CLIENTS, PRODUCTS AND INVOICING

- INV-01 Client records with name, business name, email, phone, billing address,
  country, tax identifier and notes.
- INV-02 Duplicate client detection on email, phone and name plus address.
- INV-03 Product and service catalogue with name, SKU, description, unit price,
  tax code and active flag.
- INV-04 Invoice creation with client, issue date, due date, currency USD, notes,
  terms, footer and attachments.
- INV-05 Line items with description, quantity, unit price, discount and tax code.
- INV-06 Line and document level discounts, percentage or fixed amount, applied
  correctly to totals.
- INV-07 Decimal only calculation with a documented rounding policy applied
  identically in preview, PDF and stored totals.
- INV-08 Invoice numbering, gapless per merchant, with prefix, suffix and padding,
  protected by a database lock.
- INV-09 Invoice statuses: draft, sent, viewed, partially paid, paid, overdue,
  void, disputed.
- INV-10 Status transition rules enforced in the service layer with an audit trail.
- INV-11 Invoice PDF in a United States and international acceptable format, with
  merchant branding, logo, address, tax lines and payment instructions.
- INV-12 Merchant logo and invoice branding configurable in settings and applied to
  all documents.
- INV-13 Business details entered once at onboarding and reused across invoices,
  checkout and statements.
- INV-14 Invoice list with search, filters, saved views, bulk actions and export.
- INV-15 Invoice duplicate detection on client, amount, date and line fingerprint.
- INV-16 Immutable snapshot of every issued invoice: rendered file, hash and
  timestamp.
- INV-17 Delivery by email with the tokenized link, plus copy link and resend.
- INV-18 Reminder schedule configurable per merchant, default every 5 days after
  the due date.
- INV-19 Partial payment display with remaining balance and payment history.
- INV-20 Void invoice requires a reason and keeps the snapshot and audit history.
- INV-21 No credit note.
- INV-22 No late fee.
- INV-23 No multi currency display, no exchange rate display for the client.
- INV-24 Client statement of account, downloadable as PDF.

## 14. ESTIMATES AND QUOTES

- EST-01 Estimate creation with the same line item engine as invoices.
- EST-02 Estimate sent by tokenized link with expiry date.
- EST-03 Client approval requires a digital signature with name, email, timestamp,
  IP address, device fingerprint, geolocation, document version and document hash.
- EST-04 Signature evidence stored immutably and downloadable with the signed
  document.
- EST-05 On approval the estimate automatically converts to an invoice and a
  payment link is generated.
- EST-06 On rejection or expiry the estimate becomes void and cannot be approved
  later. A new version must be issued.
- EST-07 Estimate statuses: draft, sent, viewed, approved, rejected, expired, void.
- EST-08 Conversion is idempotent. Repeated approval creates no second invoice.
- EST-09 Estimate PDF with the same branding and layout rules as invoices.

## 15. RECURRING INVOICES

- REC-01 Recurring schedule with frequency, interval, start date, end date, auto
  send flag and payment link generation.
- REC-02 Each cycle creates a new invoice through the same numbering and snapshot
  rules.
- REC-03 On payment failure there is no automatic retry. The invoice shows as due.
- REC-04 Reminder emails continue on the configured schedule after the due date.
- REC-05 Merchant can retry manually from the invoice page with one action.
- REC-06 Recurring invoice paused, resumed or cancelled with audit trail.
- REC-07 Failed cycle appears in a dedicated attention list on the dashboard.
- REC-08 Duplicate cycle protection by period key.

## 16. CLIENT PORTAL AND TOKENIZED LINKS

- PORT-01 All client facing pages use tokenized links. Clients never create an
  account and never log in.
- PORT-02 Link scope, expiry and single use for state changing actions.
- PORT-03 Invoice view page with download, payment and dispute information.
- PORT-04 Payment page with hosted processor fields.
- PORT-05 Estimate approval page with signature.
- PORT-06 Receipt page and download.
- PORT-07 Closed link state after successful payment, with a clear message.
- PORT-08 Expired and invalid link pages.
- PORT-09 Token leak protection: no indexing, strict referrer policy, rate limit,
  and optional email verification step before payment above a configured amount.
- PORT-10 Every token access logged with IP, device and outcome.
- PORT-11 Optional access PIN for high value invoices.
- PORT-12 Client facing pages carry merchant branding only, with no platform
  advertising.
- PORT-13 Accessible, mobile first, fast, with loading, error, empty and success
  states.

## 17. EMAIL SYSTEM

- MAIL-01 Email transport configured by SMTP credentials or by provider API key.
- MAIL-02 Separate configuration for platform transactional mail and platform
  marketing mail.
- MAIL-03 Email templates editable in the admin panel with variables, preview,
  versioning and per merchant override where allowed.
- MAIL-04 Activity emails for signup, verification, KYC status, payment received,
  payment failed, invoice sent, invoice reminder, dispute opened, dispute deadline,
  payout sent, payout failed, bank change, 2FA change, lock alert and subscription
  notice.
- MAIL-05 No automatic email on sub-merchant creation. The state is shown in the
  dashboard and covered by the status activity emails.
- MAIL-06 No in-app notification bell. All notifications are email or in-page
  announcements.
- MAIL-07 Delivery log with status, provider message id, bounce and complaint.
- MAIL-08 Suppression list for bounces and complaints.
- MAIL-09 SPF, DKIM and DMARC records documented, validated before launch and
  monitored for failure.
- MAIL-10 Sending volume limits, warm-up plan and separation of transactional and
  marketing domains recorded in operations.
- MAIL-11 Queue with retry and backoff for every outbound message.
- MAIL-12 English only template validation, no non-ASCII characters.

## 18. FILES AND STORAGE

- FILE-01 Files stored in the hosting storage provider: Supabase Storage on
  Supabase hosting, S3 compatible object storage on VPS or other hosts.
- FILE-02 Storage adapter interface so the provider can be replaced without
  touching feature code.
- FILE-03 AES-256-GCM encryption before upload, per merchant derived key, key
  version stored with the file record.
- FILE-04 Upload validation: MIME, magic bytes, extension allowlist, size cap,
  image re-encode, EXIF strip.
- FILE-05 Malware scan verdict required before the file becomes available.
- FILE-06 Signed, short lived download URLs for every private file.
- FILE-07 File registry with content hash, owner, purpose, retention and
  deduplication.
- FILE-08 File categories: KYC, invoices, receipts, dispute evidence, support
  attachments, branding, imports, statements.
- FILE-09 Storage usage counted per merchant and enforced against plan limits.
- FILE-10 Secure deletion with encryption key destruction where required by policy.
- FILE-11 No Google Drive integration.

## 19. SUPPORT, STATUS AND ANNOUNCEMENTS

- SUP-01 Support ticket system with categories, priority, status, assignment,
  internal notes and file attachments.
- SUP-02 Merchant sees ticket history, replies and attachments.
- SUP-03 First response target for financial or payment blocking issues is one
  business day.
- SUP-04 Payments stuck due to a platform issue receive a response within 72 hours
  with a resolution plan.
- SUP-05 SLA timers, breach flags and escalation to ceo.
- SUP-06 Canned responses and help articles referenced from tickets.
- SUP-07 Status page with component health, incident history and subscription to
  updates.
- SUP-08 Incident communication published on the status page and by email.
- SUP-09 Platform announcements created by super admin, shown as a popup until the
  user dismisses it, and dismissible per user.
- SUP-10 No on-call roster. Incident ownership is assigned by the super admin when
  an incident is opened.

## 20. PUBLIC WEBSITE, CMS, BLOG AND SEO

- WEB-01 Public pages are CMS editable, including home, features, pricing,
  industries, about, contact, legal, security, status and help.
- WEB-02 CMS editor with rich text, sections, media, revisions, scheduling and
  publish or unpublish.
- WEB-03 Blog with posts, categories, tags, author, scheduling, drafts, revisions
  and social preview image.
- WEB-04 Blogger role can create and publish posts and assigned pages only.
- WEB-05 Pricing page generated from plan data with features, limits and billing
  periods.
- WEB-06 Plan and price changes require 30 days published notice and are versioned
  so existing merchants keep their price until the effective date.
- WEB-07 SEO: per page title, description, canonical, Open Graph, Twitter card,
  sitemap, robots and structured data for organization, product, article, FAQ and
  breadcrumb.
- WEB-08 Redirect manager for changed URLs.
- WEB-09 No indexing of client portal links.
- WEB-10 Legal pages: terms, privacy, refund and settlement, acceptable use,
  prohibited businesses, AML and KYC policy summary, PCI statement, data
  processing agreement.
- WEB-11 Public security and trust page listing controls, certifications in
  progress and contact for security reports.
- WEB-12 Contact and sales lead form with spam protection.
- WEB-13 Platform branding, logo and content managed by super admin from settings.
- WEB-14 Core Web Vitals targets on all public pages.

## 21. MERCHANT DASHBOARD AND ANALYTICS

- DASH-01 Merchant home with gross volume, net volume, fees, upcoming payouts,
  outstanding invoices and disputes.
- DASH-02 Payments list with filters, search, export and processor reference.
- DASH-03 Settlement and payout view with statement download.
- DASH-04 Reserve and hold transparency: current hold, reserve balance, release
  dates and reason.
- DASH-05 Processor connection status with capability badges and required actions.
- DASH-06 Risk notices with reason category, remediation steps and appeal path.
- DASH-07 Dashboard queries served from aggregate tables and cache, with a defined
  query budget per page.
- DASH-08 Every widget has loading, error, empty and success states.
- DASH-09 Mobile first layout, usable at 320 pixels width, dark mode.

## 22. PLATFORM ACCOUNTING (LIMITED SCOPE)

- PACC-01 Platform own company accounting: income, expenses, processor fees,
  refunds, chargebacks, payouts and tax accrual.
- PACC-02 Processor statement reconciliation against platform ledger.
- PACC-03 Revenue reports by month, processor, plan and merchant.
- PACC-04 Expense entry with category, receipt and approval.
- PACC-05 Financial summary export for the platform accountant.
- PACC-06 No merchant access to this module. It is limited to super_admin and ceo.
- PACC-07 No full general ledger product for merchants. Merchant visible accounting
  stops at the ledger, statements and tax amounts in this document.

## 23. INTEGRATIONS AND PUBLIC API

- INT-01 Shopify app: platform owned app, submitted for approval, installed by the
  merchant, connected with merchant credentials, then active and functional.
- INT-02 WooCommerce plugin: platform owned plugin, installed by the merchant,
  connected with merchant credentials.
- INT-03 Both plugins create payments only for online store checkout. No invoice or
  portal features are exposed through them.
- INT-04 Merchant API credentials with scopes, rotation, revocation and last used
  timestamp.
- INT-05 API is not publicly documented or advertised. Credentials screen is inside
  the merchant dashboard and visible only to the owner.
- INT-06 API endpoints limited to what the plugins need: connection check, create
  payment, payment status, refund status, webhook registration.
- INT-07 Idempotency required on every API mutation.
- INT-08 API rate limits per merchant and per key.
- INT-09 Webhook delivery to merchant endpoints with signature, retry and delivery
  log.
- INT-10 Test mode for integrations, isolated from live data.
- INT-11 Data import for merchants: clients, products, invoices and opening
  balances from CSV, with validation report and row level errors.
- INT-12 Plugin and API failures reported to the merchant with actionable messages.

## 24. RISK, FRAUD AND MERCHANT LIMITS

- RISK-01 Risk score per merchant at onboarding and updated by behaviour.
- RISK-02 Transaction limits for new merchants: monthly volume cap, per transaction
  cap and payout cap, all configurable by risk tier.
- RISK-03 MCC based risk categories with additional reserve or longer hold for high
  risk categories.
- RISK-04 Sudden volume spike against expected volume holds the transaction for
  review.
- RISK-05 Card testing detection by attempt velocity and repeated low amounts.
- RISK-06 Account takeover signals trigger step-up authentication and review.
- RISK-07 Device and IP history stored per merchant with anomaly flags.
- RISK-08 Manual review queue for payments with approve, hold, refund or block
  actions, each with reason.
- RISK-09 Merchant watchlist and restriction states: normal, monitored, restricted,
  suspended, closed.
- RISK-10 Risk decisions audited with actor, reason code and evidence.
- RISK-11 Country enable and disable switches per processor capability, controlled
  by super admin and ceo.
- RISK-12 Periodic portfolio review report for compliance.

## 25. SECURITY, AUDIT AND DATA PROTECTION

- SEC-01 Row level security on every table with default deny and tenant scope.
- SEC-02 Append only audit log with hash chain, sequence gap detection and daily
  anchor.
- SEC-03 Security event stream separate from business audit, with severity and
  retention.
- SEC-04 Encryption at rest for documents, KYC files and credentials, and TLS 1.3
  in transit.
- SEC-05 Secrets in environment variables or encrypted credential tables only.
- SEC-06 Input validation and sanitization on every boundary, output encoding
  everywhere.
- SEC-07 Parameterized queries only, no dynamic SQL built from input.
- SEC-08 SSRF protection: outbound calls restricted to an allowlist of processor
  and service hosts.
- SEC-09 File upload protection per FILE-04 and FILE-05.
- SEC-10 Data classification for every table and column, with handling rules.
- SEC-11 Retention: 7 years for financial, KYC, dispute and audit records, then
  secure deletion.
- SEC-12 Data subject request workflow for access, correction and erasure, with
  legal retention override and a signed decision record.
- SEC-13 Merchant data export on request and on closure.
- SEC-14 Saved card tokens deleted on account closure and on processor disconnect.
- SEC-15 Employee access review quarterly, with revocation checklist.
- SEC-16 Dependency and secret scanning in CI, with build failure on a detected
  secret or critical vulnerability.
- SEC-17 Security headers with CSP nonce, HSTS, frame ancestors and referrer
  policy.
- SEC-18 No annual external penetration test in the launch scope. Internal
  hardening review and remediation log are maintained.
- SEC-19 Incident log with severity, timeline, customer communication and post
  incident actions.
- SEC-20 Backups daily with encryption, restore rehearsal record and documented
  recovery targets.

## 26. PERFORMANCE AND DATABASE LOAD

- PERF-01 Every page loads within the defined budget on a mid range mobile device
  and a cold cache.
- PERF-02 Query budget per page, enforced in code review: no unbounded query, no
  N+1, no repeated identical query in one request.
- PERF-03 Indexes for every foreign key, tenant filter and sort column, with unused
  index review.
- PERF-04 Pagination and keyset pagination on all lists, no offsets on large
  tables.
- PERF-05 Aggregates precomputed into summary tables and refreshed by job, so
  dashboards never scan raw tables.
- PERF-06 Caching layers: request level memoization, route segment cache, CDN for
  static and public pages, stale while revalidate for public content.
- PERF-07 Database connection pooling compatible with serverless concurrency.
- PERF-08 Heavy work moved to background jobs: PDF rendering, exports, imports,
  bulk email, reconciliation, statement generation.
- PERF-09 Serverless function cold start control: minimal dependencies on hot
  routes, no heavy SDK init at module scope where avoidable.
- PERF-10 Batching and bulk writes for ledger entries and webhook processing.
- PERF-11 Image optimization with responsive sizes and modern formats.
- PERF-12 Bundle discipline: route level code splitting, no large client library on
  public pages, budget per route.
- PERF-13 Rate limits and circuit breakers protect the database from abuse and
  retry storms.
- PERF-14 Read only caching for processor metadata, plan data and CMS content.
- PERF-15 Performance monitoring with slow query logging and alert thresholds.
- PERF-16 Load target and scale assumptions documented, with a growth path that
  does not require re architecting.

## 27. OPERATIONS, BACKUP AND LIFECYCLE

- OPS-01 Environment separation: local, staging, production, with separate
  credentials and processor keys.
- OPS-02 Migration procedure with forward and rollback scripts and a pre deploy
  backup.
- OPS-03 Daily backup, weekly restore test, and documented recovery point and time
  targets.
- OPS-04 Cron catalogue: reminders, recurring invoices, payout processing,
  reconciliation, reserve release, reconciliation case escalation, aggregate
  refresh, retention purge, token cleanup.
- OPS-05 Job monitoring with dead letter visibility and manual replay.
- OPS-06 Merchant lifecycle: signup, KYC, active, restricted, suspended,
  reactivating, closed, archived.
- OPS-07 Suspension flow: reason, notice, required documents, review, reactivation.
- OPS-08 Reactivation by payment when the cause is unpaid platform billing.
- OPS-09 Closure flow: payout after hold, reserve retained until chargeback window
  closes, data retained per policy, saved cards deleted.
- OPS-10 Audit trail for every lifecycle transition.
- OPS-11 Runbooks for processor outage, webhook backlog, reconciliation mismatch,
  payout failure, data breach suspicion and billing outage.
- OPS-12 Support handover notes and internal knowledge base.

## 28. CONFIGURATION CONTROLLED BY SUPER ADMIN AND CEO

- CFG-01 Platform fee percentage, default and per merchant override.
- CFG-02 Settlement hold period in days.
- CFG-03 Rolling reserve rate and release period.
- CFG-04 Minimum payout amount, default 100 USD.
- CFG-05 Bank change cooling period, default 96 hours.
- CFG-06 Refund fee treatment.
- CFG-07 Chargeback fee and chargeback ratio thresholds.
- CFG-08 Dispute response window, default 24 hours, maximum 48 hours.
- CFG-09 Velocity limits and risk thresholds.
- CFG-10 Merchant volume, transaction and payout limits per risk tier.
- CFG-11 Country enable and disable per processor.
- CFG-12 Plans, prices, limits and price effective dates.
- CFG-13 Active automatic KYC provider, or manual only.
- CFG-14 Processor credentials, test, enable and disable.
- CFG-15 Reminder schedule default and email templates.
- CFG-16 TaxCloud connection requirement and auto collection default.
- CFG-17 Announcement content, audience and dismissal behaviour.
- CFG-18 Retention period confirmation per data category.

## 29. FINAL EXCLUDED LIST (NOT BUILT)

- EXC-01 WhatsApp automation.
- EXC-02 Payroll.
- EXC-03 HR.
- EXC-04 Full accounting for merchants.
- EXC-05 Tax filing, tax returns and tax reports.
- EXC-06 Social media automation.
- EXC-07 Google Drive storage.
- EXC-08 VPN, proxy and Tor blocking.
- EXC-09 Late fee.
- EXC-10 Credit note.
- EXC-11 Merchant custom domain.
- EXC-12 Multi currency conversion or display for clients.
- EXC-13 Coupons or discounts on platform subscriptions.
- EXC-14 Same card blocked on the same invoice for 24 hours after success.
- EXC-15 Card token invalidation after two card or authentication failures in 24
  hours.
- EXC-16 Merchant staff accounts or invitations.
- EXC-17 In dashboard notification bell.
- EXC-18 On-call roster for incidents.
- EXC-19 Annual external penetration test in the launch scope.
- EXC-20 Automated test files.
- EXC-21 Eleven of the sixteen previously listed processors. Only NMI, Rainforest,
  Stripe Connect, Payoneer and Airwallex remain.
- EXC-22 Public API documentation portal and developer marketing.
- EXC-23 Client login accounts.
- EXC-24 Automated retry of failed recurring invoice charges.

## 30. OPEN VALUES TO CONFIRM BEFORE BUILD

- OPV-01 Platform fee percentage default.
- OPV-02 Hold period days default.
- OPV-03 Rolling reserve rate and release days default.
- OPV-04 Refund fee treatment default.
- OPV-05 Chargeback fee default.
- OPV-06 Merchant API availability by plan.
- OPV-07 Which processors are enabled for which countries at launch.
- OPV-08 Which plan limits apply to payment links and volume.
- OPV-09 Support operating hours and holiday calendar.
- OPV-10 Data retention confirmation for support tickets and marketing data.
