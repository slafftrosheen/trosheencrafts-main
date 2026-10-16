-- Align users table with server/db/schema.ts, which requires updated_at.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
