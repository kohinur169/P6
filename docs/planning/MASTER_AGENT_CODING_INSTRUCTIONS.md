# মাস্টার এজেন্ট কোডিং নির্দেশনা — Payroc + Maverick অ্যাকুইরিং প্রসেসর

**ব্রাঞ্চ:** `arena/02f9dca9-p6`  
**প্ল্যানিং রেপো:** `/home/user/P6`  
**টার্গেট কোডিং রেপো:** `https://github.com/kohinur169/kd-solution-it`  
**ভাষা:** শুধু ইংরেজি (কোড, কমেন্ট, স্ট্রিং, ডকুমেন্টেশন)  
**স্থিতি:**_--authoritative implementation guide_

এই ডকুমেন্টটি Arena.ai এজেন্টকে দিলে সে নিখুঁতভাবে Payroc এবং Maverick অ্যাকুইরিং প্রসেসর যুক্ত করতে পারবে এবং সাইনআপ/KYB ফ্লো সংশোধন করতে পারবে।

---

## ধাপ ০:पूर्वশর্ত (Prerequisites)

কোডিং শুরু করার আগে নিশ্চিত করুন:

1. ✅ `STEP_PLAN_250.md` — মোট ২৫৮ STEP আছে (২৫১-২৫৮ Payroc/Maverick)
2. ✅ `FEATURE_LIST.md` — Section 6: Payment Processors (Seven)
3. ✅ `API_CONTRACT.md` — সঠিক API এন্ডপয়েন্ট, রিকোএসট/রেসপন্স JSON
4. ✅ `KYB_POLICY_FLOW_CORRECTION.md` — সাইনআপ vs ভেরিফিকেশন ফ্লো সংশোধন
5. ✅ `DATABASE_SETUP.md` — সুপাবase ডাটাবেস সেটআপ প্ল্যান
6. ✅ পুরনো STEP ১-২৫০ কিছুই বদলা হয়নি

---

## ধাপ ১: সাইনআপ পেইজ থেকে কম্প্লায়েন্স পলিসি সরানো

### কোথায় পরিবর্তন করা হবে:
- কোডিং রেপোতে `/auth/signup` পেইজ
- কোডিং রেপোতে `/dashboard/kyb/business-profile` পেইজ

### কী পরিবর্তন হবে:

**সাইনআপ পেইজ (`/auth/signup`):**
```tsx
// vecchio ভুল: এখানে সব ১১ টি পলিসি দেখavage যাচ্ছিল
// সঠিক: এখানে শুধু নিচের ফিল্ড থাকবে:

<form onSubmit={handleSignup}>
  <input type="email" name="email" required placeholder="Email" />
  <input type="password" name="password" required placeholder="Password" />
  <input type="text" name="fullName" required placeholder="Full Name" />
  <input type="tel" name="phone" required placeholder="Phone Number" />
  
  {/* Cloudflare Turnstile */}
  <Turnstile siteKey={process.env.TURNSTILE_SITE_KEY} />
  
  {/* শুধু মৌলিক টার্মস — কম্প্লায়েন্স পলিসি নেই */}
  <label>
    <input type="checkbox" name="terms" required />
    আমি টার্মস অফ সার্ভিস ও প্রাইভেসি নোটিস পড়েছি ও গৃহীত করছি
  </label>
  
  <button type="submit">সাইনআপ করুন</button>
</form>
```

**বিজনেস প্রোফাইল পেইজ (`/dashboard/kyb/business-profile`):**
```tsx
<form onSubmit={handleBusinessProfile}>
  <input name="businessName" required placeholder="ব্যবসার নাম" />
  <input name="registrationNumber" required placeholder="ব্যবসার রেজিস্ট্রেশন নম্বর" />
  <select name="mcc" required>
    <option value="">MCC নির্বাচন করুন</option>
    <!-- MCC অপশন গুলো -->
  </select>
  <input name="taxId" required placeholder="ট্যাক্স আইডি" />
  <input name="website" placeholder="ওয়েবসাইট লিঙ্ক" />
  
  {/* ডকুমেন্ট আপলোড */}
  <DocumentUpload 
    acceptedTypes={['pdf', 'jpg', 'png']}
    encryption="AES-256-GCM"
  />
  
  <button type="submit">ড্রাফ্ট সেভ করুন</button>
</form>
```

