# KYB Policy Flow Correction Plan — Signup vs Verification Separation

**Repository:** P6 (planning source only)  
**Target Coding Repository:** `https://github.com/kohinur169/kd-solution-it`  
**Status:** Draft for implementation  
**Language:** English only (code, comments, strings, documentation)  
**Owner:** Platform Team / Onboarding Squad

---

## 1. Problem Statement (বর্তমান ভুল)

সাইনআপ পেইজে বর্তমানে নিম্নলিখিত সব কম্প্লায়েন্স পলিসি অগ্রিম স্বীকার করানো হচ্ছে:

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

এটি আপনার `FEATURE_LIST.md` Section 5 (Signup, Business Profile, Underwriting and KYC) এবং Section 3 (Business, Legal and Compliance Operations) régimenের সাথে সাংঘর্ষিক।

**সঠিক আর্কিটেকচার:**

| ধাপ | কী হবে | কiedy নীতিমালা উপস্থাপন করা হবে |
|-----|---------|-------------------------------|
| **ধাপ ১: অ্যাকাউন্ট সাইনআপ** | ইমেইল, পাসওয়ার্ড, নাম, ফোন নম্বর, Cloudflare Turnstile, মৌলিক টার্মস অফ সার্ভিস | শুধু সাধারণ টার্মস অফ সার্ভিস ও প্রাইভেসি নোটিস (সার্বজনীন) |
| **ধাপ ২: বিজনেস প্রোফাইল ও KYB ডকুমেন্ট আপলোড** | ব্যবসার নাম, রেজিস্ট্রেশন নম্বর, MCC, ট্যাক্স আইডি, ওয়েবসাইট, ডকুমেন্ট আপলোড | এখনও সব পলিসি দেখাবে না |
| **ধাপ ৩: নীতিমালা accettেশন** | ১১ টি কম্প্লায়েন্স পলিসি দেখানো, রিড করানো, চেকবক্সের মাধ্যমে সম্মতি | এখানে সব ১১ টি পলিসি først দেখানো হবে |
| **ধাপ ৪: ভেরিফিকেশনের জন্য সাবমিট** | শুধু সব পলিসি accepter করার পর সাবমিট বাটন সক্রিয় | পলিসি accepter রেকর্ড করা হবে (ভার্সন, সময়, আইপি) |

---

## 2. Target UI/UX Flow

### পেইজ ১: সাইনআপ (Account Creation)
**URL:** `/auth/signup`  
**ফিল্ড:**
- ইমেইল (বাধ্যতামূলক)
- পাসওয়ার্ড (বাধyntাatory)
- পূর্ণ নাম (বাধyntাatory)
- ফোন নম্বর (বাধyntাatory)
- Cloudflare Turnstile verification
- চেকবক্স: "আমি টার্মস অফ সার্ভিস ও প্রাইভেসি নোটিস পড়েছি ও গৃহীত করছি" (বাধyntাatory)

**সাবমিটের পর:** ইমেইল ভেরিফিকেশন ইমেইল পাঠানো → অ্যাকাউন্ট সক্রিয় → ড্যাশবোর্ডে রিডাইরেক্ট।

**দৃশ্যমান পলিসি:** শুধু সাধারণ টার্মস অফ সার্ভিস। KYC/KYB, UBO, AML/CFT ইত্যাদি কোনো পলিসি দেখাবে না।

---

### পেইজ ২: বিজনেস প্রোফাইল ও ডকুমেন্ট আপলোড (KYB Submission Draft)
**URL:** `/dashboard/kyb/business-profile`  
**ফিল্ড:**
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

### পেইজ ৩: নীতিমালা accepter (Policy Acceptance Modal / Page)
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

**পলিসি কন্টেন্ট:** প্রতিটি পলিসির নাম ক্লিক করলে volled পলিসি ডকুমেন্ট খুলবে (CMS-editable পেজ, FEATURE_LIST.md Section 3 অনুযায়ী)। পলিসির versie (version) এবং effective date見せতে হবে।

---

### পেইজ ৪: ভেরিফিকেশন সাবমিশন (Final Submit)
**URL:** `/dashboard/kyb/submit` অথবা পেইজ ৩ এর বাটন ক্লিকের পর অটোমেটিক  
**প্রक्रিয়া:**
1. চেক করা হবে স drž avšte 모든 প্রয়োজনীয় পলিসি accepter করা আছে কিনা।
2. যদি সব পলিসি accepter না থাকে → `422 Unprocessable Error` রিটার্ন করবে: "All required policies must be accepted before KYB submission."
3. যদি সব পলিসি accepter থাকা → `POST /api/v1/kyb/submit` কল করা হবে।
4. সফল হলে `kyc_submissions` টেবিলে স্ট্যাটাস `submitted` লিখবে।
5. গ্রাহককে নোটিফিকেশন: "আপনার ভেরিফিকেশন আবেদন জমা দেওয়া হয়েছে। আমরা samiksha করছি।"

