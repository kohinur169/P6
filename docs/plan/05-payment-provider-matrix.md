// path: docs/plan/05-payment-provider-matrix.md

# 05 - PAYMENT PROVIDER MATRIX, ADAPTERS AND CARD RULES

Owner step: STEP 09 (framework, adapters, credential console, card rules),
STEP 10 (MoR, sub-merchant provisioning, tax, payouts, disputes).

## 1. Architecture

```
lib/payment/adapters/base.ts          Adapter contract and shared types
lib/payment/adapters/<provider>.ts    One file per provider, no shared state
lib/payment/registry.ts               Single registry: provider code to adapter
lib/payment/router.ts                 Deterministic routing, fails closed
lib/payment/credentials.ts            Encrypted credential read and write
lib/payment/verification-index.json   Which adapters have a verification record
services/payment/*                    Orchestration, state machine, audit
app/api/webhooks/<provider>/route.ts  Signature verify, idempotent processing
```

Adapter contract (implemented in 09.1) exposes typed methods:

```
getCapabilities(): ProviderCapabilities
createPaymentIntent(input): Promise<PaymentIntentResult>
confirmPayment(input): Promise<PaymentResult>
capturePayment(input): Promise<PaymentResult>
refund(input): Promise<RefundResult>
voidPayment(input): Promise<VoidResult>
verifyWebhook(input): Promise<VerifiedWebhookEvent>
createSubMerchant(input): Promise<SubMerchantResult>          // capability guarded
getSubMerchantStatus(input): Promise<SubMerchantStatus>       // capability guarded
testConnection(credentials): Promise<ProviderTestResult>
```

No adapter stores state. No adapter reads another provider's credentials. Every
adapter returns typed errors from `lib/errors/codes.ts`; no provider error text is
shown to a client.

## 2. Provider matrix (16 providers)

Mode legend: `hosted_checkout`, `hosted_fields` (tokenization through provider SDK,
card data never in our DOM), `embedded_components`, `redirect`, `server_api`
(merchant initiated, no card UI), `mor_hosted` (provider is merchant of record).

| # | Provider | Code | Integration modes | Adapter file | Sub-merchant capability |
| --- | --- | --- | --- | --- | --- |
| 1 | Stripe | `stripe` | hosted_fields, hosted_checkout, embedded_components, server_api | `stripe.ts` | Native: connected account creation, KYC collection, capability states |
| 2 | NMI | `nmi` | hosted_fields (Collect.js default), embedded_components (Payment Component), server_api | `nmi.ts` | Verify reseller and agent boarding capability in official docs |
| 3 | Adyen | `adyen` | embedded_components, hosted_checkout, server_api | `adyen.ts` | Native: account holder and balance account provisioning on platform setup |
| 4 | Verifone (2Checkout) | `verifone` | hosted_checkout, redirect, server_api | `verifone.ts` | Verify sub-account support in official docs |
| 5 | Braintree | `braintree` | hosted_fields, embedded_components, server_api | `braintree.ts` | Native: sub-merchant creation API |
| 6 | BlueSnap | `bluesnap` | hosted_checkout, hosted_fields, server_api | `bluesnap.ts` | Verify marketplace or sub-merchant support in official docs |
| 7 | Square | `square` | hosted_fields, hosted_checkout, server_api | `square.ts` | Not applicable: separate merchant accounts |
| 8 | Payoneer | `payoneer` | hosted_checkout, server_api (payouts) | `payoneer.ts` | Verify in official docs; payout rails are primary |
| 9 | FastSpring | `fastspring` | mor_hosted, server_api | `fastspring.ts` | Not applicable: provider is merchant of record |
| 10 | Paddle | `paddle` | mor_hosted, server_api | `paddle.ts` | Verify platform seller onboarding in official docs |
| 11 | PayPro Global | `paypro` | mor_hosted, server_api | `paypro.ts` | Not applicable: provider is merchant of record |
| 12 | PayPal | `paypal` | embedded_components, redirect, server_api | `paypal.ts` | Native: partner referral onboarding |
| 13 | Payarc | `payarc` | hosted_fields, server_api | `payarc.ts` | Verify merchant boarding through partner API |
| 14 | Rapyd | `rapyd` | hosted_checkout, embedded_components, server_api | `rapyd.ts` | Verify platform sub-merchant support in official docs |
| 15 | Authorize.Net | `authorizer` | hosted_fields, hosted_checkout, server_api | `authorizer.ts` | Verify reseller merchant creation API |
| 16 | Custom | `custom` | server_api with owner-defined HTTPS gateway | `custom.ts` | Manual, platform controlled |

Credential keys per provider (stored encrypted, never returned):
`publishable_or_public_key`, `secret_key`, `webhook_secret`, `merchant_id`,
`account_id`, `api_version`, `environment`.

