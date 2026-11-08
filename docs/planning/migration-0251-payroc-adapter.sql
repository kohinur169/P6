-- Migration 0251: Payroc adapter tables
-- Owner: STEP 251-254
-- Append-only migration — do NOT edit previous migrations
-- Next unused migration number after inspecting real inventory

-- up
CREATE TABLE IF NOT EXISTS payroc_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    provider VARCHAR(32) NOT NULL DEFAULT 'payroc',
    shop_domain VARCHAR(255) NOT NULL UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    merchant_id VARCHAR(255) NOT NULL,
    sub_merchant_id VARCHAR(255),
    scope TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, action_required, verified, restricted, rejected
    webhook_secret VARCHAR(255),
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_payroc_stores_company_id ON payroc_stores(company_id);
CREATE INDEX IF NOT EXISTS idx_payroc_stores_shop_domain ON payroc_stores(shop_domain);
CREATE INDEX IF NOT EXISTS idx_payroc_stores_status ON payroc_stores(status);

CREATE TABLE IF NOT EXISTS payroc_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES payroc_stores(id),
    external_transaction_id VARCHAR(255) NOT NULL UNIQUE,
    order_id VARCHAR(255),
    customer_email VARCHAR(255),
    amount NUMERIC(18,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, authorized, captured, settled, failed, voided, refunded
    auth_code VARCHAR(255),
    avs_result VARCHAR(255),
    cvv_result VARCHAR(255),
    three_ds_url TEXT,
    requires_action BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_payroc_transactions_store_id ON payroc_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_payroc_transactions_external_id ON payroc_transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payroc_transactions_status ON payroc_transactions(status);

CREATE TABLE IF NOT EXISTS payroc_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES payroc_transactions(id),
    external_refund_id VARCHAR(255) NOT NULL UNIQUE,
    amount NUMERIC(18,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, completed, failed
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_payroc_refunds_transaction_id ON payroc_refunds(transaction_id);

CREATE TABLE IF NOT EXISTS payroc_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES payroc_stores(id),
    event_type VARCHAR(128) NOT NULL,
    external_event_id VARCHAR(255) NOT NULL UNIQUE,
    request_hash VARCHAR(64), -- SHA-256 of payload for idempotency audit
    response_status INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payroc_webhook_logs_store_id ON payroc_webhook_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_payroc_webhook_logs_external_event_id ON payroc_webhook_logs(external_event_id);

-- RLS
ALTER TABLE payroc_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroc_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroc_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY payroc_stores_company_isolation ON payroc_stores
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY payroc_transactions_company_isolation ON payroc_transactions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM payroc_stores WHERE payroc_stores.id = payroc_transactions.store_id
        AND payroc_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

CREATE POLICY payroc_refunds_company_isolation ON payroc_refunds
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM payroc_transactions
        JOIN payroc_stores ON payroc_stores.id = payroc_transactions.store_id
        WHERE payroc_transactions.id = payroc_refunds.transaction_id
        AND payroc_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

CREATE POLICY payroc_webhook_logs_company_isolation ON payroc_webhook_logs
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM payroc_stores WHERE payroc_stores.id = payroc_webhook_logs.store_id
        AND payroc_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

-- down (rollback)
-- DROP TABLE IF EXISTS payroc_webhook_logs;
-- DROP TABLE IF EXISTS payroc_refunds;
-- DROP TABLE IF EXISTS payroc_transactions;
-- DROP TABLE IF EXISTS payroc_stores;
