# Arena.ai Agent Coding Prompt — KD SOLUTION IT Payment Platform

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only (code, comments, strings, documentation)  
**Status:** Authoritative implementation prompt  
**Owner:** Platform Team / Payments Squad

আপনি এই প্রম্পটটি Arena.ai এজেন্ট বা কোডিং টিমকে দেবেন। এজেন্টকে এই নির্দেশনা অনুযায়ী কোডিং করতে হবে যেন প্রজেক্টটি ত্রুটিমুক্ত ও প্রডাকশন রেডি হয়।

---

## ১. লক্ষ্য (Objective)

আপনার কাজ:
১. পেমেন্ট फैसिलিটেটর প্ল্যাটফর্মে **Payroc** এবং **Maverick** নতুন অ্যাকুইরিং প্রসেসর হিসেবে যুক্ত করা।
২. **সাইনআপ এবং KYB/KYC ভেরিফিকেশন ফ্লোকে আলাদা করা** — সাইনআপে শুধু মৌলিক অ্যাকাউন্ট তথ্য, নীতিমালা শুধু ভেরিফিকেশনের আগে দেখানো।
৩. পুরনো STEP ১-২৫০ কিছুই বদলা যাবে না। নতুন STEP ২৫১-২৫৮ append-only ভাবে থাকবে।
৪. ওয়েবহুক ও API ত্রুটিমুক্তভাবে রিয়েল-টাইম সিঙ্ক রাখা।
৫. গিটহাবে কোড রিভিউ, vulnérable স্ক্যান ও সিকিউরিটি চেক করতে সক্ষম করতে হবে।

---

## ২. প্ল্যানিং ডকুমেন্ট গুলো (পূর্বে তৈরি, পੜতে হবে)

নিচের ফাইলগুলি P6 রেপোতে তৈরি রয়েছে। কোডিং শুরু করার আগে এ全部 পড়তে হবে:

| SL | ফাইল পাথ | উদ্দেশ্য |
|----|----------|---------|
| ১ | `docs/final/STEP_PLAN_250.md` | মোট ২৫৮ STEP; ২৫১-২৫৮ Payroc/Maverick |
| ২ | `docs/final/FEATURE_LIST.md` | Section 6: Payment Processors (Seven) |
| ৩ | `docs/final/API_CONTRACT.md` | সঠিক API এন্ডপয়েন্ট, রিকোএসট/রেসপন্স JSON |
| ৪ | `docs/planning/SHOPIFY_APP_PLAN.md` | শপিফাই অ্যাপ বিল্ড প্ল্যান |
| ৫ | `docs/planning/WOOCOMMERCE_PLUGIN_PLAN.md` | ও stories প্লাগইন বিল্ড প্ল্যান |
| ৬ | `docs/planning/DATABASE_SETUP.md` | সুপাবase ডাটাবেস সেটআপ প্ল্যান |
| ৭ | `docs/planning/KYB_POLICY_FLOW_CORRECTION.md` | সাইনআপ vs ভেরিফিকেশন ফ্লো সংশোধন |
| ৮ | `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md` | মাস্টার কোডিং নির্দেশনা |
| ৯ | `docs/planning/payroc-adapter-template.ts` | পায়রোক অ্যাডাপ্টার কোড টেমপ্লেট |
| ১০ | `docs/planning/maverick-adapter-template.ts` | মেভেরিক অ্যাডাপ্টার কোড টেমপ্লেট |
| ১১ | `docs/planning/payment-registry-update-template.ts` | পেমেন্ট রেজিস্টার আপডেট |
| ১২ | `docs/planning/webhook-handler-template.ts` | ওয়েবহুক হ্যান্ডলার কোড টেমপ্লেট |
| ১৩ | `docs/planning/migration-0251-payroc-adapter.sql` | পায়রোক ডাটাবেস মাইগ্রেশন |
| ১৪ | `docs/planning/migration-0255-maverick-adapter.sql` | মেভেরিক ডাটাবেস মাইগ্রেশন |
| ১৫ | `docs/planning/WEBHOOK_API_RELIABILITY_GUIDE.md` | লাইভ প্রডাকশনের জন্য ওয়েবহুক ও API নির্ভরযোগ্যতা |

---

## ৩. সাইনআপ vs KYB ফ্লো সংশোধন (বাধ্যতামূলক)

### ৩.১ সাইনআপ পেইজ (`/auth/signup`)
- শুধু: ইমেইল, পাসওয়ার্ড, নাম, ফোন নম্বর, Cloudflare Turnstile, মৌলিক টার্মস অফ সার্ভিস চেকবক্স
- কোনো কম্প্লায়েন্স পলিসি দেখাবে না (KYC/KYB, UBO, AML/CFT, সানকশন/PEP, আন্ডাররাইটিং, মর্চেন্ট অ behaviors, chargeback, refund, fraud, ডাটা প্রাইভেসি, PCI-DSS — সব বাদ)

