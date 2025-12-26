# data-model.md — Portfolio & Blog Marketing Site

## Entities & Fields (Supabase Postgres)

### portfolio_items
- id (uuid, pk)
- source_url (text, unique)
- type (enum: web, app)
- title (text)
- summary (text)
- tags (text[])
- featured_flag (boolean, default false)
- status (enum: draft, published, needs_attention)
- order_rank (int, default 0)
- hero_link (text)
- metadata_snapshot (jsonb) — raw fetched metadata
- version_note (text)
- created_by (uuid, fk -> auth.users)
- updated_at (timestamptz, default now())
- created_at (timestamptz, default now())

### media_assets
- id (uuid, pk)
- portfolio_item_id (uuid, fk -> portfolio_items, nullable)
- blog_post_id (uuid, fk -> blog_posts, nullable)
- storage_path (text)
- alt_text (text)
- caption (text)
- source (enum: capture, app_store, upload)
- mime_type (text)
- size_bytes (int)
- checksum (text)
- created_by (uuid, fk -> auth.users)
- created_at (timestamptz, default now())

### blog_posts
- id (uuid, pk)
- title (text)
- slug (text, unique)
- summary (text)
- body (text)  
- tags (text[])
- featured_image_id (uuid, fk -> media_assets)
- inline_media_ids (uuid[])
- status (enum: draft, published)
- published_at (timestamptz)
- source (enum: n8n, api)
- api_key_id (uuid, fk -> api_keys, nullable)
- version_note (text)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### api_keys
- id (uuid, pk)
- name (text)
- hashed_key (text)
- scope (enum: blog_ingest)
- status (enum: active, rotated, revoked)
- rate_limit_window (int, seconds)
- created_by (uuid, fk -> auth.users)
- last_used_at (timestamptz)
- created_at (timestamptz, default now())

### audit_logs
- id (uuid, pk)
- actor_type (enum: user, api_key)
- actor_id (uuid)
- action (text)
- entity_type (text)
- entity_id (uuid)
- outcome (enum: success, failure)
- correlation_id (text)
- ip (inet)
- user_agent (text)
- created_at (timestamptz, default now())

### auth/roles (Supabase)
- Use Supabase Auth for AdminUser; roles stored in `auth.users.user_metadata.roles` (e.g., admin). RLS policies restrict writes to admins; API key scopes enforced in edge route.

## Indexes & Constraints
- portfolio_items: unique (source_url); index (featured_flag, status, order_rank); index (type)
- media_assets: index (portfolio_item_id); index (blog_post_id)
- blog_posts: unique (slug); index (status, published_at); index (tags)
- api_keys: unique (hashed_key); index (status)
- audit_logs: index (entity_type, entity_id); index (actor_type, actor_id)

## Versioning & Audit
- portfolio_items and blog_posts store version_note per change; use audit_logs for actor/action/outcome.
- Restores handled by copying prior snapshot/version_note into new revision (app-level logic).

## Storage
- Supabase Storage bucket `public-media` with hashed paths per entity; store checksum and mime for validation; alt_text required.

## RLS (conceptual)
- Public read on published portfolio_items/blog_posts.
- Writes restricted to authenticated admin users (role=admin).
- Blog ingestion route bypasses RLS via service role, but validates API key scope before writes.