Official documentation starting points. Each adapter must re-read the current
version from the provider's own site in the session that writes it:

- Stripe: https://stripe.com/docs/api , https://stripe.com/docs/testing
- NMI: https://docs.nmi.com/ , https://docs.nmi.com/docs/collectjs ,
  https://docs.nmi.com/docs/testing-sandbox , https://docs.nmi.com/llms.txt
- Adyen: https://docs.adyen.com/ ,
  https://docs.adyen.com/development-resources/testing/
- Verifone: https://docs.verifone.com/ ,
  https://www.verifone.com/development-partner
- Braintree: https://developer.paypal.com/braintree/docs ,
  https://developer.paypal.com/braintree/help/sandboxHelp
- BlueSnap: https://developers.bluesnap.com/ ,
  https://developers.bluesnap.com/llms.txt
- Square: https://developer.squareup.com/docs ,
  https://developer.squareup.com/docs/testing/sandbox
- Payoneer: https://developer.payoneer.com/docs/payoneer-api-reference ,
  https://developer.payoneer.com/
- FastSpring: https://developer.fastspring.com/reference/api-overview
- Paddle: https://developer.paddle.com/ , https://developer.paddle.com/sdks/sandbox/
- PayPro Global: https://developers.payproglobal.com/docs/api/overview/
- PayPal: https://developer.paypal.com/api/rest/ ,
  https://developer.paypal.com/sandbox-testing/overview
- Payarc: https://docs.payarc.net/
- Rapyd: https://docs.rapyd.net/
- Authorize.Net: https://developer.authorize.net/api/reference/index.html ,
  https://developer.authorize.net/hello_world/sandbox.html ,
  https://developer.authorize.net/hello_world/testing_guide.html
- Custom: internal specification `docs/providers/custom/SPEC.md`

Where the provider's site does not publish a sandbox page, the adapter's
verification record must state the location found inside that provider's own
documentation index, and the adapter stays disabled until a sandbox test succeeds.

## 3. Documentation verification protocol (hard gate)

Before an adapter file is written:

1. Open the provider's official documentation in the current session.
2. Capture: documentation urls, retrieval timestamp, api version, auth scheme,
   environments, endpoint list used, request and response field names,
   webhook signature scheme and replay window, idempotency header, capture and
   refund flow, 3DS parameters, sub-merchant flow, test data source.
3. Write `docs/providers/<code>/VERIFICATION.md` with those facts and a
   compatibility note naming the adapter version.
4. Update `lib/payment/verification-index.json` in the same commit.
5. Only then write the adapter.

Enforcement: `registry.ts` exposes `isAdapterVerified(code)`. The credential
console refuses to enable an unverified provider with error
`adapter_not_verified`. The router refuses to route to it. No adapter is written
from memory, and no endpoint is guessed.

`VERIFICATION.md` template sections: Provider, Retrieved at, Source urls,
Api version, Environments, Authentication, Endpoints used, Request fields,
Response fields, Webhook signature, Idempotency, Capture flow, Refund flow,
3DS parameters, Sub-merchant flow, Test data, Adapter notes, Reviewer.

## 4. NMI dual mode

- Mode A `collect_js` (default): Collect.js hosted fields produce a one-time token
  valid for a single use within 24 hours. Server sends the token to the NMI REST
  API. Our server never sees card data.
- Mode B `payment_component`: requires an npm package that the integrator adds to
  `package.json` after review. Until the package is present, mode B cannot be
  enabled; the console returns `dependency_missing`.
- Both modes terminate in one shared server module `services/payment/nmi-shared.ts`
  so business rules are identical.
- One active mode per provider at a time, stored in `payment_provider_settings`
  (`active_mode`).
- Switching mode requires a successful sandbox test in the new mode, a reason, a
  step-up reauthenticated super admin, and an audit row with before and after state.
- Token reuse is rejected: a used token hash is stored in `payment_attempts` and a
  repeat submission returns `token_already_used`.

## 5. Super admin credential console (STEP 09.7)

Route: `app/(admin)/gateways/` with API `/api/admin/gateways`.

Capabilities: choose provider from registry, enter credentials, run test, enable or
disable, rotate keys, switch mode, view masked values and last update time.
Never shows a stored secret; shows last four characters and `last_updated_at`.

Guards:
- super_admin only, 2FA verified, step-up reauthentication within 15 minutes.
- Provider must exist in the registry and have a verification record.
- Enable is blocked unless `last_test_result = success` for the same credential
  version in the same environment.
- Every action writes an audit row with actor, provider, environment, action,
  result, correlation id, and masked key fingerprints.
- Credentials encrypted with AES-256-GCM. Key material only in environment
  variables. No secret in logs, no secret in error messages, no secret in Sentry.
- Test and live environments are separate records; switching to live requires an
  explicit confirmation and a second approver (dual approval per platform policy).

