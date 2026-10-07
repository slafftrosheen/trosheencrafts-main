-- Migration: Add products.category text column
-- server/routes/products.ts and server/routes/categories.ts query and filter on
-- products.category (text), but the live table only has category_id (FK).

ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

-- Backfill from the normalized categories table where possible
UPDATE products
SET category = (
    SELECT c.slug FROM categories c WHERE c.id = products.category_id
)
WHERE category IS NULL AND category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
