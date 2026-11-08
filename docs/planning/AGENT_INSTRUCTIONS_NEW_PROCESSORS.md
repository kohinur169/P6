# Arena.ai Agent Instructions — Add Payroc & Maverick Acquiring Processors

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only (code, comments, strings, documentation)  
**Status:** Authoritative implementation guide  
**Owner:** Platform Team / Payments Squad

---

## ১. লক্ষ্য (Objective)

আপনার কাজ:
১. পেমেন্ট फैसिलিটেটর প্ল্যাটফর্মে **Payroc** এবং **Maverick**െ নতুন অ্যাকুইরিং প্রসেসর হিসেবে যুক্ত করা।
২. **সাইনআপ এবং KYB/KYC ভেরিফিকেশন ফ্লোকে আলাদা করা** — সাইনআপে শুধু মৌলিক অ্যাকাউন্ট তথ্য, নীতিমালা শুধু ভেরিফিকেশনের আগে দেখানো।
৩. পুরনো STEP ১-২৫০ কিছুই বদলা যাবে না। নতুন STEP ২৫১-২৫৮ append-only ভাবে থাকবে।

---

## ২. প্ল্যানিং ডকুমেন্ট গুলো (পূর্বে তৈরি, আপলোড করতে হবে)

নিম্নলিখিত ফাইলগুলি `/home/user/P6` রেপোতে তৈরি হয়ে আছে। এগুলো কোডিং রেপোতে আপলোড করে এজেন্টকে দিতে হবে:

