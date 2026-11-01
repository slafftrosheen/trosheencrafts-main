-- Run with the SQL migration runner before starting the new application.
-- Credential revisions are retained to verify already-issued checkouts after a merchant change.
CREATE TABLE IF NOT EXISTS sumup_credentials (
  id SERIAL PRIMARY KEY,
  merchant_code TEXT NOT NULL,
  api_key_ciphertext TEXT NOT NULL,
  key_fingerprint TEXT NOT NULL,
  sandbox BOOLEAN,
  business_name TEXT,
  country TEXT,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_code, key_fingerprint)
);
CREATE INDEX IF NOT EXISTS sumup_credentials_merchant_idx ON sumup_credentials (merchant_code, checked_at DESC);
CREATE TABLE IF NOT EXISTS sumup_payment_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  credential_id INTEGER REFERENCES sumup_credentials(id),
  legacy_credential_id INTEGER REFERENCES sumup_credentials(id),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  site_url TEXT NOT NULL,
  description_prefix TEXT NOT NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sumup_checkout_bindings (
  checkout_id TEXT PRIMARY KEY,
  checkout_reference TEXT NOT NULL,
  order_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  credential_id INTEGER NOT NULL REFERENCES sumup_credentials(id),
  merchant_code TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  kind TEXT NOT NULL CHECK (kind IN ('order','setup')),
  hosted_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'order' AND order_id IS NOT NULL) OR (kind = 'setup' AND order_id IS NULL))
);