---

## 3. Database Schema Changes (Append-Only Migration)

**মাইগ্রেশন নম্বর:** `STEP_PLAN_250.md`-এর সর্বোচ্চ committed migration নম্বর ইন্সপেক্ট করে এরপর unused number ব্যবহার করবে (যেমন: 0261, 0262)। পুরনো কোনো মাইগ্রেশন এডিট করবে না।

### ৩.১ টেবিল: `policy_versions`

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

-- RLS
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_versions_public_read ON policy_versions
    FOR SELECT TO authenticated
    USING (is_active = true);
```

### ৩.২ টেবিল: `merchant_policy_acceptance`

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

-- RLS:公司_id isolation
ALTER TABLE merchant_policy_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_policy_acceptance_company_isolation ON merchant_policy_acceptance
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

### ৩.৩ টেবিল: `kyc_submissions` (এখন standing KYB স্ট্যাটাস ট্র্যাকিং)

```sql
CREATE TABLE IF NOT EXISTS kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft, submitted, under_review, approved, rejected
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

-- RLS
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY kyc_submissions_company_isolation ON kyc_submissions
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

---

## 4. API Contract Changes

### ৪.১ নতুন এন্ডপয়েন্ট

| এন্ডপয়েন্ট | পদ্ধতি | উদ্দेश্য |
|-----------|--------|---------|
| `GET /api/v1/policies/pending` | GET | ব্যবহারকারীর জন্য অপূর্ব নীতিমালার তালিকা (যা এখনও accepter করা হয়নি) |
| `POST /api/v1/policies/accept` | POST | একাধিক পলিসি accepter রেকর্ড করা (batch) |
| `POST /api/v1/kyb/submit` | POST | KYB সাবমিশন-ফাইনালাইজ (শুধুমাত্র সব পলিসি accepter-full হলে সফল) |
| `GET /api/v1/kyb/status` | GET | বর্তমান KYB সাবমিশন স্ট্যাটাস |

### ৪.২ `POST /api/v1/policies/accept`

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

**Response:**
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

### ৪.৩ `POST /api/v1/kyb/submit`

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

**Response (ব্যর্থ - পলিসি accepter নেই):**
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

## 5. Updated Existing Endpoints

### `POST /api/v1/auth/signup` (অপরিবর্তিত, শুধু মৌলিক টার্মস)
- শুধু ইমেইল, পাসওয়ার্ড, নাম, ফোন, টার্নস্টিল, মৌলিক টার্মস অফ সার্ভিস চেকবক্স
- কোনো কম্প্লায়েন্স পলিসি accepter প্রয়োজন নেই

### `POST /api/v1/kyb/business-profile` (অপরিবর্তিত)
- ব্যবসার প্রোফাইল ড্রাফ্ট সেভ
- পলিসি accepter প্রয়োজন নেই

---

## 6. Backend Validation Rules

১. `POST /api/v1/kyb/submit` যাচাই করবে যে `merchant_policy_acceptance` টেবিলে `company_id`-এর জন্য সব প্রয়োজনীয় `policy_key`-এর জন্য accepter রেকর্ড আছে কিনা।
২. পলিসি accepter রেকর্ডে `accepted_from_ip` এবং `user_agent` সংরক্ষণ করা বাধyntাatory।
৩. পলিসি lighter version পরিবর্তন হলে (যেমন: version 1 থেকে version 2), পুরনো accepter करने वाले মার্চেন্টদের নতুনবার同意 নেওয়া propositions করবে (`policies_accepted_at` নલ করবে এবং নতুন acceptance প্রয়োজন হবে)।
৪. রেট লিমিটিং: পলিসি accepter এন্ডপয়েন্ট প্রতি মিনিটে ১০ রিকোএসট।
৫. অডিট লগ: প্রতিটি পলিসি accepter এবং KYB সাবমিশন অডিট লগড হবে (`FEATURE_LIST.md` Section 11 অনুযায়ী)।

---

## 7. Frontend Implementation Rules

১. সাইনআপ পেইজে `policy_versions` টেবিল থেকে কোনো কম্প্লায়েন্স পলিসি ফেচ করবে না।
২. পলিসি accepter পেইজে শুধু `is_active = true` এবং `effective_from <= now()` শর্তসাপেক্ষ পলিসি দেখাবে।
৩. প্রতিটি পলিসির titles ইংরেজিতে হবে (FEATURE_LIST.md Section 1 অনুযায়ী English only)।
৪. চেকবক্স স্টেট লোকাল স্টেটে ব্যবস্থাপনা করবে; শুধু সব চেক করা হলে সাবমিট বাটন `<button disabled>` অট্রিবিউট সরাবে।
৫. সাবমিটের আগে ক্লায়েন্ট সাইডে যাচাই করবে সব পলিসি চেক করা আছে কিনা; সার্ভার সাইডে�� যাচাই করবে (defense in depth)।

