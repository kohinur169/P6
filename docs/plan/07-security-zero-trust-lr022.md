// path: docs/plan/07-security-zero-trust-lr022.md

# 07 - ZERO TRUST, ZERO TOLERANCE AND LR-022 SESSION SECURITY

Owner steps: STEP 03 (identity, session, lock, network intel), STEP 06 (files),
STEP 09 (payments), STEP 16 (completion and audit).

Principle: nothing is trusted because it is inside the network, inside a session, or
inside a request. Every request re-proves identity, device, session, permission and
intent. When a control cannot be evaluated, the request fails closed.

## 1. Control stack

| Layer | Control | Implemented in |
| --- | --- | --- |
| Network | TLS 1.3, HSTS preload, WAF, DDoS, DNSSEC, geo rules | 16 |
| Network identity | VPN, proxy, Tor, datacenter detection, IP reputation | 03 |
| Transport | CSP nonce, security headers, strict referrer policy | 01 |
| Session | Server session record, device proof, rotation, revocation | 03 |
| Authentication | Password policy, 2FA TOTP, step-up, login lock | 03 |
| Authorization | Deny by default RBAC, tenant scope, RLS | 02, 03 |
| Input | Zod, sanitization, canonicalization, size limits | 01, per step |
| Data at rest | AES-256-GCM, per tenant keys, key versioning | 06 |
| Files | MIME and magic byte check, scan, EXIF strip, signed URLs | 06 |
| Money | Decimal, idempotency, optimistic locking, advisory locks | 08, 09 |
| Audit | Append-only hash chain, anchors, SIEM | 02, 16 |
| Supply chain | Pinned versions, audit, secret scan, SAST | 16 |

## 2. LR-022 - real session theft, cookie replay, device proof, reauthentication, revocation, audit protection

### 2.1 Session model

Every login creates a row in `sessions` containing:

- `session_token_hash` (SHA-256 of the opaque token, never the token itself)
- `device_id` and `device_secret_hash`
- `user_agent_hash`, `ip_hash`, coarse geo
- `auth_level` (`password`, `mfa`, `step_up`) and `step_up_at`
- `absolute_expiry`, `idle_expiry`, `rotation_counter`, `revoked_at`, `revocation_reason`

No JWT is treated as the source of truth for authorization. The session row is.

### 2.2 Cookies

- `__Host-kd_session`: opaque session token, `HttpOnly`, `Secure`, `SameSite=Lax`,
  `Path=/`, no `Domain`.
- `__Host-kd_device`: device secret, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- `kd_csrf`: random token, readable by JavaScript, bound to the session id,
  rotated on privilege change.
- No session cookie is accepted without a matching, unexpired, unrevoked session row
  and a valid device proof. A copied cookie alone is useless.

### 2.3 Device proof

Each state-changing request and each sensitive read sends:

```
X-KD-Device-Proof: HMAC-SHA256(device_secret, session_id || rotation_counter || nonce)
X-KD-Nonce: <uuid v7>
X-KD-CSRF: <token>
```

Server recomputes and compares in constant time. Nonce is stored for the acceptance
window to prevent replay. Failure returns `session_invalid` and increments the risk
counter for the session; repeated failures revoke the session and raise a security
event.

### 2.4 Rotation and replay detection

- The session token rotates on login, on privilege change, on step-up, and at most
  every 15 minutes for active sessions.
- Each rotation stores the previous hash and increments `rotation_counter`.
- Presenting a rotated-out token is treated as theft: the entire session family is
  revoked, the user is notified by email, and a critical security event is written.
- Refresh tokens are never issued to the browser as long-lived credentials.

### 2.5 Request-level binding checks

Every state-changing request validates: `Origin` or `Referer` against the allowed
application origin, `Sec-Fetch-Site` not `cross-site`, CSRF token match, content type
allowlist, body size limit, session not idle-expired, device proof valid, and tenant
scope of the session equal to the resource tenant.

Anomaly signals that trigger step-up or revocation: change of user agent hash,
change of IP country, change of ASN, impossible travel, sudden concurrent sessions,
session used from a VPN after an earlier direct connection.

### 2.6 Reauthentication matrix

| Action | Requirement |
| --- | --- |
| Change password, email, 2FA factor | Password re-entry |
| Payment provider credentials, mode switch | Password + TOTP within 15 minutes |
| Payout approval, refund above threshold | Password + TOTP within 15 minutes |
| KYC decision, unlock account, role change | Password + TOTP within 15 minutes |
| Bulk export, data deletion, DSAR export | Password + TOTP within 15 minutes |
| Impersonation start | Password + TOTP + reason + audit |

Step-up writes `auth_level` and `step_up_at` on the session; expiry is enforced
server-side.

### 2.7 Revocation

Triggers: user logout, logout all devices, password change, email change, 2FA reset,
role or permission change, account lock, suspicious signal, admin action, tenant
suspension, provider security alert.

