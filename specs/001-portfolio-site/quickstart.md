# quickstart.md — Portfolio & Blog Marketing Site

## Prerequisites
- Node.js 20+, pnpm, Next.js 15
- Postgres database (DATABASE_URL)
- MinIO or S3-compatible storage for media (MINIO_S3_ENDPOINT, MINIO_ADMIN_USER, MINIO_ADMIN_PASSWORD, MINIO_S3_BUCKET_NAME)
- browserless.io API key for screenshots
- Vercel CLI (optional for deploy)

## Setup
1) Install deps: `pnpm install`
2) Environment (frontend/.env.local):
```
DATABASE_URL=postgres://user:pass@host:5432/dbname
DATABASE_SSL=false
ADMIN_PASSWORD=...
# MINIO
MINIO_S3_ENDPOINT=https://minio.example.com
MINIO_ADMIN_USER=...
MINIO_ADMIN_PASSWORD=...
MINIO_S3_BUCKET_NAME=public-media
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
- Run SQL migrations in `frontend/supabase/migrations/` against your Postgres `DATABASE_URL`.
- Ensure the MinIO bucket named in `MINIO_S3_BUCKET_NAME` exists and is accessible by the app.
- Enforce admin-only writes where applicable and public reads on published rows.

### MinIO quick start
- Start a local MinIO (or point to hosted MinIO) and create bucket `public-media` (or your chosen name).
- Example env values (replace host/user/password):

```
MINIO_S3_ENDPOINT=https://minio.local:9000
MINIO_ADMIN_USER=minioadmin
MINIO_ADMIN_PASSWORD=minioadmin
MINIO_S3_BUCKET_NAME=public-media
```

Use the MinIO console URL in `MINIO_CONSOLE_URL` if helpful for administration.

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