---

## 8. Data Sharing with Payment Acquiring Partners

পলিসি accepter করার পর সংগৃহীত তথ্য (ব্যবসার প্রোফাইল, ডকুমেন্ট, পলিসি accepter রেকর্ড) পেমেন্ট একুয়ারিং পার্টনার (NMI, Stripe Connect, Airwallex, Payroc, Maverick, Payoneer, Rainforest) এর সাথে শেয়ার করা যাবে:

- শুধুমাত্র এনক্রিপ্টেড চ্যানেলে (TLS 1.3)
- শুধুমাত্র aprobóved অধিকারী কর্মকর্তার মাধ্যমে
- অডিট লগে রেকর্ড হবে কে কবে কী শেয়ার করেছে
- প্রাইভেসি পলিসি (Data Privacy and Security Policy) অনুযায়ী ডাটা শেয়ারিং কনসেন্ট রেকর্ড করা হবে

---

## 9. Step Mapping in `STEP_PLAN_250.md`

নতুন STEP নম্বর 259+ থেকে append-only ভাবে যোগ করতে হবে (পুরনো ১-২৫০ কিছুই বদলা যাবে না):

| STEP | কাজ |
|------|------|
| 259 | সাইনআপ পেইজ থেকে কম্প্লায়েন্স পলিসি অ géneros সরানো (শুধু মৌলিক টার্মস রাখা) |
| 260 | `policy_versions` টেবিল মাইগ্রেশন |
| 261 | `merchant_policy_acceptance` টেবিল মাইগ্রেশন |
| 262 | `kyc_submissions` টেবিল আপডেট (`policies_accepted_at` কলাম যোগ) |
| 263 | `GET /api/v1/policies/pending` এন্ডপয়েন্ট |
| 264 | `POST /api/v1/policies/accept` এন্ডপয়েন্ট |
| 265 | `POST /api/v1/kyb/submit` এন্ডপয়েন্টে পলিসি acceptor যাচাই লজিক |
| 266 | পলিসি accepter UI পেইজ / মোডাল |
| 267 | KYB সাবমিশন ফ্লো আপডেট (পলिसি acceptor চেক সহ) |
| 268 | ইউনিট টেস্ট ও ইন্টিগ্রেশন টেস্ট |
| 269 | স্টেজিং ও প্রোডাকশন ডেপ্লয়মেন্ট চেকলিস্ট |

---

## 10. Definition of Done (কাজ শেষের শর্ত)

- [ ] সাইনআপ পেইজে কোনো কম্প্লায়েন্স পলিসি (KYC/KYB, UBO, AML/CFT, স্যানকশন/PEP, আন্ডাররাইটিং, মর্চেন্ট অ behaviors, chargeback, refund, fraud, ডাটা প্রাইভেসি, PCI-DSS) দেখাবে না
- [ ] সাইনআপের শুধু মৌলিক টার্মস অফ সার্ভিস ও প্রাইভেসি নোটিস থাকবে
- [ ] বিজনেস প্রোফাইল পেইজে কোনো পলিসি দেখাবে না
- [ ] পলिसি accepter পেইজে সব ১১ টি পলিসি দেখাবে
- [ ] শুধু সব পলিসি accepter করলে KYB সাবমিট বাটন সক্রিয় হবে
- [ ] `POST /api/v1/kyb/submit` পলিসি acceptor না থাকলে `422` রিটার্ন করবে
- [ ] পলিসি accepter রেকর্ডে `accepted_from_ip` ও `user_agent` সেভ হবে
- [ ] RLS এনabled থাকবে `company_id` দ্বারা
- [ ] অডিট লগে পলিসি accepter ও KYB সাবমিশন লিখিত হবে
- [ ] ইউনিট টেস্ট পাস করবে
- [ ] মাইগ্রেশন append-only হবে, পুরনো migration edit করা হবে না

---

## 11. Copy-Paste Prompt for Coding Team

নিচের প্রম্পটটি আপনি কোডিং রেপো (`kd-solution-it`) এর নতুন চ্যাটে পাঠালে ডেভেলপাররা ভুল ছাড়াই বুঝতে পারবেন:

