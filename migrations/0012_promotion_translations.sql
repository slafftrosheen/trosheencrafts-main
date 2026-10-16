-- TROSHEEN-CMS-019: editable language variants for promotional cards.
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS title_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS description_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS link_text_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