### ৩.২ বিজনেস প্রোফাইল পেইজ (`/dashboard/kyb/business-profile`)
- ব্যবসার তথ্য ও ডকুমেন্ট আপলোড
- পলিসি দেখাবে না

### ৩.৩ নীতিমালা acceptor পেইজ (`/dashboard/kyb/policy-acceptance`)
- সব ১১ টি পলিসি দেখাবে, চেকবক্সের মাধ্যমে সম্মতি
- শুধু সব চেকবক্স চেক করলে সাবমিট বাটন সক্রিয়

### ৩.৪ KYB সাবমিশন (`POST /api/v1/kyb/submit`)
- শুধুমাত্র সব পলিসি accepter-full হলে সফল
- অন্যথায় `422 Unprocessable Entity` রিটার্ন করবে

---

## ৪. নতুন একুইরিং প্রসেসর যুক্ত করা (STEP 251-258)

### ৪.১ Payroc (STEP 251-254)
- `lib/payments/adapters/payroc/` ফোল্ডারে এক ফাইল করে অ্যাডাপ্টার তৈরি
- AES-256-GCM এনক্রিপ্টেড কী কনফিগারেশন
- পেমেন্ট গ্রহণ (sale/auth/capture/refund/void)
- সাব-মার্চ্যান্ট প্রোভিশনিং + আইডempootেন্সি ওয়েবহুক
- ডকুমেন্টেশন ভেরিফিকেশন (payroc.com offizielle ডকুমেন্টেশন পড়ার পরে)

### ৪.২ Maverick (STEP 255-258)
- `lib/payments/adapters/maverick/` ফোল্ডারে এক ফাইল করে অ্যাডাপ্টার তৈরি
- একই প্যাটার্নে Maverick এর জন্য

### ৪.৩ পেমেন্ট রেজিস্টার আপডেট
- `lib/payments/registry.ts`-এ `payroc` ও `maverick` নতুন এন্ট্রি যোগ
- পুরনো ৫ টা প্রসেসরের এন্ট্রি পরিবর্তন করবেন না

---

## ৫. ডাটাবেস মাইগ্রেশন (অ্যাপেন্ড-অনলি)

### ৫.১ নতুন মাইগ্রেশন ফাইল
- `migrations/0261_policy_versions.sql` — পলিসি ভার্সন টেবিল
- `migrations/0262_merchant_policy_acceptance.sql` — পলিসি accepter টেবিল
- `migrations/0263_kyc_submissions_update.sql` — kyc_submissions টেবিল আপডেট
- `migrations/0251_payroc_adapter.sql` — পায়রোক টেবিল
- `migrations/0255_maverick_adapter.sql` — মেভেরিক টেবিল

### ৫.২ নিয়ম
- পুরনো কোনো মাইগ্রেশন এডিট করবেন না
- সর্বোচ্চ 번호 بعدی unused নম্বর ব্যবহার করবেন
- প্রতিটি মাইগ্রেশনে `up` ও `down` (rollback) 섹শন থাকবে
- RLC এনabled থাকবে `company_id` দ্বারা

---

## ৬. API কন্ট্রাক্ট বিল্ডিং

### ৬.১ নতুন এন্ডপয়েন্ট
| এন্ডপয়েন্ট | পদ্ধতি | উদ্দেশ্য |
|-----------|--------|---------|
| `POST /api/v1/policies/accept` | POST | একাধিক পলিসি accepter রেকর্ড |
| `POST /api/v1/kyb/submit` | POST | KYB সাবমিশন (পলিসি accepter চেক সহ) |
| `GET /api/v1/kyb/status` | GET | KYB স্ট্যাটাস |

### ৬.২ রিকোএসট/রেসপন্স ফরম্যাট
`docs/final/API_CONTRACT.md`-এ লিখিত সঠিক JSON ফরম্যাট অনুসরণ করতে হবে।

---

## ৭. নিরাপত্তা নিয়ম (বাধyntাatory)

| নিয়ম | বাস্তবায়ন |
|------|----------|
| অ্যাক্সেস টোকেন এনক্রিপশন | AES-256-GCM, কী শুধু এনভায়রনমেন্ট ভ্যারিয়েবলে |
| ওয়েবহুক ভেরিফিকেশন | সিগনেচার ছাড়া কোনো ওয়েবহুক প্রসেস নয় |
| কার্ড ডাটা | প্ল্যাটফর্ম সার্ভার কখনো প্যান/এক্সপিরি/সিভiivি দেখবে না |
| RLS | `company_id` দ্বারা ট্যানেন্ট আইসোলেশন |
| অডিট লগ | প্রতিটি অ্যাকশন লিখিত হবে |
| মাস্কিং | পূর্ণ কী/সিক্রেটCreate করার পর একবারই দেখাবে |

