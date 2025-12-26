-- RLS policies for portfolio/blog tables
-- Assumes helper function public.is_admin() exists (created in migrations)

-- portfolio_items
create policy if not exists "Public read published portfolio" on public.portfolio_items
for select using (status = 'published');

create policy if not exists "Admin manage portfolio" on public.portfolio_items
for all using (auth.uid() is not null and public.is_admin())
with check (auth.uid() is not null and public.is_admin());

-- media_assets
create policy if not exists "Public read published media" on public.media_assets
for select using (
	portfolio_item_id in (
		select id from public.portfolio_items where status = 'published'
	)
	or blog_post_id in (
		select id from public.blog_posts where status = 'published'
	)
);

create policy if not exists "Admin manage media" on public.media_assets
for all using (auth.uid() is not null and public.is_admin())
with check (auth.uid() is not null and public.is_admin());

-- blog_posts
create policy if not exists "Public read published blog" on public.blog_posts
for select using (status = 'published');

create policy if not exists "Admin manage blog" on public.blog_posts
for all using (auth.uid() is not null and public.is_admin())
with check (auth.uid() is not null and public.is_admin());

-- api_keys
create policy if not exists "Admin manage api_keys" on public.api_keys
for all using (auth.uid() is not null and public.is_admin())
with check (auth.uid() is not null and public.is_admin());

-- audit_logs
create policy if not exists "Admin read audit logs" on public.audit_logs
for select using (auth.uid() is not null and public.is_admin());

create policy if not exists "Admin or service write audit logs" on public.audit_logs
for insert using (
	(auth.role() = 'service_role') or (auth.uid() is not null and public.is_admin())
)
with check (
	(auth.role() = 'service_role') or (auth.uid() is not null and public.is_admin())
);