## 6. Routing rules (fail closed)

Evaluation order:

1. Tenant explicit provider selection (if enabled and healthy).
2. Tenant routing rules by priority: country, currency, amount range, card brand,
   method type, mode, provider health threshold.
3. Platform default for the method type.
4. No match: reject with `no_payment_route`. The payment is cancelled. It is never
   forwarded to another provider automatically.

Additional constraints: provider must be enabled, verified, credentialed for the
environment, and healthy inside the configured success rate window. Routing
decisions and the evaluated rule id are stored on `payment_intents`.

## 7. Webhooks

- Route per provider `app/api/webhooks/<provider>/route.ts`.
- Raw body captured before parsing; signature verified with the provider's own
  scheme and secret; timestamp tolerance enforced; unsupported algorithm rejected.
- `webhook_events` stores provider event id with a unique index. Duplicate delivery
  returns 200 without side effects.
- Processing is idempotent and monotonic: a late event cannot regress a payment
  state. Unknown event types are stored and acknowledged, never acted on blindly.
- Failed processing retries with backoff; after the limit the event is marked dead
  and appears in the admin replay tool.

## 8. Card rules and payment safety

Card data:
- Card number, expiry and CVV are entered only in the provider's own secure form,
  iframe or SDK. Our code never reads, transmits, stores or logs them.
- No key logging, no autocomplete capture, no DOM scraping, no copy handler that
  reads the input, no analytics on the payment element.
- Our server accepts only provider tokens. A request containing a PAN pattern is
  rejected before validation and logged as a security event.

Reuse rule per invoice:
- After one successful payment with card token C on invoice I, token C is blocked
  for invoice I for 24 hours. Other invoices are unaffected.
- Stored in `card_invoice_usage` with `success_at` and `expires_at`.

Authentication failure counting:
- Invalid number, invalid CVV, wrong OTP, 3DS failure are counted per card token in
  a 24 hour window.
- Two such failures on one token within 24 hours block the third attempt. The block
  is stored in `card_failure_counters.blocked_until`.
- Insufficient funds and issuer declines unrelated to authentication are excluded.
- Every increment and block writes a security event with token hash only.

Blacklist:
- Immediate rejection when the provider's fraud signal marks the card, or when our
  `card_blacklist` contains the token hash or fingerprint hash.
- Blacklist is always derived from token or provider fingerprint, never from a card
  number.

Velocity limits: defaults in `config/payment-limits.ts`, all configurable:
- 3 attempts per card token per 10 minutes.
- 10 attempts per IP per hour.
- 5 attempts per invoice per hour.
- 10 attempts per client per hour.
- 30 attempts per company per hour.
- Amount anomaly threshold triggers manual review, not rejection.

VPN, proxy and Tor: blocked on the payment page, the payment API and the admin
gateway console. Decision recorded on the intent.

## 9. 3D Secure policy

- Request 3DS whenever the provider supports it for the method and region.
- If 3DS is completed successfully, proceed.
- If 3DS is not completed, the payment may proceed only when both conditions hold:
  billing postal code matches the invoice billing postal code, and the payer IP
  country matches the invoice country.
- If either condition fails, the payment is not captured and the intent enters
  `manual_review_queue` with reason `verification_incomplete`.
- The rule is identical across providers; only the parameter mapping differs.

## 10. Failure, retry and manual review

- No automatic retry on a declined card. A new attempt requires a new intent.
- Network and provider 5xx errors retry idempotently with the same key, maximum
  three attempts, exponential backoff.
- Manual review queue actions: approve capture, void, refund, blacklist token.
  Every action requires a reason and writes an audit row.
- Provider error mapping table lives in `lib/payment/error-map.ts`; unmapped codes
  become `provider_error_unmapped` and are logged for triage.

## 11. Refunds, partials and fees

- Refund supports full and partial amounts with decimal precision, never exceeding
  captured amount minus already refunded amount.
- Approval chain applies: staff request, owner or finance approval, super_admin for
  amounts above configured threshold.
- Fee calculation is stored per payment so reporting reconciles without recompute.
- Surcharge and fee display follows card network rules and the tenant's jurisdiction
  configuration; unsupported combinations are disabled, not guessed.

## 12. Test protocol per provider (must be recorded)

1. Sandbox credentials only during adapter development.
2. Test card data taken from the provider's own testing page, never invented.
3. Cases executed: success, decline, 3DS challenge, 3DS failure, refund full,
   refund partial, void before capture, webhook duplicate, webhook invalid
   signature, timeout with retry, sub-merchant creation where supported.
4. Results written into `docs/providers/<code>/VERIFICATION.md` under Test data and
   Adapter notes, with timestamps and correlation ids.
5. Adapter may be enabled in test environment after all cases pass. Production
   enabling is a separate audited action by the super admin.
