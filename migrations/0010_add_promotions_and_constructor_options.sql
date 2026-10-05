-- Migration: Add promotions and constructor_options tables
-- Description: Creates tables for homepage promotions and product constructor options

-- Promotions table for homepage banners/slides
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    video_url TEXT,
    link_url TEXT,
    link_text TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promotions_active_idx ON promotions(active);
CREATE INDEX IF NOT EXISTS promotions_sort_order_idx ON promotions(sort_order);

-- Constructor Options table for finishes, waxes, aromas
CREATE TABLE IF NOT EXISTS constructor_options (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- 'finish', 'wax', 'aroma'
    key TEXT NOT NULL UNIQUE, -- e.g., 'white-stone', 'soy', 'lavender'
    name_translations JSONB NOT NULL, -- { en: string, lv?: string, ru?: string, pl?: string, uk?: string }
    price DECIMAL(10, 2) NOT NULL DEFAULT '0',
    color TEXT, -- for finish swatches (hex or gradient)
    border TEXT, -- for finish swatch borders
    image_url TEXT, -- for vessel images
    desc_translations JSONB, -- { en?: string, lv?: string, ru?: string, pl?: string, uk?: string }
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS constructor_options_type_idx ON constructor_options(type);
CREATE UNIQUE INDEX IF NOT EXISTS constructor_options_key_idx ON constructor_options(key);
CREATE INDEX IF NOT EXISTS constructor_options_active_idx ON constructor_options(active);
CREATE INDEX IF NOT EXISTS constructor_options_sort_order_idx ON constructor_options(sort_order);

-- Insert sample promotions (optional - can be removed after testing)
INSERT INTO promotions (title, description, image_url, link_url, link_text, active, sort_order) VALUES
('Handcrafted Concrete Art', 'Each piece is made with love in our family workshop', '/hero-workshop.webp', '/shop', 'Shop Now', true, 1),
('Custom Orders Welcome', 'Personalize your piece with custom finishes and aromas', '/constructor-hero.webp', '/constructor', 'Design Yours', true, 2)
ON CONFLICT DO NOTHING;

-- Insert sample constructor options (finishes, waxes, aromas)
INSERT INTO constructor_options (type, key, name_translations, price, color, border, active, sort_order) VALUES
-- Finishes
('finish', 'white-stone', '{"en": "White Stone", "lv": "Balts Akmens", "ru": "Белый Камень", "pl": "Biały Kamień", "uk": "Білий Камінь"}', 0, '#f5f5f5', '#ddd', true, 1),
('finish', 'grey-stone', '{"en": "Grey Stone", "lv": "Pelēks Akmens", "ru": "Серый Камень", "pl": "Szary Kamień", "uk": "Сірий Камінь"}', 0, '#9e9e9e', '#777', true, 2),
('finish', 'terracotta', '{"en": "Terracotta", "lv": "Terakota", "ru": "Терракота", "pl": "Terakota", "uk": "Теракота"}', 0, '#e2725b', '#b0503a', true, 3),
('finish', 'black-stone', '{"en": "Black Stone", "lv": "Melns Akmens", "ru": "Черный Камень", "pl": "Czarny Kamień", "uk": "Чорний Камінь"}', 0, '#2d2d2d', '#111', true, 4),

-- Waxes
('wax', 'soy', '{"en": "Soy Wax", "lv": "Sojas Vaķis", "ru": "Соевый Воск", "pl": "Wosk Sojowy", "uk": "Сойовий Воск"}', 0, null, null, true, 1),
('wax', 'beeswax', '{"en": "Beeswax", "lv": "Bišu Vaķis", "ru": "Пчелиный Воск", "pl": "Wosk Pszczeli", "uk": "Бджолиний Воск"}', 2.50, null, null, true, 2),
('wax', 'coconut', '{"en": "Coconut Wax", "lv": "Kokosa Vaķis", "ru": "Кокосовый Воск", "pl": "Wosk Kokosowy", "uk": "Кокосовий Воск"}', 3.00, null, null, true, 3),

-- Aromas
('aroma', 'lavender', '{"en": "Lavender", "lv": "Lavanda", "ru": "Лаванда", "pl": "Lawenda", "uk": "Лаванда"}', 0, null, null, true, 1),
('aroma', 'vanilla', '{"en": "Vanilla", "lv": "Vānille", "ru": "Ваниль", "pl": "Wanilia", "uk": "Ваніль"}', 0, null, null, true, 2),
('aroma', 'cedarwood', '{"en": "Cedarwood", "lv": "Cēdru Koks", "ru": "Кедр", "pl": "Cedr", "uk": "Кедр"}', 2.00, null, null, true, 3),
('aroma', 'unscented', '{"en": "Unscented", "lv": "Bez Aroma", "ru": "Без Аромата", "pl": "Bez Zapachu", "uk": "Без Аромату"}', 0, null, null, true, 4)
ON CONFLICT (key) DO NOTHING;