**নীতিমালা acceptor পেইজ (`/dashboard/kyb/policy-acceptance`):**
```tsx
const REQUIRED_POLICIES = [
  'kyc_kyb',
  'ubo',
  'aml_cft',
  'sanctions_pep',
  'underwriting',
  'merchant_acceptance',
  'chargeback_dispute',
  'refund_settlement',
  'fraud_risk',
  'data_privacy',
  'pci_dss',
];

// পলিসি accepter করার পর শুধু সাবমিট বাটন সক্রিয় হবে
const allPoliciesAccepted = REQUIRED_POLICIES.every(
  (key) => acceptedPolicies[key]
);

<button 
  disabled={!allPoliciesAccepted}
  onClick={handleSubmitKYB}
>
  সব নীতিমালা গ্রহণ করে ভেরিফিকেশনের জন্য জমা দিন
</button>
```

---

## ধাপ ২: ডাটাবেস মাইগ্রেশন তৈরি করা

### ফাইল: `migrations/0261_policy_versions.sql` (অবশ্যই পরের unused নম্বর ব্যবহার করুন)

```sql
-- Migration: policy_versions, merchant_policy_acceptance, kyc_submissions update
-- Owner: STEP 259-262
-- Append-only

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

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_versions_public_read ON policy_versions
    FOR SELECT TO authenticated
    USING (is_active = true);

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

ALTER TABLE merchant_policy_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_policy_acceptance_company_isolation ON merchant_policy_acceptance
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);

-- kyc_submissions টেবিলে policies_accepted_at কলাম যোগ
ALTER TABLE kyc_submissions 
ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
```

### ফাইল: `migrations/0251_payroc_adapter.sql`
এমনই ফাইল `docs/planning/migration-0251-payroc-adapter.sql`-এ তৈরি আছে। কোডিং রেপোয় কপি করুন।

### ফাইল: `migrations/0255_maverick_adapter.sql`
এমনই ফাইল `docs/planning/migration-0255-maverick-adapter.sql`-এ তৈরি আছে। কোডিং রেপোয় কপি করুন।

---

## ধাপ ৩: Payroc অ্যাডাপ্টার কোডিং

### ফাইল: `lib/payments/adapters/payroc/payroc-adapter.ts`
এমনই ফাইল `docs/planning/payroc-adapter-template.ts`-এ তৈরি আছে। কোডিং রেপোয় কপি করুন এবং নিচের জিনিস গুলো পূরণ করুন:

১. `PAYROC_ENV_CONFIG`-এ সঠিক base URL লিখুন (Payroc অফিসিয়াল ডকুমেন্টেশন পড়ার পরে)
২. `PayrocPaymentRequestSchema`-এ সঠিক ফিল্ড নাম লিখুন
৩. `testConnection()` মেথডে সঠিক এন্ডপয়েন্ট লিখুন
৪. `createSubMerchant()`-এ সঠিক রিকোএসট/রেসপন্স ফরম্যাট লিখুন
৫. `processPayment()`-এ সঠিক পেমেন্ট এন্ডপয়েন্ট লিখুন
৬. `verifyPayrocWebhookSignature()`-ে সঠিক হেডার নাম যাচাই করুন (X-Payroc-Signature অথবা X-Signature)
৭. স্ট্যাটাস ম্যাপিং ফাংশন গুলো Payroc-এর আসল স্ট্যাটাস অনুযায়ী আপডেট করুন

---

## ধাপ ৪: Maverick অ্যাডাপ্টার কোডিং

### ফাইল: `lib/payments/adapters/maverick/maverick-adapter.ts`
এমনই ফাইল `docs/planning/maverick-adapter-template.ts`-এ তৈরি আছে। কোডিং রেপোয় কপি করুন এবং নিচের জিনিস গুলো পূরণ করুন:

১. `MAVERICK_ENV_CONFIG`-এ সঠিক base URL লিখুন (Maverick অফিসিয়াল ডকুমেন্টেশন পড়ার পরে)
২. `MaverickPaymentRequestSchema`-এ সঠিক ফিল্ড নাম লিখুন
৩. `testConnection()` মেথডে সঠিক এন্ডপয়েন্ট লিখুন
৪. `createSubMerchant()`-এ সঠিক রিকোএসট/রেসপন্স ফরম্যাট লিখুন
৫. `processPayment()`-এ সঠিক পেমেন্ট এন্ডপয়েন্ট লিখুন
৬. `verifyMaverickWebhookSignature()`-ে সঠিক হেডার নাম যাচাই করুন
৭. স্ট্যাটাস ম্যাপিং ফাংশন গুলো Maverick-এর আসল স্ট্যাটাস অনুযায়ী আপডেট করুন

---

