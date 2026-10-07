-- Migration: Align order_items with current Drizzle schema (server/db/schema.ts)
-- Code inserts: orderId, productId, quantity, price, variant (+createdAt default).
-- Legacy NOT NULL columns (product_name, total) are no longer written by the app;
-- they are dropped here after backfill. product_image was also app-managed and
-- unused by the ORM.

-- variant: selected constructor options (finish/wax/aroma summary)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant TEXT;

-- created_at: schema expects a default timestamp
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Backfill then drop legacy columns no longer present in the Drizzle schema
UPDATE order_items SET total = price * quantity WHERE total IS NULL;
ALTER TABLE order_items ALTER COLUMN product_name DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN total DROP NOT NULL;
ALTER TABLE order_items DROP COLUMN IF EXISTS product_name;
ALTER TABLE order_items DROP COLUMN IF EXISTS product_image;
ALTER TABLE order_items DROP COLUMN IF EXISTS total;
