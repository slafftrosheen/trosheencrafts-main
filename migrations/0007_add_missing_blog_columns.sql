-- Migration: Add missing columns to blog_posts table to match schema
-- Description: Adds image column (schema expects 'image', legacy DB had 'cover_image')

-- Guard: ensure legacy cover_image exists so the backfill below cannot fail
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image TEXT;

-- Backfill image from legacy cover_image column
UPDATE blog_posts SET image = cover_image WHERE image IS NULL AND cover_image IS NOT NULL;
