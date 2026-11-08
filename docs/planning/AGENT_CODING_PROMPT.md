# Arena.ai Agent Coding Prompt — KD SOLUTION IT Payment Platform

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only (code, comments, strings, documentation)  
**Status:** Authoritative implementation prompt  
**Owner:** Platform Team / Payments Squad

---

## 📌 এই প্রম্পটটি কীভাবে ব্যবহার করবেন

আপনি এই স কর্মপত্রটি Arena.ai এজেন্ট বা কোডিং টিমকে পাঠাবেন। এজেন্টকে এই নির্দেশনা অনুযায়ী কোড করতে হবে যেন প্রজেক্টটি ত্রুটিমুক্ত ও প্রডাকশন রেডি হয়।

আপনি এই প্রম্পটের copie কপি করে নতুন চ্যাটে পেস্ট করুন, এবং পাশাপাশি নিচের ফাইল গুলো কোডিং রেপো (`kd-solution-it`) 에 আপলোড করুন:

| নং | ফাইল পাথ | উদ্দেশ্য |
|----|----------|---------|
| ১ | `docs/final/STEP_PLAN_250.md` | মোট ২৫৮ STEP; ২৫১-২৫৮ Payroc/Maverick |
| ২ | `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| ৩ | `docs/final/API_CONTRACT.md` | সঠিক API এন্ডপয়েন্ট, রিকোএসট/রেসপন্স JSON |
| ৪ | `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` | সাইনআপ vs ভেরিফিকেশন ফ্লো সংশোধন |
| ৫ | `docs/planning/DATABASE_SETUP.md` | সুপাবase ডাটাবেস সেটআপ প্ল্যান |
| ৬ | `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md` | মাস্টার কোডিং নির্দেশনা |
| ৭ | `docs/planning/payroc-adapter-template.ts` | পায়রোক অ্যাডাপ্টার কোড টেমপ্লেট |
| ৮ | `docs/planning/maverick-adapter-template.ts` | মেভেরিক অ্যাডাপ্টার কোড টেমপ্লেট |
| ৯ | `docs/planning/payment-registry-update-template.ts` | পেমেন্ট রেজিস্টার আপডেট |
| ১০ | `docs/planning/webhook-handler-template.ts` | ওয়েবহুক হ্যান্ডলার কোড টেমপ্লেট |
| ১১ | `docs/planning/migration-0251-payroc-adapter.sql` | পায়রোক ডাটাবেস মাইগ্রেশন |
| ১২ | `docs/planning/migration-0255-maverick-adapter.sql` | মেভেরিক ডাটাবেস মাইগ্রেশন |
| ১৩ | `docs/planning/WEBHOOK_API_RELIABILITY_GUIDE.md` | লাইভ প্রডাকশনের জন্য ওয়েবহুক ও API নির্ভরযোগ্যতা |
| ১৪ | `docs/planning/CODE_REVIEW_SECURITY_CHECKLIST.md` | কোড রিভিউ ও সিকিউরিটি চেকলিস্ট |
| ১৫ | `docs/planning/PRODUCTION_READINESS_CHECKLIST.md` | প্রডাকশন রেডি চেকলিস্ট |

---

## 🎯 লক্ষ্য (Objective)

এজেন্টকে নিম্নলিখিত কাজ সম্পন্ন করতে হবে:

১. পেমেন্ট फैसिलিটেটর প্ল্যাটফর্মে **Payroc** এবং **Maverick** নতুন অ্যাকুইরিং প্রসেসর হিসেবে যুক্ত করা (STEP 251-258)।
২. **সাইনআপ এবং KYB/KYC ভেরিফিকেশন ফ্লোকে আলাদা করা** — সাইনআপে শুধু মৌলিক অ্যাকাউন্ট তথ্য, নীতিমালা শুধু ভেরিফিকেশনের আগে দেখানো।
৩. পুরনো STEP ১-২৫০ কিছুই বদলা যাবে না। নতুন STEP ২৫১-২৫৮ append-only ভাবে থাকবে।
৪. ওয়েবহুক ও API ত্রুটিমুক্তভাবে রিয়েল-টাইম সিঙ্ক রাখা।
৫. গিটহাবে কোড রিভিউ, vulnérable স্ক্যান ও সিকিউরিটি চেক করতে সক্ষম করতে হবে।

---

## ⚠️ বাধyntাatory নিয়ম (কোনো শর্তে লংঘন করা যাবে না)

১. **পুরনো STEP ১-২৫০ কিছুই বদলা করবেন না** — নম্বর, টাইটেল, মালিকানা, কনটেন্ট সব intact থাকবে।
২. **পুরনো কোনো মাইগ্রেশন এডিট করবেন না** — শুধু append-only নতুন মাইগ্রেশন যোগ করবেন।
৩. **কার্ড ডাটা (প্যান, এক্সপিরি, সiivি) প্ল্যাটফর্ম সার্ভারে যাবে না** — শুধু প্রোভাইডার হোস্টেড ফিল্ড ব্যবহার করবেন।
৪. **অ্যাক্সেস টোকেন AES-256-GCM এনক্রিপ্টেড রূপে ডাটাবেসে সেভ করবেন** — কী শুধু এনভায়রনমেন্ট ভ্যারিয়েবলে থাকবে।
৫. **ওয়েবহুক শুধু সিগনেচার ভেরিফিকেশনের পর গ্রহণ করবেন** — অন্যথায় `401 Unauthorized` রিটার্ন করবেন।
৬. **সাইনআপ পেইজে কোনো কম্প্লায়েন্স পলিসি দেখাবেন না** — শুধু মৌলিক টার্মস অফ সার্ভিস।
৭. **পলিসি accepter ছাড়া KYB সাবমisión কবूल করবেন না** — `422 Unprocessable Entity` রিটার্ন করবেন।
৮. **গিট রেপোতে কোনো রিয়্যাল সিক্রেট বা পাসওয়ার্ড থাকবে না** — শুধু `.env.example` প্লেসহোল্ডার।

---

## 🗂️ ধাপ ১: প্ল্যানিং ডকুমেন্ট পড়ুন

কোডিং শুরু করার আগে নিচের ফাইল গুলো পূর্নাঙ্গভাবে পড়ুন:

- `docs/final/STEP_PLAN_250.md` — স্টেপ ২৫১-২৫৮ পায়রোক ও মেভেরিকের জন্য
- `docs/final/FEATURE_LIST.md` — সেকশন ৬: পেমেন্ট প্রসেসর (সেভেন)
- `docs/final/API_CONTRACT.md` — সঠিক API এন্ডপয়েন্ট, রিকোএসট/রেসপন্স JSON
- `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` — সাইনআপ vs ভেরিফিকেশন ফ্লো
- `docs/planning/DATABASE_SETUP.md` — সুপাবase ডাটাবেস সেটআপ

---

## 🗄️ ধাপ ২: ডাটাবেস মাইগ্রেশন তৈরি (অ্যাপেন্ড-অনলি)

নিচের মাইগ্রেশন ফাইল গুলো কোডিং রেপোতে `migrations/` ফোল্ডারে তৈরি করুন। মাইগ্রেশন নম্বর পরের unused নম্বর থেকে শুরু হবে (বর্তমান সর্বোচ্চ নম্বর ইন্সপেক্ট করার পর).

### ২.১ মাইগ্রেশন: `0261_policy_versions.sql`
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
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_versions_public_read ON policy_versions
    FOR SELECT TO authenticated
    USING (is_active = true);
```

