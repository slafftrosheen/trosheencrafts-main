-- Migration: Add social media cross-posting fields to blog_posts table
-- Description: Adds video, mediaType, tags, postedToSocial, and socialPostIds columns

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS video TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS posted_to_social BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS social_post_ids JSONB;