```markdown
আমি একটি পেমেন্ট फैसिलিটেটর প্ল্যাটফর্ম (KD SOLUTION IT) বিল্ড করছি। এই চ্যাটের কাজ হলো সাইনআপ এবং KYB/KYC ভেরিফিকেশন ফ্লোকে আলাদা করা এবং নীতিমালা (Policy Acceptance) সঠিক জায়গায় বসানো।

আমার প্রজেক্টের প্ল্যানিং ডকুমেন্ট:
- FEATURE_LIST.md Section 5: Signup, Business Profile, Underwriting and KYC
- STEP_PLAN_250.md: STEP 079-099 (Merchant Onboarding, Processor KYB, Sub-Merchant Provisioning)

প্রয়োজনীয় ফ্লো:

১. সাইনআপ পেইজ (Account Creation)
   - ইমেইল, পাসওয়ার্ড, নাম, ফোন নম্বর, Cloudflare Turnstile
   - একটি মৌলিক টার্মস অফ সার্ভিস চেকবক্স (কোনো কম্প্লায়েন্স পলিসি নেই)
   - সফল হলে ইমেইল ভেরিফিকেশন ইমেইল পাঠানো

২. বিজনেস প্রোফাইল ও KYB ডকুমেন্ট পেইজ
   - ব্যবসার নাম, রেজিস্ট্রেশন নম্বর, MCC, ট্যাক্স আইডি, ওয়েবসাইট
   - ডকুমেন্ট আপলোড: ট্রেড লাইসেন্স, ট্যাক্স সার্টিফিকেট, অ্যাড্রেস প্রুফ, ব্যাংক স্টেটমেন্ট, UBO আইডি ও সেলফি (২৫%+ মালিকের জন্য)
   - সব ফাইল AES-256-GCM এনক্রিপ্টেড স্টোরেজে

৩. নীতিমালা accepter পেইজ (শুধু KYB সাবমিশনের আগে)
   - নিম্নলিখিত সব পলিসি দেখাতে হবে, প্রতিটিতে.version এবং চেকবক্স সহ:
     * KYC and KYB Policy
     * UBO Policy
     * AML and CFT Policy
     * Sanctions and PEP Screening Policy
     * Underwriting and Risk Assessment Policy
     * Merchant Acceptance and Prohibited and Restricted Businesses Policy
     * Chargeback and Dispute Management Policy
     * Refund and Settlement Policy
     * Fraud and Risk Management Policy
     * Data Privacy and Security Policy
     * PCI-DSS Compliance Policy
   - শুধু সব চেকবক্স চেক করলে "Submit for Verification" বাটন সক্রিয় হবে
   - সাবমিটের সময় প্রতিটি পলিসির policy_version_id, company_id, accepted_at, accepted_from_ip, user_agent রেকর্ড করতে হবেmerchant_policy_acceptance টেবিলে

৪. KYB সাবমিশন API (POST /api/v1/kyb/submit)
   - শুধুমাত্র তখন সফল হবে যখন সমস্ত প্রয়োজনীয় পলিসি accepter-full থাকে
   - অন্যথায় 422 Unprocessable Entity রিটার্ন করবে: "All required policies must be accepted before KYB submission"

ডাটাবেস স্কিমা (Append-Only Migration):
- policy_versions (id, policy_key, title, version, content_url, effective_from, is_active, created_at)
- merchant_policy_acceptance (id, company_id, policy_version_id, accepted_at, accepted_from_ip, user_agent, created_at)
- kyc_submissions (id, company_id, status, submitted_at, reviewed_by, reviewed_at, rejection_reason, created_at, updated_at)

নিরাপত্তা নিয়ম:
- RLS_enable করা হবে company_id দ্বারা tenant isolation
- অ tones Access token AES-256-GCM এনক্রিপ্টেড
- ওয়েবহুক ও API রিকোয়েস্টে HMAC-SHA256 সিগনেচার ভেরিফিকেশন
- কার্ড ডাটা (PAN, expiry, CVV) প্ল্যাটফর্ম সার্ভারে যাবে না

ডেলিভারেবল:
1. পূর্ণাঙ্গ সোর্স কোড (আলাদা গিট রেপোতে)
2. মাইগ্রেশন SQL ফাইল (append-only, সংখ্যা পরের unused number থেকে)
3. API কন্ট্রাক্ট ডকুমেন্টেশন
4. ইউনিট টেস্ট (পলिसি acceptor না থাকলে KYB submission blocked যাচাই)
5. ডেপ্লয়মেন্ট চেকলিস্ট

দয়া করে কোনো অনুমান না করুন। কোনো পথ বা ফাইল চিহ্নিত করতে অસমর্থ হলে কাজ বন্ধ করে জিজ্ঞাসা করুন। পুরনো কোনো STEP বা মাইগ্রেশন এডিট করবেন না।
```

---

**এই প্ল্যানটি আপনি P6 রেপোতে সেভ করছেন। আসল কোডিং হবে `https://github.com/kohinur169/kd-solution-it` রেপোতে।**

আপনি চাইলে এই প্ল্যানটি এখনই গিটহাবে কমিট ও পুশ করতে পারি। বলুন কীভাবে এগুয়ে যাবেন।