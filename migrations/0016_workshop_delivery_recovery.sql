-- Additive recovery metadata. Apply before starting the updated worker.
ALTER TABLE telegram_workshop_config
  ADD COLUMN IF NOT EXISTS delivery_retry_at TIMESTAMPTZ;
ALTER TABLE telegram_workshop_outbox
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error_code INTEGER,
  ADD COLUMN IF NOT EXISTS attempt_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lock_token TEXT,
  ADD COLUMN IF NOT EXISTS retry_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
-- Preserve historical total attempts; do not invent a failure or delivery receipt.
UPDATE telegram_workshop_outbox SET attempt_streak = LEAST(attempts, 12)
  WHERE sent_at IS NULL AND attempt_streak = 0 AND attempts > 0;
CREATE INDEX IF NOT EXISTS telegram_workshop_outbox_ready_idx
  ON telegram_workshop_outbox (available_at, id)
  WHERE sent_at IS NULL AND failed_at IS NULL AND skipped_at IS NULL;
CREATE INDEX IF NOT EXISTS telegram_workshop_outbox_failed_idx
  ON telegram_workshop_outbox (id DESC)
  WHERE failed_at IS NOT NULL AND sent_at IS NULL;