### ২.২ মাইগ্রেশন: `0262_merchant_policy_acceptance.sql`
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
ALTER TABLE merchant_policy_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_policy_acceptance_company_isolation ON merchant_policy_acceptance
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

### ২.৩ মাইগ্রেশন: `0263_kyc_submissions_update.sql`
```sql
ALTER TABLE kyc_submissions 
ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
```

### ২.৪ মাইগ্রেশন: `0251_payroc_adapter.sql` এবং `0255_maverick-adapter.sql`
এই ফাইল গুলো `docs/planning/migration-0251-payroc-adapter.sql` এবং `docs/planning/migration-0255-maverick-adapter.sql` থেকে কপি করুন।

---

## 🔌 ধাপ ৩: পায়রোক অ্যাডাপ্টার বিল্ড (STEP 251-254)

### ৩.১ ফাইল:`lib/payments/adapters/payroc/payroc-adapter.ts`
`docs/planning/payroc-adapter-template.ts` থেকে কোড কপি করুন এবং নিচের জিনিস গুলো পূরণ করুন:

১. `PAYROC_ENV_CONFIG`-এ সঠিক base URL লিখুন (পায়রোক অফিসিয়াল ডকুমেন্টেশন পড়ার পরে)
২. `PayrocPaymentRequestSchema`-এ সঠিক ফিল্ড নাম লিখুন
৩. `testConnection()` মেথডে সঠিক এন্ডপয়েন্ট লিখুন
৪. `createSubMerchant()`-এ সঠিক রিকোএসট/রেসপন্স ফরম্যাট লিখুন
৫. `processPayment()`-এ সঠিক পেমেন্ট এন্ডপয়েন্ট লিখুন
৬. `verifyPayrocWebhookSignature()`-ে সঠিক হেডার নাম যাচাই করুন
৭. স্ট্যাটাস ম্যাপিং ফাংশন গুলো পায়রোক-এর আসল স্ট্যাটাস অনুযায়ী আপডেট করুন

