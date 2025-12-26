<!--
Sync Impact Report
- Version: 0.0.0 → 1.0.0
- Modified principles: defined P1–P5 (new from template)
- Added sections: Stack & Delivery Constraints; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates: .specify/templates/plan-template.md ✅; .specify/templates/spec-template.md ✅; .specify/templates/tasks-template.md ✅
- Follow-up TODOs: None
-->

# Aegontech.dev Constitution

## Core Principles

### Experience-First Delivery (Mobile + SEO)
- Non-negotiable: mobile-first layouts, fast hero interactions, purposeful animations, and accessible contrast and text alternatives for all media.
- Performance budgets: Lighthouse scores ≥90 on mobile and desktop, LCP ≤2.5s, CLS <0.1 on marketing, portfolio, and blog pages.
- SEO essentials: schema.org metadata, Open Graph/Twitter tags, canonical URLs, and human-readable slugs on all public pages.

### Automated Content Acquisition (Portfolio + Blog)
- Portfolio entries must auto-capture screenshots and metadata from provided web URLs or App Store links; provide deterministic fallbacks and manual override fields.
- Blog posts are ingested via secured API from n8n flows; all featured/inline images are uploaded to site storage with canonical references recorded.
- Deduplicate inputs by source URL, preserve traceability to origin, and block publication when automation fails integrity checks.

### Secure Admin & API Control
- Admin panel access is gated by Supabase Auth with role-based permissions; no public write paths to portfolio or blog data.
- Blog ingestion uses server-stored API keys and rate limits; keys are rotated and never exposed to clients.
- All content uploads and mutations are audited with user, source, timestamp, and IP; file uploads are scanned and size-limited.

### Observability & Testing for Content Pipelines
- Structured logging for ingestion, screenshotting, storage, and publish steps; alerts fire when failure rate exceeds 2% over 15 minutes.
- Contract and integration tests cover portfolio/blog ingestion, Supabase access control, and SEO metadata generation before release.
- Synthetic checks run daily to verify screenshot freshness, metadata completeness, and public page health.

### Structured Content & Reuse
- Supabase is the single source of truth for portfolio items, blog posts, media assets, and SEO metadata; fields are normalized and versioned with rollback support.
- Every media asset records alt text, caption, and source; OG/preview images are generated or selected consistently.
- Content changes track author and changelog notes; migrations include backfill plans to avoid broken references.

## Stack & Delivery Constraints
- Backend: Supabase for auth, database, storage, and edge functions; MCP Supabase server is the default interface for schema and auth changes.
- Admin: Protected dashboard to manage portfolio entries, blog posts, media overrides, and ingestion retries; no direct DB writes outside Supabase policies.
- Portfolio ingestion: Screenshot service must respect robots policies and timeout limits; fall back to last-good snapshot when capture fails.
- Blog ingestion API: Accepts authenticated POSTs with content, metadata, and images; enforces size limits, MIME validation, and idempotency keys per post.
- Frontend: Modern, elegant marketing site with responsive hero sections, scroll/entrance animations, and excellent mobile ergonomics; SSR/SSG chosen to maximize SEO.

## Development Workflow & Quality Gates
- Design and plan documents must declare performance budgets, accessibility targets, and required animations for each page type.
- Every feature plan enumerates portfolio/blog ingestion paths, failure handling, and required manual override fields.
- PRs must include tests for ingestion and auth-critical flows, updated Supabase migrations, and SEO/metadata assertions where applicable.
- Release readiness requires passing Lighthouse thresholds, accessibility checks, and synthetic ingestion runs in staging before production deploy.
- Secrets (API keys) are stored server-side only; configs document rotation cadence and storage location.

## Governance
- This constitution supersedes other practice guides for the marketing/portfolio site; conflicts must be escalated and resolved before merge.
- Amendments require a written proposal, impact assessment on ingestion/security/SEO, migration or rollout plan, and approval from project maintainers.
- Versioning follows SemVer for governance: MAJOR for breaking principle changes or removals; MINOR for new principles/sections; PATCH for clarifications.
- Compliance: Each PR reviewer confirms constitution alignment; monthly reviews validate observability alerts, auth posture, and ingestion health.

**Version**: 1.0.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-25
