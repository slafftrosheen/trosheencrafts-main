-- Migration: Add missing columns to blog_posts table to match schema
-- Description: Adds image column (schema expects 'image', DB has 'cover_image')

ALTER TABLE blog_posts 
  ADD COLUMN IF NOT EXISTS image TEXT;

-- Optionally copy data from cover_image to image if needed
UPDATE blog_posts SET image = cover_image WHERE image IS NULL AND cover_image IS NOT NULL;
