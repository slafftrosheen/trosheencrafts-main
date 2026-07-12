-- Migration: Add social media cross-posting fields to blog_posts table
-- Description: Adds video, mediaType, tags, postedToSocial, and socialPostIds columns

-- Add new columns to blog_posts table
ALTER TABLE blog_posts 
  ADD COLUMN IF NOT EXISTS video TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS posted_to_social BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS social_post_ids JSONB;

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.video IS 'URL to video content for video posts';
COMMENT ON COLUMN blog_posts.media_type IS 'Type of media: text, image, or video';
COMMENT ON COLUMN blog_posts.tags IS 'Array of tags for the blog post (used for social media hashtags)';
COMMENT ON COLUMN blog_posts.posted_to_social IS 'Whether this post has been cross-posted to social media';
COMMENT ON COLUMN blog_posts.social_post_ids IS 'Social media post IDs from Instagram, Facebook, Telegram';
