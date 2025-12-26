# Implementation Plan: Portfolio & Blog Marketing Site

**Branch**: `001-portfolio-site` | **Date**: 2025-12-25 | **Spec**: [specs/001-portfolio-site/spec.md](specs/001-portfolio-site/spec.md)
**Input**: Feature specification from `/specs/001-portfolio-site/spec.md`

## Summary

Modern marketing site for a SaaS/mobile-focused studio: hero + infinite 3-item portfolio strip on the landing page, admin-driven portfolio ingestion from web/App Store URLs with auto metadata/screenshot and overrides, blog ingestion via API key from n8n with auto-publish on valid payloads, all backed by Supabase for auth, DB, and storage. Frontend uses Next.js App Router (TS), Tailwind, and shadcn/ui with strong SEO, accessibility, and performance budgets.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router) on Node 20
**Primary Dependencies**: Next.js, Tailwind CSS, shadcn/ui, Supabase JS client, Supabase Auth, Supabase Storage, browserless Playwright API (screenshots), itunes lookup API (App Store metadata)
**Storage**: Supabase Postgres + Supabase Storage (public bucket for media with hashed paths)
**Testing**: Playwright for e2e/strip UX + API contract tests; Vitest/React Testing Library for components
**Target Platform**: Vercel (frontend) + Supabase (auth, DB, storage, edge functions if needed)
**Project Type**: web (Next.js app)
**Performance Goals**: Lighthouse ≥90 mobile/desktop; LCP ≤2.5s; CLS <0.1; strip ≥55fps on modern mobile
**Constraints**: API key–protected blog ingestion; no unauthenticated writes; alt text required for all media; animation respects prefers-reduced-motion; ingestion retries once then flags item
**Scale/Scope**: Marketing site + admin; small team, low-medium traffic; ingestion concurrency modest (dozens/day)

## Constitution Check

- Experience: Mobile-first Next.js App Router, hero + animated strip defined; performance/accessibility budgets included.
- Automation: Portfolio/blog ingestion paths defined; screenshot + metadata services chosen with retry/placeholder behavior; manual overrides included.
- Security: Supabase Auth roles for admin; API key storage/rotation for blog ingestion; no public writes; audit logging required.
- Observability: Contract/integration tests planned; structured logging for ingestion; alert on >2% failures/15m; synthetic strip/metadata checks planned.
- Data model: Supabase schemas for portfolio, media, blog, API keys, audit/version info captured; migrations/backfill expected.

## Project Structure

### Documentation (this feature)

```text
specs/001-portfolio-site/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/                # Next.js app (single project layout)
├── app/
│   ├── (marketing)/page.tsx           # Hero + portfolio strip
│   ├── portfolio/[slug]/page.tsx      # Optional detail pages
│   ├── blog/[slug]/page.tsx           # Blog post rendering
│   └── api/
│       ├── blog/ingest/route.ts       # API-key blog ingestion
│       └── portfolio/ingest/route.ts  # Authenticated admin ingestion
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── sections/                      # Hero, portfolio strip, blog list
│   └── blocks/                        # Reusable cards, layout
├── lib/
│   ├── supabase/                      # Supabase client/server utils
│   ├── ingestion/                     # screenshot + metadata helpers
│   └── seo/                           # metadata builders
├── styles/
│   └── globals.css
├── public/
│   └── assets/
└── tests/
    ├── e2e/                           # Playwright
    ├── contract/                      # API contract tests
    └── unit/                          # Component/unit tests
```

**Structure Decision**: Single Next.js project (frontend/) with app router and colocated API routes for ingestion; Supabase used for data/auth/storage; tests split by e2e/contract/unit.

## Complexity Tracking

No additional complexity beyond constitution requirements; no deviations to justify.