## ধাপ ৫: পেমেন্ট রেজিস্টার আপডেট

### ফাইল: `lib/payments/registry.ts`
এমনই ফাইল `docs/planning/payment-registry-update-template.ts`-এ তৈরি আছে। কোডিং রেপোয় কপি করুন।

নিশ্চিত করুন:
- পুরনো ৫ টা প্রসেসরের এন্ট্রি পরিবর্তন করবেন না
- শুধু `payroc` এবং `maverick` নতুন এন্ট্রি যোগ করুন
- `initializePaymentRegistry()` ফাংশনে নতুন ক্রেডেনশিয়াল پاس করুন

---

## ধাপ ৬: ওয়েবহুক হ্যান্ডলার বিল্ডিং

### ফাইল: `src/app/api/webhooks/payroc/[storeId]/route.ts`
এমনই ফাইল `docs/planning/webhook-handler-template.ts`-এ তৈরি আছে।

### ফাইল: `src/app/api/webhooks/maverick/[storeId]/route.ts`
এমনই ফাইল `docs/planning/webhook-handler-template.ts`-এ তৈরি আছে।

নিশ্চিত করুন:
- রিকোএসট বডি রå Bangladesh রå পার্স করা আগে HMAC ভেরিফিকেশন করবেন
- আইডempootেন্সি চেক করবেন (একই ইভেন্ট δύοবার প্রসেস হবে না)
- রেসপন্স ২০০ ওকে দেবেন

---

## ধাপ ৭: এনভায়রনমেন্ট ভ্যারিয়েবল সেটআপ

### ফাইল: `.env.example`
নিচের ভেরিয়েবল গুলো যোগ করুন:

```bash
# Payroc
PAYROC_API_KEY=your_payroc_api_key
PAYROC_API_SECRET=your_payroc_api_secret
PAYROC_MERCHANT_ID=your_payroc_merchant_id
PAYROC_WEBHOOK_SECRET=your_payroc_webhook_secret
PAYROC_ENV=sandbox

# Maverick
MAVERICK_CLIENT_ID=your_maverick_client_id
MAVERICK_CLIENT_SECRET=your_maverick_client_secret
MAVERICK_MERCHANT_ID=your_maverick_merchant_id
MAVERICK_WEBHOOK_SECRET=your_maverick_webhook_secret
MAVERICK_ENV=sandbox

# Encryption (শুধুমাত্র এনভায়রনমেন্টে, গিটে না)
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
```

---

## ধাপ ৮: নিরাপত্তা যাচাই Checklist

প্রতিটি অ্যাডাপ্টারের জন্য নিশ্চিত করুন:

- [ ] অ্যাক্সেস টোকেন AES-256-GCM এনক্রিপ্টেড রূপে ডাটাবেসে সেভ
- [ ] পূর্ণ কী সেভ করার পর আর দেখাবে না (শুধু শেষ ৪ অক্ষর)
- [ ] ওয়েবহুক শুধু সিগনেচার ভেরিফিকেশনের পর গ্রহণ করা হবে
- [ ] কার্ড নম্বর, এক্সপিরি, সিভিভি প্ল্যাটফর্ম সার্ভারে যাবে না
- [ ] RLS এনabled (`company_id` দ্বারা ট্যানেন্ট আইসোলেশন)
- [ ] অডিট লগে প্রতিটি অ্যাকশন লিখিত হবে
- [ ] আইডempootেন্সি কী প্রতিটি পেমেন্টে
- [ ] 3D Secure অনুরোধ (যেটা প্রসেসর সমর্থন করে)
- [ ] রুটিং রুলস: কোনো রুল মেলে না হলে পেমেন্ট রিজেক্ট, সাইলেন্ট ফলব্যাকে যাবে না

---

## ধাপ ৯: ইউনিট টেস্ট লিখুন

### পরীক্ষা করুন:
1. `testConnection()` সফল/ব্যর্থ কেস
2. `processPayment()` সফল পেমেন্ট
3. `processPayment()` ব্যর্থ পেমেন্ট (অ considerórim кредит কার্ড)
4. `refundPayment()` সফল রিফান্ড
5. `verifyPayrocWebhookSignature()` বৈধ/অবৈধ সিগনেচার
6. `verifyMaverickWebhookSignature()` বৈধ/অবৈধ সিগনেচার
7. আইডempootেন্সি: একই ট্রানজাকশন দ্বೋবার প্রসেস করলে ডুপ্লিকেট না হওয়া
8. RLS: কোম্পানি A তার লেনデン দেখতে পাবে, কোম্পানি B-এর লেনデン দেখবে না

