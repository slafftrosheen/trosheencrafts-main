-- Add gallery tables
CREATE TABLE IF NOT EXISTS "site_config" (
    "id" SERIAL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "site_config_key_idx" ON "site_config" ("key");

CREATE TABLE IF NOT EXISTS "gallery_categories" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "featured" BOOLEAN DEFAULT FALSE,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "gallery_categories_slug_idx" ON "gallery_categories" ("slug");
CREATE INDEX IF NOT EXISTS "gallery_categories_type_idx" ON "gallery_categories" ("type");

CREATE TABLE IF NOT EXISTS "gallery_items" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "category_id" INTEGER REFERENCES "gallery_categories"("id") ON DELETE SET NULL,
    "type" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "metadata" JSONB,
    "tags" JSONB DEFAULT '[]',
    "featured" BOOLEAN DEFAULT FALSE,
    "published" BOOLEAN DEFAULT TRUE,
    "view_count" INTEGER DEFAULT 0,
    "likes" INTEGER DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "gallery_items_slug_idx" ON "gallery_items" ("slug");
CREATE INDEX IF NOT EXISTS "gallery_items_category_id_idx" ON "gallery_items" ("category_id");
CREATE INDEX IF NOT EXISTS "gallery_items_type_idx" ON "gallery_items" ("type");
CREATE INDEX IF NOT EXISTS "gallery_items_featured_idx" ON "gallery_items" ("featured");
CREATE INDEX IF NOT EXISTS "gallery_items_published_idx" ON "gallery_items" ("published");
