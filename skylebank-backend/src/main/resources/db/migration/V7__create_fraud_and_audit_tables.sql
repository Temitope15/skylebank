-- V7__create_fraud_and_audit_tables.sql
-- Create fraud_alerts and audit_logs tables, and add user_agent column to transactions

CREATE TABLE fraud_alerts (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    details VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions ADD COLUMN user_agent VARCHAR(255);
