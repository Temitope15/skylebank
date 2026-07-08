CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(36) UNIQUE NOT NULL,
    source_wallet_id BIGINT REFERENCES wallets(id) ON DELETE SET NULL,
    target_wallet_id BIGINT NOT NULL REFERENCES wallets(id),
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
