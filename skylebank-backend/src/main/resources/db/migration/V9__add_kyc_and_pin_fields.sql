-- Alter users table to add KYC and transaction PIN fields
ALTER TABLE users ADD COLUMN kyc_level VARCHAR(20) DEFAULT 'TIER_1' NOT NULL;
ALTER TABLE users ADD COLUMN bvn VARCHAR(11) NULL;
ALTER TABLE users ADD COLUMN nin VARCHAR(11) NULL;
ALTER TABLE users ADD COLUMN transaction_pin VARCHAR(100) NULL;

-- Create kyc_upgrade_requests table
CREATE TABLE kyc_upgrade_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_tier VARCHAR(20) NOT NULL,
    bvn VARCHAR(11) NULL,
    nin VARCHAR(11) NULL,
    document_url VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Index for lookup performance
CREATE INDEX idx_kyc_upgrade_requests_user ON kyc_upgrade_requests(user_id);
CREATE INDEX idx_kyc_upgrade_requests_status ON kyc_upgrade_requests(status);
