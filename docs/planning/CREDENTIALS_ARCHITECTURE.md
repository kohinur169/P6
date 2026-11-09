# Credentials Architecture — Environment Variables vs Super Admin

**Branch:** `arena/02f9dca9-p6`  
**Purpose:** Clarify why payment processor credentials are needed as environment variables AND what Super Admin configures.  
**Status:** Authoritative architectural decision.

---

## 1. Two Different Layers of Configuration

### Layer A: Environment Variables (Infrastructure Level)

These are the **platform's own API credentials** used to authenticate with each payment processor.

| Variable Example | Purpose | Who Sets It |
|------------------|---------|-------------|
| `STRIPE_SECRET_KEY` | Platform authenticates with Stripe API | Developer / DevOps at deploy time |
| `PAYROC_API_KEY` | Platform authenticates with Payroc API | Developer / DevOps at deploy time |
| `MAVERICK_CLIENT_SECRET` | Platform authenticates with Maverick API | Developer / DevOps at deploy time |
| `NMI_SECURITY_KEY` | Platform authenticates with NMI API | Developer / DevOps at deploy time |

**Why needed:** Without these, the platform cannot make any API call to the payment processors. The app will fail to start or fail to process payments.

**Security rule:** Never commit real values to Git. Use `.env.example` with placeholders. Set real values in hosting provider environment settings or GitHub Secrets.

---

### Layer B: Super Admin UI (Application Level)

These are **platform operational settings** managed through the admin dashboard.

| Setting | Stored In | Managed By |
|---------|-----------|------------|
| Which processors are enabled/disabled | Database (`payment_processors` table) | Super Admin |
| Default processor per merchant | Database (`merchant_settings` table) | Super Admin |
| Transaction fee percentage | Database (`fee_config` table) | Super Admin |
| Webhook endpoint URLs | Database + env override | Super Admin |
| Merchant-specific processor preferences | Database | Super Admin |

**Why needed:** Super Admin needs to turn processors on/off, set fees, and route merchants to specific processors without redeploying code.

**Security rule:** Super Admin UI should NOT accept raw API keys and store them in plain text in the database. API keys remain in environment variables or encrypted storage.

---

## 2. Deployment Flow

```
1. Developer sets environment variables (hosting platform / .env)
   └── STRIPE_SECRET_KEY=sk_xxx
   └── PAYROC_API_KEY=xxx
   └── MAVERICK_CLIENT_SECRET=xxx

2. Code is deployed to production

3. Super Admin logs into dashboard
   └── Enables/disables processors (NMI, Stripe, Payroc, Maverick, etc.)
   └── Sets default processor for new merchants
   └── Configures webhook URLs
   └── Sets transaction fees

4. Merchants sign up and select their preferred processor
   └── Platform uses stored env credentials to call processor APIs
   └── Super Admin settings determine routing and fees
```

---

## 3. What Super Admin Should NOT Do

| ❌ Do NOT | ✅ DO INSTEAD |
|-----------|--------------|
| Enter Stripe API secret key in Super Admin UI and save to database | Keep Stripe secret in `STRIPE_SECRET_KEY` env variable |
| Store Payroc API secret in plain text in database | Encrypt with `ENCRYPTION_MASTER_KEY` or keep in env variable |
| Allow Super Admin to change processor credentials without code review | Change credentials via env variable update + redeploy |

---

## 4. Why Both Are Required

| Scenario | Only Env Vars | Only Super Admin | Both (Correct) |
|----------|---------------|------------------|----------------|
| Platform connects to Stripe API | ✅ Works | ❌ No credentials | ✅ Works |
| Super Admin disables Stripe for EU merchants | ❌ No UI control | ❌ No credentials | ✅ Works |
| Rotate API keys without redeploy | ❌ Must redeploy | ✅ Can change | ✅ Use env vars + redeploy |
| Change default processor for new merchants | ❌ No UI control | ❌ No credentials | ✅ Works |

---

## 5. File References

| File | Purpose |
|------|---------|
| `docs/planning/ENV_VARS_DEPLOY_GUIDE.md` | All environment variables needed for deployment |
| `docs/planning/PAYMENT_PROCESSOR_SANDBOX_REGISTRATION_GUIDE.md` | Sandbox registration links for all 7 processors |
| `docs/planning/AGENT_CODING_PROMPT.md` | AI coding prompt — includes credential handling rules |
| `docs/planning/AI_AGENT_SECURITY_AUDIT_GUIDE.md` | Security audit — checks for hardcoded secrets |

---

## 6. Summary

- **Environment Variables** = Platform's own API keys to talk to payment processors. Required at deploy time.
- **Super Admin UI** = Operational settings (enable/disable, fees, routing). Required for day-to-day management.
- **Never** store raw API keys in database via Super Admin UI. Use environment variables or encrypted storage.
- Both layers are required for a secure, operable multi-processor payment platform.

এই স্থাপন వరtoires অনুসরণ করলে প্ল্যাটফর্মটি নিরাপদ এবং পরিচালনাযোগ্য হবে।