### ৩.২ নিরাপত্তা
- অ্যাক্সেস টোকেন AES-256-GCM এনক্রিপ্টেড রূপে সেভ করুন
- কানেকশন টেস্ট সফল ছাড়া প্রসেসর এনেবল করবেন না
- পূর্ণ কী সেভ করার পর আর দেখাবেন না

---

## 🔌 ধাপ ৪: মেভেরিক অ্যাডাপ্টার বিল্ড (STEP 255-258)

### ৪.১ ফাইল:`lib/payments/adapters/maverick/maverick-adapter.ts`
`docs/planning/maverick-adapter-template.ts` থেকে কোড কপি করুন এবং নিচের জিনিস গুলো পূরণ করুন:

১. `MAVERICK_ENV_CONFIG`-এ সঠিক base URL লিখুন
২. `MaverickPaymentRequestSchema`-এ সঠিক ফিল্ড নাম লিখুন
৩. `testConnection()` মেথডে সঠিক এন্ডপয়েন্ট লিখুন
৪. `createSubMerchant()`-এ সঠিক রিকোএসট/রেসপন্স ফরম্যাট লিখুন
৫. `processPayment()`-এ সঠিক পেমেন্ট এন্ডপয়েন্ট লিখুন
৬. `verifyMaverickWebhookSignature()`-ে সঠিক হেডার নাম যাচাই করুন
৭. স্ট্যাটাস ম্যাপিং ফাংশন গুলো মেভেরিক-এর আসল স্ট্যাটাস অনুযায়ী আপডেট করুন

---

## 📦 ধাপ ৫: পেমেন্ট রেজিস্টার আপডেট

### ৫.১ ফাইল:`lib/payments/registry.ts`
`docs/planning/payment-registry-update-template.ts` থেকে কোড কপি করুন।

নিশ্চিত করুন:
- পুরনো ৫ টা প্রসেসরের এন্ট্রি পরিবর্তন করবেন না
- শুধু `payroc` ও `maverick` নতুন এন্ট্রি যোগ করবেন
- `initializePaymentRegistry()` ফাংশনে নতুন ক্রেডেনশিয়াল پاس করবেন

---