| SL | ফাইল পাথ | উদ্দেশ্য |
|----|----------|---------|
| ১ | `docs/final/STEP_PLAN_250.md` | মোট ২৫৮ STEP; ২৫১-২৫৮ Payroc/Maverick এর জন্য |
| ২ | `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| ৩ | `docs/final/API_CONTRACT.md` | সঠিক API এন্ডপয়েন্ট, রিকোয়েস্ট/রেসপন্স JSON, ওয়েবহুক |
| ৪ | `docs/planning/SHOPIFY_APP_PLAN.md` | শপিফাই অ্যাপ বিল্ড প্ল্যান |
| ৫ | `docs/planning/WOOCOMMERCE_PLUGIN_PLAN.md` | ও stories প্লাগইন বিল্ড প্ল্যান |
| ৬ | `docs/planning/DATABASE_SETUP.md` | সুপাবase ডাটাবেস সেটআপ প্ল্যান |
| ৭ | `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` | সাইনআপ vs ভেরিফিকেশন ফ্লো সংশোধন |
| ৮ | `docs/planning/wc-kd-woocommerce-payment.php` | WooCommerce প্রধান প্লাগইন ফাইল (টেমপ্লেট) |
| ৯ | `docs/planning/wc-includes-class-kd-payment-settings.php` | WooCommerce সেটিংস ক্লাস |
| ১০ | `docs/planning/wc-includes-class-kd-payment-api.php` | WooCommerce API ক্লায়েন্ট ক্লাস |
| ১১ | `docs/planning/wc-includes-class-kd-payment-gateway.php` | WooCommerce পেমেন্ট গেটওয়ে ক্লাস |
| ১২ | `docs/planning/wc-includes-class-kd-payment-webhooks.php` | WooCommerce ওয়েবহুক ক্লাস |
| ১৩ | `docs/planning/shopify-app-route-install.ts` | Shopify OAuth install রুট |
| ১৪ | `docs/planning/shopify-app-route-callback.ts` | Shopify OAuth callback রুট |
| ১৫ | `docs/planning/shopify-app-webhook-verify.ts` | Shopify ওয়েবহুক ভেরিফিকেশন |
| ১৬ | `docs/planning/shopify-app-webhook-order-created.ts` | Shopify ওয়েবহুক অর্ডার কريتেড |
| ১৭ | `docs/planning/shopify-app-encryption.ts` | AES-256-GCM এনক্রিপশনutility |
| ১৮ | `docs/planning/shopify-app-platform-client.ts` | প্ল্যাটফর্ম API ক্লায়েন্ট (Shopify) |
| ১৯ | `docs/planning/shopify-app-env.example` | Shopify এনভায়রনমেন্ট ভ্যারিয়েবল |
| ২০ | `docs/planning/woocommerce-plugin-env.example` | WooCommerce এনভায়রনমেন্ট ভ্যারিয়েবল |

---

## ৩. STEP প্ল্যানিং (অপরিবর্তিত ১-২৫০, নতুন ২৫১-২৫৮)

### ৩.১ আগের ২৫০ STEP freeze
- STEP ১-১২৩ ( podpis লেখা অংশ) — ১০০% intact থাকবে।
- STEP ১-২৫০ এর কোনো নম্বর, টাইটেল, মালিকানা বদলা যাবে না।
- কমিট করা মাইগ্রেশন এডিট করা যাবে না।

### ৩.২ নতুন STEP ২৫১-২৫৮ (Payroc + Maverick)

| STEP | タイトル | মালিকানা (ফাইল/ফোল্ডার) |
|------|---------|------------------------|
| 251 | Payroc docs verification + sandbox notes | `docs/final/PROVIDER_DOCS.md` (extend) |
| 252 | Payroc encrypted key + connection test | `lib/payments/adapters/payroc/` (এক ফাইল) |
| 253 | Payroc payment acceptance (sale/auth/capture/refund/void) | `lib/payments/adapters/payroc/` |
| 254 | Payroc sub-merchant provisioning + idempotent webhooks | `lib/payments/adapters/payroc/` |
| 255 | Maverick docs verification + sandbox notes | `docs/final/PROVIDER_DOCS.md` (extend) |
| 256 | Maverick encrypted key + connection test | `lib/payments/adapters/maverick/` (এক ফাইল) |
| 257 | Maverick payment acceptance (sale/auth/capture/refund/void) | `lib/payments/adapters/maverick/` |
| ২৫৮ | Maverick sub-merchant provisioning + idempotent webhooks | `lib/payments/adapters/maverick/` |

**OWNERSHIP RULE:** প্রতিটি STEP ঠিক এক ফাইল/ফোল্ডারের মালিকানা রাখবে। `lib/payments/registry.ts` এ নতুন এন্ট্রি যোগ করা যাবে (STEP 252/256 এর অধীন), কিন্তু আগের ৫ টা প্রসেসরের এন্ট্রি পরিবর্তন করা যাবে না।

---

## ৪. সঠিক টার্গেট UI/UX ফ্লো (অটোমেটিক বিল্ড করার জন্য)

এজেন্টকে নিচের ধারায় UI/UX বিল্ড করতে হবে। কোনো ধাপ বাদ দেওয়া যাবে না।

### ধাপ ১: সাইনআপ পেইজ (Account Creation)
**URL:** `/auth/signup`

**দৃশ্যমান ফিল্ড:**
- ইমেইল (বাধ্যতামূলক)
- পাসওয়ার্ড (বাধyntাatory)
- পূর্ণ নাম (বাধyntাatory)
- ফোন নম্বর (বাধyntাatory)
- Cloudflare Turnstile verification
- চেকবক্স: "আমি টার্মস অফ সার্ভিস ও প্রাইভেসি নোটিস পড়েছি ও গৃহীত করছি" (বাধyntাatory)

**দৃশ্যমান পলিসি:** **কোনো কম্প্লায়েন্স পলিসি নেই** (KYC/KYB, UBO, AML/CFT, সানকশন/PEP, আন্ডাররাইটিং, মর্চেন্ট অ behaviors, chargeback, refund, fraud, ডাটা প্রাইভেসি, PCI-DSS — এই সব দেখাবে না)।

**সাবমিটের পর:** ইমেইল ভেরিফিকেশন ইমেইল পাঠানো → অ্যাকাউন্ট সক্রিয় → ড্যাশবোর্ডে রিডাইরেক্ট।

---

### ধাপ ২: বিজনেস প্রোফাইল ও KYB ডকুমেন্ট আপলোড (KYB Submission Draft)
**URL:** `/dashboard/kyb/business-profile`

**দৃশ্যমান ফিল্ড:**
- ব্যবসার নাম
- ব্যবসার রেজিস্ট্রেশন নম্বর / ট্রেড লাইসেন্স নম্বর
- ম declaration (সெய் Ryan)
- MCC (Merchant Category Code)
- ট্যাক্স আইডি / স্থানীয় সমতুল্য
- ব্যবসার ঠিকানা
- ওয়েবসাইট / স্টোর লিঙ্ক
- পওআউট ব্যাংক অ্যাকাউন্ট বিবরণ
- ডকুমেন্ট আপলোড (AES-256-GCM এনক্রিপ্টেড):
  - বিজনেস রেজিস্ট্রেশন সার্টিফিকেট / ট্রেড লাইসেন্স
  - ট্যাক্স সার্টিফিকেট
  - অ্যাড্রেস প্রুফ (ইউটিলিটি বিল, ব্যাংক স্টেটমেন্ট, ৯০ দিনের মধ্যে ইস্যু করা)
  - পওআউট ব্যাংক স্টেটমেন্ট / ভেরিফিকেশন
  - ওনারশিপ কাঠামো (UBO লিস্ট)
  - প্রতিটি ডিরেক্টর এবং ২৫%+ UBO-এর আইডেনটিটি ডকুমেন্ট ও সেলফি/লাইভনেস

**দৃশ্যমান পলিসি:** কোনো কম্প্লায়েন্স পলিসি দেখাবে না। শুধু ডকুমেন্ট আপলোড ফরম।

---

### ধাপ ৩: নীতিমালা acceptor পেইজ (Policy Acceptance)
**URL:** `/dashboard/kyb/policy-acceptance`

**দৃশ্যত:** একটি মোডাল বা পেজে নিম্নলিখিত ১১ টি পলিসি তালিকাভুক্ত হবে, প্রতিটির সামনে চেকবক্স সহ:

1. KYC and KYB Policy
2. UBO Policy
3. AML and CFT Policy
4. Sanctions and PEP Screening Policy
5. Underwriting and Risk Assessment Policy
6. Merchant Acceptance and Prohibited and Restricted Businesses Policy
7. Chargeback and Dispute Management Policy
8. Refund and Settlement Policy
9. Fraud and Risk Management Policy
10. Data Privacy and Security Policy
11. PCI-DSS Compliance Policy

**চেকবক্স লেবেল:** "আমি [পলিসির নাম] পড়েছি ও গৃহীত করছি"  
**বাটন:** "সব নীতিমালা গ্রহণ করে ভেরিফিকেশনের জন্য জমা দিন" (শুধু সব চেকবক্স চেক করলে সক্রিয়)

**পলিসি কন্টেন্ট:** প্রতিটি পলিসির নাম ক্লিক করলে পুরো পলিসি ডকুমেন্ট খুলবে (CMS-editable পেজ)। পলিসির versie (version) এবং effective date দেখাতে হবে।

---

### ধাপ ৪: ভেরিফিকেশন সাবমিশন (Final Submit)
**URL:** `/dashboard/kyb/submit`

**প্রক্রিয়া:**
1. চেক করা হবে সistyczно সব প্রয়োজনীয় পলিসি accepter করা আছে কিনা।
2. যদি সব পলিসি accepter না থাকে → `422 Unprocessable Error` রিটার্ন করবে: "All required policies must be accepted before KYB submission."
3. যদি সব পলিসি accepter থাকা → `POST /api/v1/kyb/submit` কল করা হবে।
4. সফল হলে `kyc_submissions` টেবিলে স্ট্যাটাস `submitted` লিখবে।
5. গ্রাহককে নোটিফিকেশন: "আপনার ভেরিফিকেশন আবেদন জমা দেওয়া হয়েছে। আমরা সমीक्षा করছি।"

---

## ৫. ডাটাবেস স্কিমা (Append-Only Migration)

**মাইগ্রেশন নম্বর:** `STEP_PLAN_250.md`-এর সর্বোচ্চ committed migration নম্বর ইন্সপেক্ট করে এরপর unused number ব্যবহার করবে (যেমন: 0261, 0262)। পুরনো কোনো মাইগ্রেশন এডিট করবে না।

### ৫.১ টেবিল: `policy_versions`

```sql
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content_url TEXT NOT NULL,
    effective_from TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version_int INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_key ON policy_versions(policy_key);
