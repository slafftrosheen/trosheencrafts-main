-- Additive manufacturing state. Does not alter payment, shipping or inventory.
-- Run npm run migrate before starting the new application. Do not use db:push.
CREATE TABLE IF NOT EXISTS order_production (
  order_id INTEGER PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'ready_to_ship')),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_production_events (
  id BIGSERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  action TEXT NOT NULL CHECK (action IN ('start', 'finish', 'ready', 'reopen')),
  from_status TEXT NOT NULL CHECK (from_status IN ('not_started', 'in_progress', 'completed', 'ready_to_ship')),
  to_status TEXT NOT NULL CHECK (to_status IN ('not_started', 'in_progress', 'completed', 'ready_to_ship')),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'telegram')),
  actor_id TEXT NOT NULL,
  -- Snapshot, not a recipient FK: revoking/replacing a bot must not erase history.
  actor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, version)
);
CREATE INDEX IF NOT EXISTS order_production_status_idx ON order_production(status, order_id);
CREATE INDEX IF NOT EXISTS order_production_events_order_idx ON order_production_events(order_id, id DESC);