## 🪝 ধাপ ৬: ওয়েবহুক হ্যান্ডলার বিল্ড (STEP 254/258)

### ৬.১ ফাইল: `src/app/api/webhooks/payroc/[storeId]/route.ts`
`docs/planning/webhook-handler-template.ts` থেকে কোড কপি করুন।

### ৬.২ ফাইল: `src/app/api/webhooks/maverick/[storeId]/route.ts`
একই টেমপ্লেট থেকে কোড কপি করুন।

নিশ্চিত করুন:
- রিকোএসট বডি রå বাংলাদেশ রå পার্স করার আগে HMAC ভেরিফিকেশন করবেন
- আইডempootেন্সি চেক করবেন (একই ইভেন্ট দ্বোরবার প্রসেস হবে না)
- রেসপন্স ২০০ ওকে দেবেন

---

## 🔐 ধাপ ৭: এনভায়রনমেন্ট ভ্যারিয়েবল সেটআপ

### ৭.১ ফাইল: `.env.example`
নিচের ভেরিয়েবল গুলো যোগ করুন:

```bash
# পায়রোক
PAYROC_API_KEY=your_payroc_api_key
PAYROC_API_SECRET=your_payroc_api_secret
PAYROC_MERCHANT_ID=your_payroc_merchant_id
PAYROC_WEBHOOK_SECRET=your_payroc_webhook_secret
PAYROC_ENV=sandbox

# মেভেরিক
MAVERICK_CLIENT_ID=your_maverick_client_id
MAVERICK_CLIENT_SECRET=your_maverick_client_secret
MAVERICK_MERCHANT_ID=your_maverick_merchant_id
MAVERICK_WEBHOOK_SECRET=your_maverick_webhook_secret
MAVERICK_ENV=sandbox

# এনক্রিপশন (শুধুমাত্র এনভায়রনমেন্টে, গিটে না)
ENCRYPTION_MASTER_KEY=base64_encoded_32_byte_key
```

---

## 🧪 ধাপ ৮: ইউনিট টেস্ট লিখুন

পরীক্ষা করুন:
1. `testConnection()` সফল/ব্যর্থ কেস
2. `processPayment()` সফল পেমেন্ট
3. `processPayment()` ব্যর্থ পেমেন্ট
4. `refundPayment()` সফল রিফান্ড
5. `verifyPayrocWebhookSignature()` বৈধ/অবৈধ সígনেচার
6. `verifyMaverickWebhookSignature()` বৈধ/অবৈধ সígনেচার
7. আইডempootেন্সি: একই ট্রানজাকশন দ্বোরবার প্রসেস করলে ডুপ্লিকেট না হওয়া
8. RLC: কোম্পানি A তার লেনデン দেখতে পাবে, কোম্পানি B-এর লেনデン দেখবে না

---

## 📋 ধাপ ৯: হ্যান্ডঅফ ফাইল তৈরি

প্রत्यেক STEP সম্পন্নের পরে তৈরি করুন:

- `docs/handoffs/STEP_251_COMPLETED.md` — পায়রোক ডকুমেন্টেশন ভেরিফিকেশন
- `docs/handoffs/STEP_252_COMPLETED.md` — পায়রোক এনক্রিপ্টেড কী + কানেকশন টেস্ট
- `docs/handoffs/STEP_253_COMPLETED.md` — পায়রোক পেমেন্ট গ্রহণ
- `docs/handoffs/STEP_254_COMPLETED.md` — পায়রোক সাব-মার্চ্যান্ট প্রোভিশনিং + ওয়েবহুক
- `docs/handoffs/STEP_255_COMPLETED.md` — মেভেরিক ডকুমেন্টেশন ভেরিফিকেশন
- `docs/handoffs/STEP_256_COMPLETED.md` — মেভেরিক এনক্রিপ্টেড কী + কানেকশন টেস্ট
- `docs/handoffs/STEP_257_COMPLETED.md` — মেভেরিক পেমেন্ট গ্রহণ
- `docs/handoffs/STEP_258_COMPLETED.md` — মেভেরিক সাব-মার্চ্যান্ট প্রোভিশনিং + ওয়েবহুক