---

## ৮. যাচাই Checklist (কোডিং শেষের পর)

- [ ] সাইনআপ পেইজে কোনো কম্প্লায়েন্স পলিসি দেখাবে না
- [ ] সাইনআপের শুধু মৌলিক টার্মস অফ সার্ভিস থাকবে
- [ ] বিজনেস প্রোফাইল পেইজে কোনো পলিসি দেখাবে না
- [ ] পলিসি accepter পেইজে সব ১১ টি পলিসি দেখাবে
- [ ] শুধু সব পলিসি accepter করলে KYB সাবমিট বাটন সক্রিয় হবে
- [ ] `POST /api/v1/kyb/submit` পলিসি acceptor না থাকলে `422` রিটার্ন করবে
- [ ] পলিসি accepter রেকর্ডে `accepted_from_ip` ও `user_agent` সেভ হবে
- [ ] RLS এনabled থাকবে `company_id` দ্বারা
- [ ] অডিট লগে পলিসি acceptor ও KYB সাবমিশন লিখিত হবে
- [ ] ইউনিট টেস্ট পাস করবে
- [ ] মাইগ্রেশন append-only হবে, পুরনো migration edit করা হবে না
- [ ] Payroc ও Maverick অড্যাপ্টার `lib/payments/adapters/` এর অধীনে এক ফাইল করে থাকবে
- [ ] `docs/final/PROVIDER_DOCS.md` এর আগের ৫ টা ডকুমেন্টেশন মুছে ফেলা যাবে না

---

## ৯. গিটহাব কোড রিভিউ, সিকিউরিটি ও vulnérable স্ক্যান ধাপ

কোডিং শেষের পর নিচের ধাপগুলো গিটহাবে করতে হবে:

### ৮.১ পুল রিকুয়েস্ট তৈরি
```bash
git checkout -b feature/payroc-maverick-integration
git add .
git commit -m "feat: add Payroc and Maverick acquiring processors"
git push origin feature/payroc-maverick-integration
```
গিটহাবে পুল রিকুয়েস্ট তৈরি করুন এবং রিভিউয়ারকে অ্যাসাইন করুন।

### ৮.২ কোড রিভিউ চেকলিস্ট
- সব ফাইলে পথ কমেন্ট আছে কিনা (প্রথম লাইনে `// path: ...`)
- টাইপস্ক্রিপ্ট strict মোড সক্রিয় কিনা
- জোড ভ্যালিডেশন সব ফর্ম ও API এন্ডপয়েন্টে আছে কিনা
- এনভায়রনমেন্ট ভ্যারিয়েবল `.env` ফাইলে নেই কিনা (শুধু `.env.example`ে)
- সিকিউরিটি হেডার সেট করা আছে কিনা
- রেট লিমিটিং সক্রিয় কিনা

### ৮.৩ সিকিউরিটি স্ক্যান টুলস
গিটহাব রেপোতে নিচের টুলস সেটআপ করুন:

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  push:
    branches: [main, arena/02f9dca9-p6]
  pull_request:
    branches: [main, arena/02f9dca9-p6]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run npm audit
        run: npm audit --audit-level=high
      - name: Run Snyk (optional)
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - name: Run CodeQL analyze
        uses: github/codeql-action/analyze@v3
