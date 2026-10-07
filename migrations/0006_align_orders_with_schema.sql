-- Migration: Align orders table with current Drizzle schema (server/db/schema.ts)
-- Legacy live table has stripe-era columns (customer_email, amount...) that the
-- application no longer writes. Code inserts: userId, totalAmount, status,
-- shippingAddress, paymentMethodId.

-- user_id: nullable FK to users (guest checkout has no user)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users (id) ON DELETE SET NULL;

-- total_amount: server computes the price; legacy rows (none live) fall back to total
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2);
UPDATE orders SET total_amount = total WHERE total_amount IS NULL;
ALTER TABLE orders ALTER COLUMN total_amount SET NOT NULL;

-- payment_method_id: stores the SumUp checkout/reference id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- index for user-scoped order lookups
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);
