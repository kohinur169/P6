-- Migration 0255: Maverick adapter tables
-- Owner: STEP 255-258
-- Append-only migration — do NOT edit previous migrations
-- Next unused migration number after inspecting real inventory

-- up
CREATE TABLE IF NOT EXISTS maverick_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    provider VARCHAR(32) NOT NULL DEFAULT 'maverick',
    shop_domain VARCHAR(255) NOT NULL UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_maverick_stores_company_id ON maverick_stores(company_id);
CREATE INDEX IF NOT EXISTS idx_maverick_stores_shop_domain ON maverick_stores(shop_domain);
CREATE INDEX IF NOT EXISTS idx_maverick_stores_status ON maverick_stores(status);

CREATE TABLE IF NOT EXISTS maverick_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES maverick_stores(id),
    external_transaction_id VARCHAR(255) NOT NULL UNIQUE,
    order_id VARCHAR(255),
    customer_email VARCHAR(255),
    amount NUMERIC(18,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, authorized, captured, settled, failed, voided, refunded
    authorization_code VARCHAR(255),
    avs_response VARCHAR(255),
    cvv_response VARCHAR(255),
    redirect_url TEXT,
    action_required BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_maverick_transactions_store_id ON maverick_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_maverick_transactions_external_id ON maverick_transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_maverick_transactions_status ON maverick_transactions(status);

CREATE TABLE IF NOT EXISTS maverick_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES maverick_transactions(id),
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

CREATE INDEX IF NOT EXISTS idx_maverick_refunds_transaction_id ON maverick_refunds(transaction_id);

CREATE TABLE IF NOT EXISTS maverick_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES maverick_stores(id),
    event_type VARCHAR(128) NOT NULL,
    external_event_id VARCHAR(255) NOT NULL UNIQUE,
    request_hash VARCHAR(64), -- SHA-256 of payload for idempotency audit
    response_status INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maverick_webhook_logs_store_id ON maverick_webhook_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_maverick_webhook_logs_external_event_id ON maverick_webhook_logs(external_event_id);

-- RLS
ALTER TABLE maverick_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE maverick_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maverick_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE maverick_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY maverick_stores_company_isolation ON maverick_stores
    FOR ALL TO authenticated
    USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY maverick_transactions_company_isolation ON maverick_transactions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM maverick_stores WHERE maverick_stores.id = maverick_transactions.store_id
        AND maverick_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

CREATE POLICY maverick_refunds_company_isolation ON maverick_refunds
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM maverick_transactions
        JOIN maverick_stores ON maverick_stores.id = maverick_transactions.store_id
        WHERE maverick_transactions.id = maverick_refunds.transaction_id
        AND maverick_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

CREATE POLICY maverick_webhook_logs_company_isolation ON maverick_webhook_logs
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM maverick_stores WHERE maverick_stores.id = maverick_webhook_logs.store_id
        AND maverick_stores.company_id = current_setting('app.current_company_id')::UUID
    ));

-- down (rollback)
-- DROP TABLE IF EXISTS maverick_webhook_logs;
-- DROP TABLE IF EXISTS maverick_refunds;
-- DROP TABLE IF EXISTS maverick_transactions;
-- DROP TABLE IF EXISTS maverick_stores;
