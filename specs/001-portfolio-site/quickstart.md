# quickstart.md — Portfolio & Blog Marketing Site

## Prerequisites
- Node.js 20+, pnpm, Next.js 15
- Supabase project (URL, anon key, service role key)
- browserless.io API key for screenshots
- Vercel CLI (optional for deploy)

## Setup
1) Install deps: `pnpm install`
2) Environment (frontend/.env.local):
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
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
- Create tables/policies per data-model.md; ensure bucket `public-media` exists.
- Enforce admin-only writes (RLS) and public reads on published rows.

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
