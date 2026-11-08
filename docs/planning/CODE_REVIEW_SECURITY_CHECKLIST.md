# Code Review, Security & Vulnerability Checklist — GitHub

**Branch:** `arena/02f9dca9-p6`  
**Planning Repo:** `/home/user/P6`  
**Target Coding Repo:** `https://github.com/kohinur169/kd-solution-it`  
**Language:** English only  
**Status:** Authoritative security checklist  
**Owner:** DevOps / Security Team

এই ডকুমেন্টে গিটহাব রেপোতে কোড রিভিউ, সিকিউরিটি স্ক্যান, vulnerable স্ক্যান ও প্রডাকশন রেডি যাচাই করার পূর্ণাঙ্গ ধাপ লিখিত আছে।

---

## ১. পুল রিকুয়েস্ট প্রক্রিয়া (PR Workflow)

### ১.১ ন毕竟 নতুন ফিচার বা বাগ ফিক্সের জন্য
```bash
# কোডিং রেপোতে কাজ শুরু
git checkout -b feature/payroc-maverick-integration
# কোড লিখুন, কমিট করুন
git add .
git commit -m "feat: add Payroc and Maverick acquiring processors"
git push origin feature/payroc-maverick-integration
```

### ১.২ গিটহাবে পুল রিকুয়েস্ট তৈরি
1. গিটহাব রেপোতে যান → Pull requests → New pull request
2. বেস ব্রাঞ্চ: `main` অথবা `arena/02f9dca9-p6`
3. compare ব্রাঞ্চ: আপনার ফিচার ব্রাঞ্চ
4. টাইটেল: সংক্ষিপ্ত ও বর্ণনামূলক (উদাহরণ: `feat: integrate Payroc and Maverick payment processors`)
5. ডেসক্রিপশন: পরিবর্তনের সারांশ, টেস্টিং ফলাফল, কোনো ব্রেকিং চেঞ্জ আছে কিনা
6. রিভিউয়ার অ্যাসাইন করুন (কমপক্ষে ২ জন)
7. লেবেল যোগ করুন: `security`, `payment`, `backend`, `frontend`

---

## ২. কোড রিভিউ চেকলিস্ট (Reviewer's Checklist)

রিভিউয়ার নিচের প্রতিটি আইটেম যাচাই করবেন:

### ২.১ কোড কাঠামো ও মান
| নং | চেক পয়েন্ট | সত্যা/অসত্যা |
|----|-----------|-----------|
| ১ | সব ফাইলের প্রথম লাইনে পথ কমেন্ট আছে কিনা (`// path: ...`) | |
| ২ | টাইপস্ক্রিপ্ট strict মোড সক্রিয় কিনা | |
| ৩ | জোড ভ্যালিডেশন সব ফর্ম ও API এন্ডপয়েন্টে আছে কিনা | |
| ৪ | ফাংশন ও ভেরিয়েবল নাম বাংলা ছাড়া ইংরেজি কিনা | |
| ৫ | কোডে বlooived কোড নেই কিনা | |
| ৬ | এরর হ্যান্ডলিং সঠিক কিনা (try-catch, ত্রুটি messaage) | |
| ৭ | লগিং স্ট্রাকচারড কিনা (request_id সহ) | |

### ২.২ নিরাপত্তা (Security)
| নং | চেক পয়েন্ট | সত্যা/অসত্যা |
|----|-----------|-----------|
| ১ | `.env` ফাইলে কোনো গোপন তথ্য (এপিআই কী, পাসওয়ার্ড, সিক্রেট) নেই কিনা | |
| ২ | শুধু `.env.example` ফাইলে প্লেসহোল্ডার আছে কিনা | |
| ৩ | অ্যাক্সেস টোকেন AES-256-GCM এনক্রিপ্টেড কিনা | |
| ৪ | ওয়েবহুক সিগনেচার ভেরিফিকেশন সঠিক কিনা | |
| ৫ | কার্ড ডাটা (প্যান, এক্সপিরি, সiivি) প্ল্যাটফর্ম সার্ভারে যাচ্ছে না কিনা | |
| ৬ | RLC এনabled (`company_id` দ্বারা) কিনা | |
| ৭ | রেট লিমিটিং সক্রিয় কিনা | |
| ৮ | কমেন্টে বা লগে কোনো গোপন তথ্য নেই কিনা | |

