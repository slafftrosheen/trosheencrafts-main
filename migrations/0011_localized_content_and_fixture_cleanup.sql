-- TROSHEEN-013: multilingual CMS fields and removal of original fixture content.
-- Idempotent: source rows edited or replaced in admin are preserved.
-- This migration does not touch uploaded R2 objects or genuine customer content.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS title_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE gallery_categories ADD COLUMN IF NOT EXISTS name_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE gallery_categories ADD COLUMN IF NOT EXISTS description_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS title_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS description_translations JSONB NOT NULL DEFAULT '{}'::jsonb;

-- The old 0005 migration created exactly these two demo items.
DELETE FROM gallery_items
WHERE (slug = 'heart-vessel-3d'
       AND title = 'Heart Vessel 3D'
       AND media_url = 'https://example.com/models/heart.glb')
   OR (slug = 'workshop-bench'
       AND title = 'Workshop Bench'
       AND media_url = 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200');

-- Known mock journal rows from retired sample seed scripts only.
DELETE FROM blog_posts
WHERE (slug = 'art-of-slow-batch' AND title = 'The Art of the Slow Batch'
       AND image = '/assets/concrete casting process-DHsS8MbC.webp')
   OR (slug = 'winter-workshop' AND title = 'Winter in the Daugavpils Workshop'
       AND image = '/assets/story photo-Dner3Ksw.webp')
   OR (slug = 'our-story-from-daugavpils-to-the-world'
       AND title = 'Our Story: From Daugavpils to the World'
       AND image IN ('/uploads/blog-story.jpg', '/uploads/blog-story.webp'))
   OR (slug = 'the-art-of-concrete-candle-making'
       AND title = 'The Art of Concrete Candle Making'
       AND image IN ('/uploads/blog-candle-making.jpg', '/uploads/blog-candle-making.webp'));

-- Drop only the untouched fixture categories once they are empty.
DELETE FROM gallery_categories
WHERE slug IN ('concrete-sculptures', 'garden-pieces', 'workshop-photos', 'product-photography')
  AND name IN ('Concrete Sculptures', 'Garden Pieces', 'Workshop Photos', 'Product Photography')
  AND NOT EXISTS (SELECT 1 FROM gallery_items WHERE gallery_items.category_id = gallery_categories.id);