---

## ধাপ ১০: হ্যান্ডঅফ ফাইল তৈরি

প্রत्येक STEP সম্পন্নের পরে তৈরি করুন:

- `docs/handoffs/STEP_251_COMPLETED.md` — Payroc ডকুমেন্টেশন ভেরিফিকেশন
- `docs/handoffs/STEP_252_COMPLETED.md` — Payroc এনক্রিপ্টেড কী + কানেকশন টেস্ট
- `docs/handoffs/STEP_253_COMPLETED.md` — Payroc পেমেন্ট গ্রহণ
- `docs/handoffs/STEP_254_COMPLETED.md` — Payroc সাব-মার্চ্যান্ট প্রোভিশনিং + ওয়েবহুক
- `docs/handoffs/STEP_255_COMPLETED.md` — Maverick ডকুমেন্টেশন ভেরিফিকেশন
- `docs/handoffs/STEP_256_COMPLETED.md` — Maverick এনক্রিপ্টেড কী + কানেকশন টেস্ট
- `docs/handoffs/STEP_257_COMPLETED.md` — Maverick পেমেন্ট গ্রহণ
- `docs/handoffs/STEP_258_COMPLETED.md` — Maverick সাব-মার্চ্যান্ট প্রোভিশনিং + ওয়েবহুক

হ্যান্ডঅফ ফাইলে লিখতে হবে:
- স্যান্ডব্যাক্স পেমেন্ট, রিফান্ড, ওয়েবহুক সাইকেল সফল হουλো কিনা
- এনভায়রনমেন্ট ভ্যারিয়েবল সেট করা কিনা
- টাইপচেক, লিন্ট, বিল্ড পাস করা কিনা

---

##ぞ wichtig সতর্কতা (গ্যাপ ও ত্রুটি যেন না থাকে)

১. **আসল API ডকুমেন্টেশন পড়ুন:** টেমপ্লেট গুলোতে `VERIFY` লিখা জায়গা গুলো কোডিং সেশনে Payroc/Maverick অফিসিয়াল সাইট থেকে ডকুমেন্টেশন পড়ার পরে পূরণ করুন। অনুমান করবেন না।
২. **পুরনো মাইগ্রেশন এডিট করবেন না:** শুধু append-only নতুন মাইগ্রেশন যোগ করবেন।
৩. **পুরনো STEP বদলা করবেন না:** STEP ১-২৫০ কিছুই বদলা যাবে না।
৪. **কার্ড ডাটা:** প্ল্যাটফর্ম সার্ভার কখনো প্যান/এক্সপিরি/সিভিভি দেখবে না।
৫. **ওয়েবহুক সিগনেচার:** ভেরিফিকেশন ছাড়া কোনো ওয়েবহুক প্রসেস করবেন না।
৬. **এনভায়রনমেন্ট ভ্যারিয়েবল:** গিট রেপোতে রিয়্যাল ভ্যালু থাকবে না।

---

এই নির্দেশনাগুলো অনুসরণ করলে Payroc এবং Maverick অ্যাকুইরিং প্রসেসর নিখুঁতভাবে যুক্ত করা যাবে এবং সাইনআপ/KYB ফ্লো সঠিকভাবে কাজ করবে।

---

## প распростране করা ফাইলের তালিকা (কোডিং রেপোতে পাঠানোর জন্য)

১. `docs/planning/payroc-adapter-template.ts`
২. `docs/planning/maverick-adapter-template.ts`
৩. `docs/planning/payment-registry-update-template.ts`
৪. `docs/planning/webhook-handler-template.ts`
৫. `docs/planning/migration-0251-payroc-adapter.sql`
৬. `docs/planning/migration-0255-maverick-adapter.sql`
৭. `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md`
৮. `docs/final/STEP_PLAN_250.md` (ইউন interrupted ২৫৮ STEP)
৯. `docs/final/FEATURE_LIST.md` (Seven প্রসেসর)
১০. `docs/final/API_CONTRACT.md`
১১. `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`
১২. `docs/planning/DATABASE_SETUP.md`

---

এই ফাইল গুলো এখন P6-এ সেভ করছি এবং গিটহাবে পুশ করছি। কোডিং রেপোয় আপলোড করার জন্য আপনি এই ফাইল গুলো ব্যবহার করতে পারবেন।

---

এখন এই মাস্টার ইনস্ট্রাকশন ফাইলটি গিটহাবে কমিট ও পুশ করি:





<tool_call>
<function=bash>