### ২.৩ ডাটাবেস ও মাইগ্রেশন
| নং | চেক পয়েন্ট | সত্যা/অসত্যা |
|----|-----------|-----------|
| ১ | পুরনো কোনো মাইগ্রেশন এডিট করা হয়নি কিনা | |
| ২ | নতুন মাইগ্রেশন append-only কিনা | |
| ৩ | প্রতিটি মাইগ্রেশনে `up` ও `down` 섹শন আছে কিনা | |
| ৪ | sobrenম্বর পরের unused নম্বর ব্যবহার করা হয়েছে কিনা | |
| ৫ | ইনডেক্স সঠিক জায়গায় আছে কিনা | |

### ২.৪ ওয়েবহুক ও API
| নং | চেক পয়েন্ট | সত্যা/অসত্যা |
|----|-----------|-----------|
| ১ | ওয়েবহুক সিগনেচার ভেরিফিকেশন কাজ করছে কিনা | |
| ২ | আইডempootেন্সি চেক আছে কিনা | |
| ৩ | রেসপন্স টাইম আউট ২ সেকেন্ডের মধ্যে কিনা | |
| ৪ | এর روسيا risposta ফরম্যাট সঠিক কিনা | |
| ৫ | রেট লিমিটিং সক্রিয় কিনা | |

---

## ৩. গিটহাব সিকিউরিটি স্ক্যান সেটআপ

### ৩.১ গিটহাব এডভান্সড সিকিউরিটি এনাবল করা
গিটহাব রেপো সেটিংসে যান → Security → Advanced Security → Enable

এতে সক্রিয় হবে:
- Code scanning (CodeQL)
- Dependabot alerts
- Secret scanning

### ৩.২ কোডকিউএল (CodeQL) কনফিগারেশন
```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"
on:
  push:
    branches: [main, arena/02f9dca9-p6]
  pull_request:
    branches: [main, arena/02f9dca9-p6]
  schedule:
    - cron: '0 8 * * 1'

jobs:
  analyze:
    name: Analyze
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
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

### ৩.৩ ডিপেন্ডেন্ট applicants স্ক্যান (Dependabot)
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### ৩.৪ গোপন তথ্য স্ক্যান (Secret Scanning)
গিটহাব সেটিংসে Security → Secret scanning → Enable করুন। এটি গিট ইতিহাসে গোপন তথ্য (এপিআই কী, পাসওয়ার্ড, সিক্রেট) খুঁজে বের করবে।

---

## ৪. অতিরিক্ত সিকিউরিটি টুলস (অপশনাল)

### ৪.১ গিটলিকস (Gitleaks)
```yaml
# .github/workflows/gitleaks.yml
name: Gitleaks
on: [push, pull_request]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
```

### ৪.২ স্নায়ক (Snyk)
```yaml
# .github/workflows/snyk.yml
name: Snyk
on: [push, pull_request]
jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects
```

---

## ৫. প্রডাকশন ডিপ্লয়মেন্ট গেট (Go-Live Gates)

গিটহাব এনভায়রনমেন্ট সুরক্ষা নিয়ম সেট করুন:

### ৫.১ এনভায়রনমেন্ট সুরক্ষা
গিটহাব রেপো সেটিংসে Environments → `production` → Add protection rules:
- Required reviewers: কমপক্ষে ২ জন
- Required status checks: টাইপচেক, লিন্ট, বিল্ড, টেস্ট সব পাস করতে হবে
- Wait for approval: এনাবল করা

### ৫.২ ডিপ্লয়মেন্ট前 জরুরি যাচাই
প্রডাকশনে ডিপ্লয় করার আগে নিশ্চিত করুন:

| নং | চেক পয়েন্ট | পদ্ধতি |
|----|-----------|--------|
| ১ | সব STEP পাস করছে কিনা | গিটহাব-actions রান রেজাল্ট |
| ২ | টাইপচেক, লিন্ট, বিল্ড পাস করে কিনা | `npm run typecheck`, `npm run lint`, `npm run build` |
| ৩ | ইউনিট টেস্ট পাস করে কিনা | `npm test` |
| ৪ | স্যান্ডব্যাক্স পেমেন্ট, রিফান্ড, ওয়েবহুক সাইকেল সফল কিনা | হ্যান্ডঅফ ফাইলে প্রমাণ |
| ৫ | ওয়েবহুক সিগনেচার ভেরিফিকেশন কাজ করে কিনা | টেস্ট পেনট্রেশন |
| ৬ | আইডempootেন্সি কী কাজ করে কিনা | ডুপ্লিকেট অনুরোধ টেস্ট |
| ৭ | RLC এনabled কিনা | ডাটাবেস স্কিমা যাচাই |
| ৮ | অডিট লগ সক্রিয় কিনা | লগ টেবিল যাচাই |
| ৯ | এসএসএল সার্টিফিকেট সক্রিয় কিনা | প্রোডাকশন ডোমেন যাচাই |
| ১০ | রেট লিমিটিং সক্রিয় কিনা | API রেট লিমিট টেস্ট |
| ১১ | গোপন তথ্য `.env` ফাইলে নেই কিনা | গিট রেপো স্ক্যান |
| ১২ | গিটহাব সিকিউরিটি স্ক্যান পাস করে কিনা | CodeQL, Dependabot, Secret scanning |

সব চেক পয়েন্ট সত্য হওয়ার পর গো-লাই অনুমতি দিন।

---

## ৬. কোড রিভিউ কর্তৃক অনুমোদন ফর্ম

পুল রিকুয়েস্টে রিভিউয়ার নিচের ফর্ম পূরণ করবেন:

```
PR #: _______
ব্রাঞ্চ: _______________________
রিভিউয়ার: _______________________

