# quickstart.md — Portfolio & Blog Marketing Site

## Prerequisites
- Node.js 20+, pnpm, Next.js 15
- Supabase project (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) for Postgres and media storage (SUPABASE_STORAGE_BUCKET)
- browserless.io API key for screenshots
- Vercel CLI (optional for deploy)

## Environment (required)
- `SUPABASE_URL`: project URL. Needed at BUILD time too (`next build` fails without it: next/image host is derived from it) and at runtime.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, never expose to the browser.
- `SUPABASE_STORAGE_BUCKET`: public media bucket, `aegontech` (no default; the app throws if unset).
- `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL` as before. Set all of these in Vercel for Production/Preview.

## Setup
1) Install deps: `pnpm install`
2) Environment (frontend/.env.local):
```
SUPABASE_URL=https://your-project.supabase.example
SUPABASE_SERVICE_ROLE_KEY=...   # server-only
SUPABASE_STORAGE_BUCKET=aegontech
ADMIN_PASSWORD=...
BROWSERLESS_API_KEY=...
APP_STORE_LOOKUP_BASE=https://itunes.apple.com/lookup
```
3) Generate UI components (shadcn): `pnpm dlx shadcn-ui@latest init`
4) Dev server: `pnpm dev --hostname 0.0.0.0 --port 3000`

## Tests & QA
- Lint/typecheck: `pnpm lint`
- Unit/components (Vitest/RTL): `pnpm test:unit`
- E2E/contract (Playwright): `pnpm test:e2e`
- Production preview: `pnpm build && pnpm start --hostname 0.0.0.0 --port 3000`
- Lighthouse (writes frontend/tests/e2e/reports/lighthouse-home.json):
```
CI=true npx lighthouse http://localhost:3000 \
	--output=json \
	--output-path=tests/e2e/reports/lighthouse-home.json \
	--disable-storage-reset --preset=desktop \
	--emulated-form-factor=desktop \
	--throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=1 \
	--chrome-flags="--ignore-certificate-errors --no-sandbox"
```

## Migrations & DB
- Run SQL migrations in `frontend/supabase/migrations/` against your Supabase Postgres (psql or the SQL editor); `004_enable_rls.sql` enables RLS on every table (the site only uses the service-role key).
- Ensure the public Storage bucket named in `SUPABASE_STORAGE_BUCKET` exists (the upload route creates it if missing).
- Enforce admin-only writes where applicable and public reads on published rows.

## Ingestion
- Portfolio: POST /api/portfolio/ingest (Supabase JWT auth)
- Blog: POST /api/blog/ingest with header `x-api-key`

## Admin onboarding
- Issue Supabase admin role accounts for UI access.
- Rotate/create blog ingestion API keys; store hashed values in `api_keys` and distribute raw key via secure channel.
- Configure browserless API key server-side only.

## Deployment
- Deploy frontend to Vercel; set env vars above.
- Supabase hosts DB/Auth/Storage; keep service role key out of client bundle.
