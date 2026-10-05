-- Migration: Add updated_at column to users table
-- Description: Adds missing updated_at column that the Drizzle schema expects

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