✅ কোড কাঠাপ zweigeschossিক Reviewed
✅ নিরাপত্তা চেক সম্পন্ন
✅ ডাটাবেস মাইগ্রেশন যাচাই
✅ ওয়েবহুক ও API টেস্ট
✅ টাইপচেক, লিন্ট, বিল্ড পাস
✅ ইউনিট টেস্ট পাস
✅ গিটহাব সিকিউরিটি স্ক্যান পাস

মত: _________________________________
অনুমোদন: ✅ হ্যাঁ / ❌ না
তারিখ: ___________
```

---

## ৭. আপলোড করার জন্য ফাইলের তালিকা (কোডিং রেপোতে পাঠানোর জন্য)

১. `docs/planning/CODE_REVIEW_SECURITY_CHECKLIST.md` (এই ফাইল)
২. `docs/final/API_CONTRACT.md`
৩. `docs/planning/MASTER_AGENT_CODING_INSTRUCTIONS.md`
৪. `docs/planning/AGENT_CODING_PROMPT.md`
৫. `docs/final/STEP_PLAN_250.md`
৬. `docs/final/FEATURE_LIST.md`
৭. `docs/planning/KYB_POLICY_FLOW_CORRECTION.md`
৮. `docs/planning/DATABASE_SETUP.md`
৯. `docs/planning/WEBHOOK_API_RELIABILITY_GUIDE.md`
১০. `docs/planning/payroc-adapter-template.ts`
১১. `docs/planning/maverick-adapter-template.ts`
১২. `docs/planning/payment-registry-update-template.ts`
১৩. `docs/planning/webhook-handler-template.ts`
১৪. `docs/planning/migration-0251-payroc-adapter.sql`
১৫. `docs/planning/migration-0255-maverick-adapter.sql`

---

## ৮. শেষ কথা

এই চেকলিস্টগুলো অনুসরণ করলে আপনার প্ল্যাটফর্ম ত্রুটিমুক্ত, নিরাপদ ও প্রডাকশন রেডি হবে। গিটহাবের বিল্ট-ইন সিকিউরিটি ফিচার (CodeQL, Dependabot, Secret scanning) স�ক্রিয় করে রাখুন এবং প্রতিটি পুল রিকুয়েস্টে কোড রিভিউ বাধ্যতামূলক করুন।

---

**End of Code Review & Security Checklist.**
