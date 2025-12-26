-- Supabase migration: core schemas for portfolio/blog site
-- Creates enums, tables, indexes, triggers, and storage bucket per data-model

set check_function_bodies = off;

-- Ensure UUID generation available
create extension if not exists "pgcrypto";

-- Enums
create type public.portfolio_type as enum ('web', 'app');
create type public.portfolio_status as enum ('draft', 'published', 'needs_attention');
create type public.media_source as enum ('capture', 'app_store', 'upload');
create type public.blog_status as enum ('draft', 'published');
create type public.blog_source as enum ('n8n', 'api');
create type public.api_key_scope as enum ('blog_ingest');
create type public.api_key_status as enum ('active', 'rotated', 'revoked');
create type public.audit_actor_type as enum ('user', 'api_key');
create type public.audit_outcome as enum ('success', 'failure');

-- Helper to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Helper to check admin role from JWT user_metadata.roles
create or replace function public.is_admin()
returns boolean as $$
declare
  roles jsonb := coalesce((auth.jwt() -> 'user_metadata' -> 'roles')::jsonb, '[]'::jsonb);
begin
  return exists (
    select 1
    from jsonb_array_elements_text(roles) as r(val)
    where r.val = 'admin'
  );
end;
$$ language plpgsql stable;

-- portfolio_items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  source_url text not null unique,
  type public.portfolio_type not null,
  title text not null,
  summary text,
  tags text[] not null default '{}',
  featured_flag boolean not null default false,
  status public.portfolio_status not null default 'draft',
  order_rank int not null default 0,
  hero_link text,
  metadata_snapshot jsonb,
  version_note text,
  created_by uuid references auth.users,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_featured_idx on public.portfolio_items (featured_flag, status, order_rank);
create index if not exists portfolio_items_type_idx on public.portfolio_items (type);

create trigger set_timestamp_portfolio_items
before update on public.portfolio_items
for each row execute procedure public.set_updated_at();

-- media_assets
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid,
  blog_post_id uuid,
  storage_path text not null,
  alt_text text not null,
  caption text,
  source public.media_source not null,
  mime_type text,
  size_bytes int,
  checksum text,
  created_by uuid references auth.users,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_portfolio_idx on public.media_assets (portfolio_item_id);
create index if not exists media_assets_blog_idx on public.media_assets (blog_post_id);

-- api_keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hashed_key text not null unique,
  scope public.api_key_scope not null,
  status public.api_key_status not null default 'active',
  rate_limit_window int not null default 60,
  created_by uuid references auth.users,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_status_idx on public.api_keys (status);

-- blog_posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  body text not null,
  tags text[] not null default '{}',
  featured_image_id uuid,
  inline_media_ids uuid[] not null default '{}',
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  source public.blog_source not null default 'api',
  api_key_id uuid references public.api_keys,
  version_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at);
create index if not exists blog_posts_tags_idx on public.blog_posts using gin (tags);

create trigger set_timestamp_blog_posts
before update on public.blog_posts
for each row execute procedure public.set_updated_at();

-- Add foreign keys after base tables exist
alter table public.media_assets
  add constraint media_assets_portfolio_item_id_fkey
    foreign key (portfolio_item_id) references public.portfolio_items on delete set null,
  add constraint media_assets_blog_post_id_fkey
    foreign key (blog_post_id) references public.blog_posts on delete set null;

alter table public.blog_posts
  add constraint blog_posts_featured_image_id_fkey
    foreign key (featured_image_id) references public.media_assets;

-- audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type public.audit_actor_type not null,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  outcome public.audit_outcome not null,
  correlation_id text,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_type, actor_id);

-- Storage bucket for public media
insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

-- Enable RLS ahead of policy creation (policies defined in lib/supabase/policies.sql)
alter table public.portfolio_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.blog_posts enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_logs enable row level security;