```

### ৮.৪ সংবেদনশীল তথ্য স্ক্যান
গিটহাব রেপোতে গোপন তথ্য (এপিআই কী, পাসওয়ার্ড, সিক্রেট) স্ক্যান করতে নিচের টুল ব্যবহার করুন:
- `gitleaks` — গিট ইতিহাসে গোপন তথ্য খুঁজে বের করা
- `trufflehog` — গিট ইতিহাসে গোপন তথ্য খুঁজে বের করা

```bash
# গিটহাব অ্যাকশনে যোগ করুন
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
```

### ৮.৫ ডিপেন্ডেন্সি vulnérability স্ক্যান
```bash
npm audit --audit-level=high
```
অথবা গিটহাব ডিপেন্ডেন্ট অ্যالينಗার্ট সকান সক্রিয় করুন।

### ৮.৬ প্রডাকশন ডিপ্লয়মেন্ট গেট
গিটহাব এনভায়রনমেন্ট সুরক্ষা নিয়ম সেট করুন:
- প্রডাকশন এনভায়রনমেন্টে ডিপ্লয় করার আগে পুল রিকুয়েস্ট অনুমোদন বাধ্যতামূলক
- কোড রিভিউ কমপক্ষে ২ জনের অনুমোদন প্রয়োজন
- স্ট্যাটাস চেক পাস করতে হবে (টাইপচেক, লিন্ট, বিল্ড, টেস্ট)

---

## ৯. প্রডাকশন রেডি finais चेकলিস্ট

| নং | চেক পয়েন্ট | সত্যা/অসত্যা |
|----|-----------|-----------|
| ১ | সব STEP ১-২৫৮ পাস করে কিনা | |
| ২ | টাইপচেক, লিন্ট, বিল্ড পাস করে কিনা | |
| ৩ | ইউনিট টেস্ট পাস করে কিনা | |
| ৪ | স্যান্ডব্যাক্স পেমেন্ট, রিফান্ড, ওয়েবহুক সাইকেল সফল কিনা | |
| ৫ | ওয়েবহুক সিগনেচার ভেরিফিকেশন কাজ করে কিনা | |
| ৬ | আইডempootেন্সি কী কাজ করে কিনা | |
| ৭ | RLC এনabled কিনা | |
| ৮ | অডিট লগ সক্রিয় কিনা | |
| ৯ | এসএসএল সার্টিফিকেট সক্রিয় কিনা | |
| ১০ | রেট লিমিটিং সক্রিয় কিনা | |
| ১১ | গোপন তথ্য `.env` ফাইলে নেই কিনা | |
| ১২ | গিটহাব সিকিউরিটি স্ক্যান পাস করে কিনা | |

সব চেক পয়েন্ট সত্য হওয়ার পর গো-লাই অনুমতি দিন।

---

## ১০. Arena.ai এজেন্টের জন্য অটোমেটিক বিল্ড নির্দেশনা

এজেন্টকে নিচের ক্রমে কাজ করতে বলুন:

১. **প্রথমে**, `docs/final/STEP_PLAN_250.md`-এ STEP ২৫১-২৫৮ আছে কিনা যাচাই করুন।
২. **দ্বিতীয়ত**, `docs/final/FEATURE_LIST.md` Section 6-এ "Seven" লিখেছে কিনা যাচাই করুন।
৩. **তৃতীয়ত**, `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`-এ লিখিত UI/UX ফ্লো অনুযায়ী সাইনআপ পেইজ থেকে কম্প্লায়েন্স পলিসি সরিয়ে ফেলুন।
৪. **চতুর্থত**, `docs/final/API_CONTRACT.md`-এ লিখিত এন্ডপয়েন্ট অনুযায়ী `POST /api/v1/policies/accept`, `POST /api/v1/kyb/submit` বিল্ড করুন।
৫. **পঞ্চমত**, `docs/planning/DATABASE_SETUP.md`-এ লিখিত মাইগ্রেশন ফরম্যাট অনুযায়ী নতুন টেবিল তৈরি করুন (পরবর্তী unused মাইগ্রেশন নম্বর ব্যবহার করে)।
৬. **ষষ্ঠত**, `lib/payments/adapters/payroc/` এবং `lib/payments/adapters/maverick/` ফোল্ডার তৈরি করে অড্যাপ্টার ফাইল লিখুন।
৭. **সপ্তমত**, ইউনিট টেস্ট লিখুন এবং রান করুন।
৮. **অষ্টমত**, হ্যান্ডঅফ ফাইল তৈরি করুন (`docs/handoffs/STEP_251_COMPLETED.md` ইত্যাদি)।

এমনকি কোনো পথ বা ফাইল চিহ্নিত করতে অসমর্থ হলে, কাজ বন্ধ করে জিজ্ঞাসা করুন। পুরনো কোনো STEP বা মাইগ্রেশন এডিট করবেন না।

---

## ১১. কোডিং রেপোতে আপলোড করার জন্য ফাইলের তালিকা

১. `docs/final/STEP_PLAN_250.md`
২. `docs/final/FEATURE_LIST.md`
৩. `docs/final/API_CONTRACT.md`
৪. `docs/planning/SHOPIFY_APP_PLAN.md`
৫. `docs/planning/WOOCOMMERCE_PLUGIN_PLAN.md`
৬. `docs/planning/DATABASE_SETUP.md`
৭. `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`
৮. `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md`
৯. `docs/planning/AGENT_CODING_PROMPT.md` (এই ফাইল)
১০. `docs/planning/payroc-adapter-template.ts`
১১. `docs/planning/maverick-adapter-template.ts`
১২. `docs/planning/payment-registry-update-template.ts`
১৩. `docs/planning/webhook-handler-template.ts`
১৪. `docs/planning/migration-0251-payroc-adapter.sql`
১৫. `docs/planning/migration-0255-maverick-adapter.sql`
১৬. `docs/planning/WEBHOOK_API_RELIABILITY_GUIDE.md`

---

**End of Agent Coding Prompt.**
