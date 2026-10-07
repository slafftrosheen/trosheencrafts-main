-- Migration: Gallery system + site configuration
-- Consolidates former 0003_add_gallery_and_site_config.sql, 0003_gallery_system.sql,
-- 0008_gallery_system.sql and 0009_add_site_config.sql into one idempotent migration.

-- ============ gallery_categories ============
CREATE TABLE IF NOT EXISTS gallery_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL, -- '3d' or 'photo'
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gallery_categories_slug_idx ON gallery_categories (slug);
CREATE INDEX IF NOT EXISTS gallery_categories_type_idx ON gallery_categories (type);

-- ============ gallery_items ============
CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES gallery_categories (id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- '3d', 'photo', or 'video'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gallery_items_slug_idx ON gallery_items (slug);
CREATE INDEX IF NOT EXISTS gallery_items_category_id_idx ON gallery_items (category_id);
CREATE INDEX IF NOT EXISTS gallery_items_type_idx ON gallery_items (type);
CREATE INDEX IF NOT EXISTS gallery_items_featured_idx ON gallery_items (featured);
CREATE INDEX IF NOT EXISTS gallery_items_published_idx ON gallery_items (published);

-- ============ site_config ============
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_config_key_idx ON site_config (key);

-- ============ seed data (idempotent) ============
INSERT INTO gallery_categories (name, slug, description, type, featured, sort_order) VALUES
('Concrete Sculptures', 'concrete-sculptures', '3D models of our handcrafted concrete sculptures', '3d', true, 1),
('Garden Pieces', 'garden-pieces', '3D models of garden decorations and stepping stones', '3d', false, 2),
('Workshop Photos', 'workshop-photos', 'Behind-the-scenes photography from our family workshop', 'photo', true, 3),
('Product Photography', 'product-photography', 'Professional photos of our finished pieces', 'photo', false, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gallery_items (title, slug, description, category_id, type, media_url, thumbnail_url, tags, featured, published, sort_order) VALUES
('Heart Vessel 3D', 'heart-vessel-3d', 'Interactive 3D model of our signature heart vessel candle holder', (SELECT id FROM gallery_categories WHERE slug='concrete-sculptures'), '3d', 'https://example.com/models/heart.glb', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', '["concrete", "candle", "heart"]', true, true, 1),
('Workshop Bench', 'workshop-bench', 'A photo of our family workshop bench where the magic happens', (SELECT id FROM gallery_categories WHERE slug='workshop-photos'), 'photo', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400', '["workshop", "family", "craftsman"]', true, true, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_config (key, value) VALUES
('contact', '{ "email": "hello@trosheen.shop", "phone": "+371 20000000", "address": "Daugavpils, Latvia" }'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_config (key, value) VALUES
('social', '{ "instagram": "https://www.instagram.com/trosheencrafts", "facebook": "https://www.facebook.com/trosheencrafts", "youtube": null, "telegram": null }'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_config (key, value) VALUES
('businessHours', '{ "monFri": "09:00 - 18:00", "satSun": "By Appointment" }'::jsonb)
ON CONFLICT (key) DO NOTHING;