CREATE INDEX IF NOT EXISTS idx_policy_versions_is_active ON policy_versions(is_active);

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_versions_public_read ON policy_versions
    FOR SELECT TO authenticated
    USING (is_active = true);
```

### ৫.২ টেবিল: `merchant_policy_acceptance`

```sql
CREATE TABLE IF NOT EXISTS merchant_policy_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    policy_version_id UUID NOT NULL REFERENCES policy_versions(id),
    accepted_at TIMESTAMPTZ DEFAULT now(),
    accepted_from_ip INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version_int INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_merchant_policy_acceptance_company_id ON merchant_policy_acceptance(company_id);
CREATE INDEX IF NOT EXISTS idx_merchant_policy_acceptance_policy_version ON merchant_policy_acceptance(policy_version_id);

ALTER TABLE merchant_policy_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_policy_acceptance_company_isolation ON merchant_policy_acceptance
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

### ৫.৩ টেবিল: `kyc_submissions`

```sql
CREATE TABLE IF NOT EXISTS kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    policies_accepted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version_int INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_company_id ON kyc_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);

ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY kyc_submissions_company_isolation ON kyc_submissions
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

---

## ৬. API কন্ট্রাক্ট (অত্যಂತ নিখুঁত)

### ৬.১ `POST /api/v1/policies/accept`

**Request:**
```json
{
  "company_id": "uuid-v7",
  "acceptances": [
    {
      "policy_version_id": "uuid-v7",
      "accepted_from_ip": "203.0.113.45",
      "user_agent": "Mozilla/5.0 ..."
    }
  ]
}
```

**Response (সফল):**
```json
{
  "success": true,
  "data": {
    "accepted_count": 11,
    "all_policies_accepted": true,
    "kyb_submission_allowed": true
  },
  "request_id": "uuid-v7",
  "timestamp": "2026-11-07T12:00:00Z"
}
```

### ৬.২ `POST /api/v1/kyb/submit`

**Request:**
```json
{
  "company_id": "uuid-v7",
  "business_profile_id": "uuid-v7",
  "documents": [...]
}
```

**Response (সফল):**
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid-v7",
    "status": "submitted",
    "submitted_at": "2026-11-07T12:00:00Z"
  }
}
```

