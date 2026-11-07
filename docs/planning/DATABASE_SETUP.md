# Database Setup Plan — KD SOLUTION IT

**Repository:** P6 (planning source only)  
**Status:** Draft  
**Language:** English only  
**Owner:** DevOps / Platform Team

This document defines how the Supabase database will be installed and set up automatically across environments. Actual SQL migration files and code live in the separate coding repository.

---

## 1. Environments

| Environment | Supabase Project | Purpose |
|-------------|-----------------|---------|
| Development | `kd-platform-dev` | Developer local testing |
| Staging | `kd-platform-staging` | Client review, audit, restore rehearsal |
| Production | `kd-platform-prod` | Live merchant and client traffic |

Each environment has its own database, migrations, roles, and RLS policies. Test mode data never mixes with production data.

---

## 2. Migration File Structure

Migration files live in the separate coding repository under `migrations/` in chronological order:

```
migrations/
├── 0001_initial_schema.sql
├── 0002_rls_policies.sql
├── 0003_auth_tables.sql
├── ...
├── 0114_invoice_numbering.sql      # Completed — DO NOT EDIT
├── 0115_take_invoice_number.sql    # Completed — DO NOT EDIT
├── 0123_recurring_jobs.sql         # Completed — DO NOT EDIT
├── ...
├── 0146_payment_core.sql           # Completed
├── 0147_nmi_adapter.sql            # Completed
├── ...
├── 0169_airwallex_adapter.sql      # Completed
├── 0170_supplementary_idv.sql      # Completed
├── ...
├── 0180_taxcloud.sql               # Completed
├── ...
├── 0251_payroc_adapter.sql         # New — append-only
├── 0252_payroc_keys.sql            # New — append-only
├── 0253_payroc_payments.sql        # New — append-only
├── 0254_payroc_provisioning.sql    # New — append-only
├── 0255_maverick_adapter.sql       # New — append-only
├── 0256_maverick_keys.sql          # New — append-only
├── 0257_maverick_payments.sql      # New — append-only
├── 0258_maverick_provisioning.sql  # New — append-only
├── 0259_shopify_stores.sql         # New — Store Connections
├── 0260_woocommerce_stores.sql     # New — Store Connections
└── README.md
```

**Rules:**
- Completed migrations must never be edited.
- New migrations are append-only at the end.
- Next migration number = max existing number + 1 (verified against real migration inventory before creation).
- Every migration has an `up` section and a `down` (rollback) section.

---

## 3. Automatic Installation / Setup Method

### 3.1 Supabase CLI Installation (Local & CI/CD)

```bash
# Install once globally
npm install -g supabase

# Login
supabase login

# Link repository to project
supabase link --project-ref <project-ref>
```

### 3.2 Local Development Setup

```bash
# Reset local database and run all migrations
supabase db reset

# Push only pending migrations
supabase db push
```

### 3.3 Staging & Production Deployment (CI/CD)

GitHub Actions pipeline runs on push to `main` when `migrations/` changes:

```yaml
# .github/workflows/deploy.yml (example)
name: Deploy Database
on:
  push:
    branches: [main]
    paths: ['migrations/**']

jobs:
  migrate-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Supabase CLI
        run: npm install -g supabase
      - name: Link to Staging
        run: supabase link --project-ref ${{ secrets.SUPABASE_STAGING_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - name: Run Migrations
        run: supabase db push --linked
```

---

## 4. Migration File Format (Example)

Each migration file contains `up` and `down` sections:

```sql
-- migrations/0251_payroc_adapter.sql
-- STEP 251: Payroc adapter tables

-- up
CREATE TABLE IF NOT EXISTS payroc_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    shop_domain VARCHAR(255) NOT NULL UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    scope TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    connected_at TIMESTAMPTZ,
    webhook_secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_payroc_stores_company_id ON payroc_stores(company_id);
CREATE INDEX IF NOT EXISTS idx_payroc_stores_shop_domain ON payroc_stores(shop_domain);

-- RLS
ALTER TABLE payroc_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY payroc_stores_company_isolation ON payroc_stores
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);

-- down (rollback)
DROP TABLE IF EXISTS payroc_stores;
```

---

## 5. Database Setup Checklist

| Step | Action | Responsible |
|------|--------|-------------|
| 1 | Create Supabase projects (dev/staging/prod) | DevOps |
| 2 | Enable daily backups | DevOps |
| 3 | Add `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` | Developer |
| 4 | Add all SQL files to `migrations/` folder | Developer |
| 5 | Run `supabase db reset` locally to verify | Developer |
| 6 | Run migrations on Staging and audit | QA |
| 7 | Run migrations on Production (after go-live gates pass) | DevOps |

---

## 6. Environment Variables (`.env.example`)

```bash
# Database
DATABASE_URL=postgresql://postgres:<password>@db..supabase.co:5432/postgres
SUPABASE_URL=https:// ব্যবহারকারী.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Encryption
ENCRYPTION_MASTER_KEY=<32-byte-base64>
```

---

## 7. Automated Testing (Before and After Migration)

1. `supabase db reset` — runs all migrations locally to verify they apply cleanly.
2. Rollback test — execute `down` scripts to verify reversibility.
3. RLS test — attempt to access data with a different `company_id`; must be blocked.
4. Audit log — verify every mutation is written to the audit table.

---

## 8. P6 Planning Documentation Only

This file is a planning document stored in P6. The actual SQL migration files, Supabase CLI configuration, and CI/CD pipeline code live in the separate coding repository. P6 does not contain implementation code.

---

**End of Database Setup Plan.**
