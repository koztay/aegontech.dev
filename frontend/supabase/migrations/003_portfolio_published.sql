-- Add publish/unpublish support to portfolio items.
-- Backwards-compatible: existing rows default to published so nothing is hidden.
ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;

-- Index for the public "only published" filter.
CREATE INDEX IF NOT EXISTS idx_portfolio_items_published
  ON portfolio_items (published);
