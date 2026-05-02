-- Add token_version to users for JWT invalidation support
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;

-- Add idempotency_keys table for duplicate request prevention
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    response_code INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at);