হ্যান্ডঅফ ফাইলে লিখতে হবে:
- স্যান্ডব্যাক্স পেমেন্ট, রিফান্ড, ওয়েবহুক সাইকেল সফল হoulো কিনা
- এনভায়রনমেন্ট ভ্যারিয়েবল সেট করা কিনা
- টাইপচেক, লিন্ট, বিল্ড পাস করা কিনা

---

## 🔍 ধাপ ১০: গিটহাব কোড রিভিউ, সিকিউরিটি ও ভালনারেবিলিটি স্ক্যান

কোডিং শেষের পর নিচের ধাপগুলো গিটহাবে করতে হবে:

### ১০.১ পুল রিকুয়েস্ট তৈরি
```bash
git checkout -b feature/payroc-maverick-integration
git add .
git commit -m "feat: add Payroc and Maverick acquiring processors"
git push origin feature/payroc-maverick-integration
```
গিটহাবে পুল রিকুয়েস্ট তৈরি করুন এবং রিভিউয়ারকে অ্যাসাইন করুন।

### ১০.২ কোড রিভিউ চেকলিস্ট
- সব ফাইলে পথ কমেন্ট আছে কিনা (প্রথম লাইনে `// path: ...`)
- টাইপস্ক্রিপ্ট strict মোড সক্রিয় কিনা
- জোড ভ্যালিডেশন সব ফর্ম ও API এন্ডপয়েন্টে আছে কিনা
- এনভায়রনমেন্ট ভ্যারিয়েবল `.env` ফাইলে নেই কিনা (শুধু `.env.example`ে)
- সিকিউরিটি হেডার সেট করা আছে কিনা
- রেট লিমিটিং সক্রিয় কিনা

### ১০.৩ সিকিউরিটি স্ক্যান টুলস
গিটহাব রেপোতে নিচের টুলস সেটআপ করুন:

**CodeQL (গিটহাব বিল্ট-ইন):**
```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"
on:
  push:
    branches: [main, arena/02f9dca9-p6]
  pull_request:
    branches: [main, arena/02f9dca9-p6]
jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

**গোপন তথ্য স্ক্যান (Secret Scanning):**
গিটহাব রেপো সেটিংসে Security → Secret scanning → Enable করুন।

**ডিপেন্ডেন্ট applicants স্ক্যান (Dependabot):**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**গিটলিকস (Gitleaks - অপশনাল):**
```bash
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
```

### ১০.৪ ডিপেন্ডেন্সি vulnérability স্ক্যান
```bash
npm audit --audit-level=high
```

### ১০.৫ প্রডাকশন ডিপ্লয়মেন্ট গেট
গিটহাব এনভায়রনমেন্ট সুরক্ষা নিয়ম সেট করুন:
- প্রডাকশন এনভায়রনমেন্টে ডিপ্লয় করার আগে পুল রিকুয়েস্ট অনুমোদন বাধyntাatory
- কোড রিভিউ কমপক্ষে ২ জনের অনুমোদন প্রয়োজন
- স্ট্যাটাস চেক পাস করতে হবে (টাইপচেক, লিন্ট, বিল্ড, টেস্ট)

---

## 🏁 ধাপ ১১: প্রডাকশন রেডি চেকলিস্ট

প্রডাকশনে লাইভ করার আগে সব চেক পয়েন্ট সত্য হওয়া নিশ্চিত করুন:

| নং | চেক পয়েন্ট |
|----|-----------|
| ১ | সব STEP ১-২৫৮ পাস করা কিনা |
| ২ | টাইপচেক, লিন্ট, বিল্ড পাস করা কিনা |
| ৩ | ইউনিট টেস্ট পাস করা কিনা |
| ৪ | স্যান্ডব্যাক্স পেমেন্ট, রিফান্ড, ওয়েবহুক সাইকেল সফল কিনা |
| ৫ | ওয়েবহুক সিগনেচার ভেরিফিকেশন কাজ করে কিনা |
| ৬ | আইডempootেন্সি কী কাজ করে কিনা |
| ৭ | RLC এনabled কিনা |
| ৮ | অডিট লগ সক্রিয় কিনা |
| ৯ | এসএসএল সার্টিফিকেট সক্রিয় কিনা |
| ১০ | রেট লিমিটিং সক্রিয় কিনা |
| ১১ | গোপন তথ্য `.env` ফাইলে নেই কিনা |
| ১২ | গিটহাব সিকিউরিটি স্ক্যান পাস করে কিনা |

সব চেক পয়েন্ট সত্য হওয়ার পর গো-লাই অনুমতি দিন।

---

## ❌ ত্রুটি যেন না হয় (সতর্কতা)

১. **আসল API ডকুমেন্টেশন পড়ুন:** টেমপ্লেট গুলোতে `VERIFY` লিখা জায়গা গুলো কোডিং সেশনে পায়রোক/মেভেরিক অফিসিয়াল সাইট থেকে ডকুমেন্টেশন পড়ার পরে পূরণ করুন। অনুমান করবেন না।
২. **পুরনো মাইগ্রেশন এডিট করবেন না:** শুধু append-only নতুন মাইগ্রেশন যোগ করবেন।
৩. **পুরনো STEP বদলা করবেন না:** STEP ১-২৫০ কিছুই বদলা যাবে না।
৪. **কার্ড ডাটা:** প্ল্যাটফর্ম সার্ভার কখনো প্যান/এক্সপিরি/সiivি দেখবে না।
৫. **ওয়েবহুক সিগনেচার:** ভেরিফিকেশন ছাড়া কোনো ওয়েবহুক প্রসেস করবেন না।
৬. **এনভায়রনমেন্ট ভ্যারিয়েবল:** গিট রেপোতে রিয়্যাল ভ্যালু থাকবে না।

---

## ✅ ডেফিনিশন অফ ডন (কাজ শেষের শর্ত)

- [ ] সাইনআপ পেইজে কোনো কম্প্লায়েন্স পলিসি দেখাবে না
- [ ] সাইনআপের শুধু মৌলিক টার্মস অফ সার্ভিস থাকবে
- [ ] বিজনেস প্রোফাইল পেইজে কোনো পলিসি দেখাবে না
- [ ] পলিসি accepter পেইজে সব ১১ টি পলিসি দেখাবে
- [ ] শুধু সব পলিসি accepter করলে KYB সাবমিট বাটন সক্রিয় হবে
- [ ] `POST /api/v1/kyb/submit` পলিসি acceptor না থাকলে `422` রিটার্ন করবে
- [ ] পলিসি accepter রেকর্ডে `accepted_from_ip` ও `user_agent` সেভ হবে
- [ ] RLC এনabled থাকবে `company_id` দ্বারা
- [ ] অডিট লগে পলিসি acceptor ও KYB সাবমিশন লিখিত হবে
- [ ] ইউনিট টেস্ট পাস করবে
- [ ] মাইগ্রেশন append-only হবে, পুরনো migration edit করা হবে না
- [ ] পায়রোক ও মেভেরিক অড্যাপ্টার `lib/payments/adapters/` এর অধীনে এক ফাইল করে থাকবে
- [ ] `docs/final/PROVIDER_DOCS.md` এর আগের ৫ টা ডকুমেন্টেশন মুছে ফেলা যাবে না

---

**এই প্রম্পটটি Arena.ai এজেন্টকে দিলে সে নিখুঁতভাবে কোডিং করতে পারবে। কোনো জায়গা confusion হলে কাজ বন্ধ করে জিজ্ঞাসা করুন।**