**Response (ব্যর্থ - পলিসি acceptor নেই):**
```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "All required policies must be accepted before KYB submission.",
    "details": [
      {"field": "policies", "issue": "Missing acceptance for KYC and KYB Policy"}
    ]
  }
}
```

---

## ৭. নতুন একুইরিং প্রসেসর (Payroc + Maverick) যুক্ত করার পদ্ধতি

### ৭.১ ডকুমেন্টেশন ভেরিফিকেশন (STEP 251/255)
- কোডিং সেশনে Payroc (`payroc.com`) ও Maverick (`maverick.com`) এর অফিসিয়াল API ডকুমেন্টেশন ও স্যান্ডব্যাক্স পেজ পড়তে হবে।
- ভেরিফাইড URL `docs/final/PROVIDER_DOCS.md`-এ লিখতে হবে (পুরনো ৫ টা প্রসেসরের ডকুমেন্টেশন মুছে ফেলা যাবে না)।

### ৭.২ এনক্রিপ্টেড কী কনফিগারেশন (STEP 252/256)
- `lib/payments/adapters/payroc/` এবং `lib/payments/adapters/maverick/` ফোল্ডার তৈরি করা।
- অ্যাক্সেস কী AES-256-GCM এনক্রিপ্টেড রূপে ডাটাবেসে সেভ করা।
- কানেকশন টেস্ট সফল ছাড়া প্রসেসর এনেবল করা যাবে না।
- পূর্ণ কী সেভ করার পর আর দেখাবে না, শুধু শেষ ৪ অক্ষর।

