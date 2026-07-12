-- Migration to add site_config table
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_config_key_idx ON site_config (key);

-- Optionally, add initial default config values if needed
INSERT INTO site_config (key, value) VALUES 
('contact', '{ "email": "hello@trosheen.shop", "phone": "+371 20000000", "address": "Daugavpils, Latvia" }'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_config (key, value) VALUES 
('social', '{ "instagram": "https://www.instagram.com/trosheencrafts", "facebook": "https://www.facebook.com/trosheencrafts", "youtube": null, "telegram": null }'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_config (key, value) VALUES 
('businessHours', '{ "monFri": "09:00 - 18:00", "satSun": "By Appointment" }'::jsonb)
ON CONFLICT (key) DO NOTHING;
