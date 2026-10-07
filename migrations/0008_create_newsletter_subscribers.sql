-- Migration: Create newsletter_subscribers table
-- Referenced by server/db/schema.ts and server/routes/newsletter.ts but never
-- existed in the live database.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    unsubscribed_at TIMESTAMP,
    source TEXT DEFAULT 'website',
    ip_address TEXT,
    user_agent TEXT,
    preferences JSONB DEFAULT '{"marketing": true, "productUpdates": true, "blogUpdates": true}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_is_active_idx ON newsletter_subscribers (is_active);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_subscribed_at_idx ON newsletter_subscribers (subscribed_at);