### ৭.৩ পেমেন্ট গ্রহণ (STEP 253/257)
- sale/authorization/capture/refund/void অপারেশন।
- আইডempootেন্সি কী প্রতিটি পেমেন্টে।
- ডাবল-এন্ট্রি লেজার এন্ট্রি (payment received, platform fee, hold, reserve, settlement)।
- 3D Secure অনুরোধ।
- রুটিং রুলস: কোনো রুল মেলে না হলে পেমেন্ট রিজেক্ট, সাইলেন্ট ফলব্যাকে যাবে না।

### ৭.৪ সাব-মার্চ্যান্ট প্রোভিশনিং ও ওয়েবহুক (STEP 254/258)
- প্রসেসরের গেটওয়ে থেকে সাব-মার্চ্যান্ট ক্রিয়েশন।
- প্রোভাইডার স্টেট (pending/action_required/verified/restricted/rejected) আলাদা আলাদা পাসিস্ট করা।
- ওয়েবহুক শুধু সিগনেচার ভেরিফিকেশনের পর গ্রহণ করা হবে, আইডempootেন্সি প্রসেসিং।

---

## ৮. নিরাপত্তা ও কমপ্লায়েন্স (বাধyntাatory)

| নিয়ম | বাস্তবায়ন |
|------|----------|
| অ্যাক্সেস টোকেন এনক্রিপশন | AES-256-GCM, কী শুধু এনভায়রনমেন্ট ভ্যারিয়েবলে |
| ওয়েবহুক ভেরিফিকেশন | Shopify HMAC SHA-256 / WooCommerce সিক্রেট ছাড়া কোনো ওয়েবহুক প্রসেস নয় |
| কার্ড ডাটা | প্ল্যাটফর্ম সার্ভার কখনো প্যান/এক্সপিরি/সিভিভি দেখবে না |
| RLS | `company_id` দ্বারা ট্যানেন্ট আইসোলেশন |
| অডিট লগ | কানেক্ট/ডিসকানেক্ট, ওয়েবহুক রিসিভ, অর্ডার সিঙ্ক সব অডিট লগড |
| মাস্কিং | পূর্ণ কী/সিক্রেটCreate করার পর একবারই দেখাবে, তারপর শুধু শেষ ৪ অক্ষর |

---

## ৯. ডেফিনিশন অফ ডন (কাজ শেষের শর্ত)

- [ ] সাইনআপ পেইজে কোনো কম্প্লায়েন্স পলিসি দেখাবে না
- [ ] সাইনআপের শুধু মৌলিক টার্মস অফ সার্ভিস থাকবে
- [ ] বিজনেস প্রোফাইল পেইজে কোনো পলিসি দেখাবে না
- [ ] পলিসি accepter পেইজে সব ১১ টি পলিসি দেখাবে
- [ ] শুধু সব পলিসি accepter করলে KYB সাবমিট বাটন সক্রিয় হবে
- [ ] `POST /api/v1/kyb/submit` পলিসি acceptor না থাকলে `422` রিটার্ন করবে
- [ ] পলিসি accepter রেকর্ডে `accepted_from_ip` ও `user_agent` সেভ হবে
- [ ] RLS এনabled থাকবে `company_id` দ্বারা
- [ ] অডিট লগে পলিসি acceptor ও KYB সাবমিশন লিখিত होगा
- [ ] ইউনিট টেস্ট পাস করবে
- [ ] মাইগ্রেশন append-only হবে, পুরনো migration edit করা হবে না
- [ ] Payroc ও Maverick অড্যাপ্টার `lib/payments/adapters/` এর অধীনে এক ফাইল করে থাকবে
- [ ] `docs/final/PROVIDER_DOCS.md` এর আগের ৫ টা ডকুমেন্টেশন মুছে ফেলা যাবে না

