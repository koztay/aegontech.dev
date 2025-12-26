# Tasks: Portfolio & Blog Marketing Site

**Input**: Design documents from `/specs/001-portfolio-site/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included where mandated by constitution (ingestion/auth/SEO) and critical UX flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution alignment**: Include tasks for mobile-first performance/SEO budgets, automated portfolio/blog ingestion (screenshots, metadata, fallbacks), Supabase auth/API key protections, observability/alerting and synthetic checks, and structured content/versioning with rollback paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize `frontend/` with Next.js 15.x App Router, TypeScript, Tailwind, pnpm, and base App Router layout.
- [x] T002 [P] Add shadcn/ui setup and generate base components (button, card, dialog) in `frontend/components/ui/`.
- [x] T003 [P] Configure lint/format (ESLint, Prettier, Stylelint) and scripts in `frontend/package.json`.
- [x] T004 [P] Add environment samples for Supabase, browserless, and App Store lookup in `frontend/.env.example`.
- [x] T005 [P] Add CI-friendly scripts for build/test (`frontend/package.json`) and lock to latest dependencies (Next.js, React, supabase-js).

## Phase 2: Foundational (Blocking Prerequisites)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 Create Supabase migrations for schemas in `data-model.md` (portfolio_items, media_assets, blog_posts, api_keys, audit_logs) and storage bucket `public-media`.
- [x] T007 Implement RLS policies for admin writes and public read in `frontend/lib/supabase/policies.sql` and apply via migration.
- [x] T008 [P] Implement Supabase server/client utilities with service-role separation and API key hashing helpers in `frontend/lib/supabase/client.ts` and `frontend/lib/supabase/keys.ts`.
- [x] T009 [P] Implement ingestion helpers: browserless screenshot fetcher and App Store metadata fetcher with retry/timeout in `frontend/lib/ingestion/`.
- [x] T010 [P] Set up SEO/meta utilities for OG/Twitter/schema generation in `frontend/lib/seo/meta.ts`.
- [x] T011 [P] Configure global theming (Tailwind tokens, typography, spacing, color system) and base styles in `frontend/styles/globals.css` and `tailwind.config.js`.
- [x] T012 [P] Bootstrap test harness: Playwright config in `frontend/playwright.config.ts` and Vitest/RTL setup in `frontend/vitest.config.ts`.
- [x] T013 [P] Add structured logging utilities with correlation IDs and alert hook placeholders in `frontend/lib/observability/logging.ts`.
- [x] T014 [P] Create reusable cards/media components for portfolio/blog in `frontend/components/blocks/`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visitor sees hero and featured portfolio strip (Priority: P1) 🎯 MVP

**Goal**: Landing page shows a modern hero and an infinite horizontal strip of 3 featured portfolio items with smooth, accessible motion.

**Independent Test**: Playwright run loads home on mobile/desktop, verifies hero CTA, 3 featured items loop smoothly, keyboard/touch controls work, and reduced-motion preference is respected.

### Tests for User Story 1

- [x] T015 [P] Add Playwright e2e covering hero render, strip auto-loop, pause/prev/next controls in `frontend/tests/e2e/home-strip.spec.ts`.
- [x] T016 [P] Add component test for strip accessibility and reduced-motion handling in `frontend/tests/unit/portfolio-strip.spec.tsx`.

### Implementation for User Story 1

- [x] T017 [P] Implement Supabase featured items fetcher with fallback ordering in `frontend/lib/data/portfolio.ts`.
- [x] T018 [P] Build hero section with CTA and responsive layout in `frontend/components/sections/hero.tsx`.
- [x] T019 [P] Build portfolio card and badge variants in `frontend/components/blocks/portfolio-card.tsx`.
- [x] T020 Implement infinite, looping horizontal strip with accessible controls, touch/keyboard support, and reduced-motion guard in `frontend/components/sections/portfolio-strip.tsx`.
- [x] T021 Integrate hero + strip on marketing page `(marketing)/page.tsx` with data wiring and Suspense-friendly loading states.
- [x] T022 Add fallback state for <3 featured items with placeholders and admin prompt banner in `frontend/components/sections/portfolio-strip.tsx`.
- [x] T023 Add home SEO metadata (OG/Twitter, schema) and canonical handling in `(marketing)/page.tsx` via `lib/seo/meta.ts`.
- [x] T024 Optimize media (Next/Image, priority for hero, lazy for strip) and measure LCP/CLS budget via `frontend/tests/e2e/home-strip.spec.ts` performance assertions.

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Admin adds/curates portfolio items via URL (Priority: P2)

**Goal**: Admin can ingest portfolio items from web/App Store URLs with auto metadata/screenshot, dedupe, overrides, and featured ordering.

**Independent Test**: Playwright admin flow creates a new item from web URL and App Store URL, sees auto metadata + screenshot, applies overrides, sets featured flag, and verifies appearance in list and homepage strip.

### Tests for User Story 2

- [x] T025 [P] Add contract test for `/api/portfolio/ingest` covering dedupe/idempotency and failure to fetch screenshot in `frontend/tests/contract/portfolio-ingest.spec.ts`.
- [x] T026 [P] Add Playwright admin flow test for create/edit/feature ordering in `frontend/tests/e2e/admin-portfolio.spec.ts`.

### Implementation for User Story 2

- [x] T027 Implement `/api/portfolio/ingest/route.ts` with Supabase service-role, source URL dedupe, idempotency, metadata + screenshot capture, needs_attention status on partial failures, and audit logging.
- [x] T028 Wire storage uploads for screenshots/artwork with checksum and alt text in `frontend/lib/ingestion/media.ts`.
- [x] T029 Build admin UI page for ingesting/editing items with overrides, featured toggle, and order_rank control in `frontend/app/(marketing)/admin/portfolio/page.tsx`.
- [x] T030 Add ingestion status display (success/retry/failed) and manual retry action in `frontend/app/(marketing)/admin/portfolio/page.tsx`.
- [x] T031 Enforce RLS/role check for admin routes and Supabase client usage in `frontend/lib/supabase/admin-session.ts`.
- [x] T032 Add audit log writes for admin mutations in `frontend/lib/observability/audit.ts`.
- [x] T033 Add OG/SEO metadata for portfolio detail pages and pre-render strategy in `frontend/app/portfolio/[slug]/page.tsx`.

**Checkpoint**: User Stories 1 AND 2 are functional and independently testable

---

## Phase 5: User Story 3 - Blog ingestion via secure API (Priority: P3)

**Goal**: n8n posts blog content via API key; posts auto-publish on valid payloads with images stored and rich SEO output.

**Independent Test**: Contract test posts a valid payload (with images), gets 200, and rendered blog page shows featured/inline images with schema metadata; invalid key rejected with 401 and no writes.

### Tests for User Story 3

- [x] T034 [P] Add contract test for `/api/blog/ingest` covering auth, validation, slug uniqueness, and oversized image rejection in `frontend/tests/contract/blog-ingest.spec.ts`.
 - [x] T035 [P] Add rendering test for blog page SEO/schema and image placement in `frontend/tests/e2e/blog-render.spec.ts`.
- [x] T036 Implement `/api/blog/ingest/route.ts` with x-api-key validation, payload validation, slug uniqueness, image uploads, auto-publish on success, and audit logging.
 - [x] T036 Implement `/api/blog/ingest/route.ts` with x-api-key validation, payload validation, slug uniqueness, image uploads, auto-publish on success, retry-once for metadata/image fetch failures with placeholders, needs_attention marking, and audit logging.
- [x] T037 Add per-key rate limiting and correlation IDs for blog ingestion in `frontend/lib/observability/rate-limit.ts`.
 - [x] T038 Implement blog page rendering with responsive typography and inline media support in `frontend/app/blog/[slug]/page.tsx`.
 - [x] T039 Add blog index/listing with pagination and tag filters in `frontend/app/blog/page.tsx`.
 - [x] T040 Add SEO/schema metadata for blog posts and index via `frontend/lib/seo/meta.ts`.

**Checkpoint**: All user stories independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T041 [P] Run Lighthouse + accessibility audits; fix performance/contrast/LCP/CLS issues and document results in `frontend/tests/e2e/reports/`.
- [X] T042 [P] Add synthetic health checks for strip data freshness and ingestion failure alert (>2%/15m) in `frontend/lib/observability/synthetic.ts`.
- [X] T043 [P] Add versioning/rollback helpers for portfolio/blog records in `frontend/lib/data/versioning.ts`.
- [x] T044 [P] Harden security headers and caching (Next.js middleware) in `frontend/middleware.ts`.
- [X] T045 Update `quickstart.md` with final envs, commands, and admin onboarding steps.

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → Polish.
- US1 depends on Foundational; US2 depends on Foundational and benefits from US1 visuals but is functionally independent; US3 depends on Foundational only.

## Parallel Opportunities

- Setup: T002–T005 can run in parallel after T001.
- Foundational: T008–T014 largely parallel once T006/T007 complete.
- US1: T015–T019 can run in parallel; T020–T024 follow data/component availability.
- US2: T025/T026 in parallel; T027–T030 in parallel after foundational ingestion helpers; T031–T033 can follow API route.
- US3: T034/T035 in parallel; T036–T040 in parallel after ingestion utilities.
- Polish tasks T041–T045 can run after all stories are code-complete.

## Implementation Strategy

- MVP first: deliver US1 after Setup/Foundational to hit hero + strip experience.
- Incremental: add US2 (admin ingestion) next to keep featured strip fresh; add US3 (blog ingestion) last.
- Performance/SEO: enforce budgets during US1 and retest in Polish.
- Security: keep API keys server-side, RLS enforced; rate limit ingestion endpoints.
