-- Migration: create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  url text NOT NULL,
  alt_text text NOT NULL,
  caption text,
  source text NOT NULL DEFAULT 'upload',
  mime_type text,
  size_bytes bigint,
  checksum text,
  portfolio_item_id uuid REFERENCES portfolio_items(id) ON DELETE SET NULL,
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_storage_path ON media_assets(storage_path);