Mechanism: `sessions.revoked_at` set, plus `users.security_stamp` rotation. Every
request compares the session stamp with the user stamp. Realtime channel forces the
browser to sign out. Revocation takes effect on the next request, not on token
expiry.

### 2.8 Audit protection

- `audit_logs` is append-only: no update or delete policy exists for any role.
- Each row stores `previous_hash` and `current_hash`; a daily job writes a Merkle
  root to `audit_anchors` and uploads the anchor file to storage.
- Each row is signed with Ed25519 using a key held outside the database.
- Sequence numbers are gap checked; any gap raises a critical alert.
- Security events go to a separate table with its own retention and SIEM delivery.
- A verification job recomputes the chain and reports the first divergence.

## 3. Login lock

Rules:
- Two consecutive failed attempts, counting wrong password or wrong 2FA code, lock
  the account for 120 minutes.
- The lock is stored in `account_locks`; counters in `login_attempts`. Restart,
  redeploy or password reset do not clear the lock.
- While locked, correct credentials are rejected, password reset is refused, and
  the response is identical to a wrong password response.
- The owner receives an email alert with time, IP country, device summary, and a
  support reference. The email never contains a link that can unlock.
- Unlock is a privileged action: only a role with `account.unlock` permission, only
  after out-of-band contact with the owner is confirmed and recorded, with reason,
  actor, timestamp, correlation id, and an audit row.
- Unlock does not require the user to reset the password; both are independent.
- IP rate limits apply before the lock check to blunt enumeration and credential
  stuffing: 10 attempts per 10 minutes per IP, 5 per 10 minutes per ASN bucket.
- Error messages never reveal whether an account exists, is locked, or is disabled.

## 4. Payment security rules (summary, full detail in document 05)

- Card data only inside provider hosted fields or SDK. No PAN, no CVV, no key
  logging, no storage, no analytics.
- One successful card token per invoice, then blocked on that invoice for 24 hours.
- Two authentication failures on one token within 24 hours block the third attempt.
  Balance failures are excluded from the count.
- Blacklist by token or fingerprint, never by card number.
- Velocity limits per token, IP, invoice, client and company.
- 3DS preferred; without completed 3DS both billing postal code and payer IP country
  must match the invoice, otherwise manual review.
- VPN, proxy and Tor blocked on the payment page, payment API and gateway admin.
- Webhooks accepted only with a valid signature, processed idempotently.

## 5. Network and bot controls

- VPN, proxy, Tor and datacenter IPs blocked on signup, payment, KYC upload and
  every admin route. On login they are flagged and require 2FA.
- Cloudflare Turnstile on signup, login, password reset, contact and payment pages.
- IP reputation scoring with cached results in `ip_intel_cache`.
- Country allowlist and blocklist configurable, with an admin whitelist for known
  corporate egress ranges.
- Bot signals: headless detection, missing browser features, unrealistic timing,
  repeated identical payloads.

## 6. Input and output security

- Zod schema on every boundary, client and server, with canonicalization
  (trim, normalize unicode, lowercase emails, strip control characters).
- Sanitization with DOMPurify on the server for any stored rich text; store the
  sanitized value and keep the original only in an encrypted audit payload.
- Parameterized queries only; no string concatenation into SQL; no dynamic table
  names from user input.
- Output encoding by React plus explicit escaping for email and PDF.
- CSRF: double submit token plus origin check, enforced on every cookie-auth
  mutation.
- SSRF: outbound calls only to allowlisted provider hosts, DNS resolution pinned,
  no redirects, no user-controlled URL fetches except the custom gateway which is
  validated against an owner-defined allowlist.
- File uploads: extension and MIME allowlist, magic byte check, size caps, image
  re-encode, EXIF strip, malware scan verdict required before availability.
- Rate limit on every public endpoint, stricter on auth and payment.
- Security headers: CSP with nonce, `frame-ancestors`, `X-Content-Type-Options`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

## 7. Secrets and keys

- All secrets in environment variables or the encrypted credential tables.
- Encryption master key never in the database, never in the repository, never in a
  log or error payload.
- Per-tenant data keys derived with HKDF from the master key and the tenant id.
- Key version stored with each ciphertext; rotation re-wraps without re-encrypting
  consumer data where possible.
- Payment provider keys, SMTP passwords and Drive credentials are encrypted with
  AES-256-GCM and displayed only as a masked suffix.
- Secret scanning in CI; a detected secret fails the build.

## 8. Zero tolerance outcomes

| Event | Outcome |
| --- | --- |
| Session theft signal | Session family revoked, user notified, security event, owner alert |
| Repeated auth failure | Account locked 120 minutes, owner alerted |
| Card authentication abuse | Token blocked, blacklist entry, manual review |
| VPN on a blocked action | Request rejected, security event, no account disclosure |
| Audit chain divergence | Critical alert, incident opened, evidence preserved |
| Secret committed | Build fails, key rotated, incident recorded |
| Missing verification record for a provider | Adapter disabled, payment rejected |
| Missing control at runtime | Feature disabled, request rejected with typed error |