---

## ১০. Arena.ai এজেন্টের জন্য অটোমেটিক বিল্ড নির্দেশনা

এজেন্টকে নিচের ক্রমে কাজ করতে বলুন:

১. **সunners sham**, `docs/final/STEP_PLAN_250.md`-এ STEP ২৫১-২৫৮ আছে কিনা যাচাই করুন। যদি না থাকে, তাহলে এAppend করুন।
২. **দ্বিতীয়ত**, `docs/final/FEATURE_LIST.md` Section 6-এ "Seven" লিখেছে কিনা, Payroc/Maverick আছে কিনা যাচাই করুন।
৩. **তৃতীয়ত**, `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`-এ লিখিত UI/UX ফ্লো অনুযায়ী সাইনআপ পেইজ থেকে কম্প্লায়েন্স পলিসি সরিয়ে ফেলুন।
৪. **চতুর্থত**, `docs/final/API_CONTRACT.md`-এ লিখিত এন্ডপয়েন্ট অনুযায়ী `POST /api/v1/policies/accept`, `POST /api/v1/kyb/submit` বিল্ড করুন।
৫. **পঞ্চমত**, `docs/planning/DATABASE_SETUP.md`-এ লিখিত মাইগ্রেশন ফরম্যাট অনুযায়ী নতুন টেবিল তৈরি করুন (পরবর্তী unused মাইগ্রেশন নম্বর ব্যবহার করে)।
৬. **ষষ্ঠত**, `lib/payments/adapters/payroc/` এবং `lib/payments/adapters/maverick/` ফোল্ডার তৈরি করে অড্যাপ্টার ফাইল লিখুন।
৭. **সপ্তমত**, ইউনিট টেস্ট লিখুন এবং রান করুন।
৮. **অষ্টমত**, হ্যান্ডঅফ ফাইল তৈরি করুন (`docs/handoffs/STEP_251_COMPLETED.md` ইত্যাদি)।

এমনকি কোনো পথ বা ফাইল চিহ্নিত করতে অসমর্থ হলে, কাজ বন্ধ করে জিজ্ঞাসা করুন। পুরনো কোনো STEP বা মাইগ্রেশন এডিট করবেন না।

---

## ১১. আপলোড করার জন্য ফাইলের তালিকা (কোডিং রেপোতে পাঠানোর জন্য)

আপনি নিচের ফাইলগুলো কোডিং রেপো `kd-solution-it`-এ আপলোড করতে পারেন:

1. `docs/final/STEP_PLAN_250.md`
2. `docs/final/FEATURE_LIST.md`
3. `docs/final/API_CONTRACT.md`
4. `docs/planning/SHOPIFY_APP_PLAN.md`
5. `docs/planning/WOOCOMMERCE_PLUGIN_PLAN.md`
6. `docs/planning/DATABASE_SETUP.md`
7. `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`
8. `docs/planning/AGENT_INSTRUCTIONS_NEW_PROCESSORS.md` (এই ফাইলটি)
9. `docs/planning/wc-kd-woocommerce-payment.php`
10. `docs/planning/wc-includes-class-kd-payment-settings.php`
11. `docs/planning/wc-includes-class-kd-payment-api.php`
12. `docs/planning/wc-includes-class-kd-payment-gateway.php`
13. `docs/planning/wc-includes-class-kd-payment-webhooks.php`
14. `docs/planning/shopify-app-route-install.ts`
15. `docs/planning/shopify-app-route-callback.ts`
16. `docs/planning/shopify-app-webhook-verify.ts`
17. `docs/planning/shopify-app-webhook-order-created.ts`
18. `docs/planning/shopify-app-encryption.ts`
19. `docs/planning/shopify-app-platform-client.ts`
20. `docs/planning/shopify-app-env.example`
21. `docs/planning/woocommerce-plugin-env.example`

---

**End of Agent Instructions.**
