-- Trosheen Workshop: dedicated private Telegram operations bot, no inbound webhook.
-- Apply with npm run migrate BEFORE starting the updated application.
CREATE TABLE IF NOT EXISTS telegram_workshop_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bot_token_ciphertext TEXT NOT NULL,
  bot_id BIGINT NOT NULL,
  bot_username TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  update_offset BIGINT NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_workshop_recipients (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  telegram_username TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_workshop_pairings (
  id SERIAL PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telegram_workshop_pairings_expiry_idx
  ON telegram_workshop_pairings (expires_at) WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS telegram_workshop_outbox (
  id BIGSERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES telegram_workshop_recipients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('paid', 'payment_review')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMP NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMP,
  sent_at TIMESTAMP,
  telegram_message_id BIGINT,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT telegram_workshop_once UNIQUE (order_id, recipient_id, event_type)
);

CREATE INDEX IF NOT EXISTS telegram_workshop_outbox_delivery_idx
  ON telegram_workshop_outbox (available_at, id)
  WHERE sent_at IS NULL;
