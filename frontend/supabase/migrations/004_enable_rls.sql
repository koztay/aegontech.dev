-- Enable Row Level Security on every table. The site reads and writes only through the
-- server-side service-role key (which bypasses RLS); with RLS on and NO policies, the anon and
-- authenticated roles can neither read nor write anything through PostgREST.
-- Idempotent: enabling RLS on a table that already has it is a no-op.
-- (Already enabled on the target project right after the data restore; do not re-apply there.)
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.media_assets enable row level security;
