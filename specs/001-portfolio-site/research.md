# research.md — Portfolio & Blog Marketing Site

## Decisions & Rationale

### Screenshot capture for portfolio URLs
- Decision: Use browserless Playwright API for deterministic screenshots; 1 retry, then store last-good or placeholder.
- Rationale: Reliable headless Chromium without managing infra; supports custom viewport; fast to integrate.
- Alternatives: Self-hosted Playwright in Supabase Edge Functions (more ops) or thumbor-like services (less control over auth/headers).

### App Store metadata ingestion
- Decision: Use iTunes Search/Lookup API to fetch app name, artwork, category, rating summary; store artwork in Supabase Storage.
- Rationale: Official Apple endpoint, stable JSON, avoids brittle scraping.
- Alternatives: Third-party scraping APIs (less reliable, potential TOS risk) or manual entry only (higher admin effort).

### Frontend delivery, SEO, and performance
- Decision: Next.js 14 App Router with static/ISR for marketing pages; optimize images via Next/Image; Tailwind + shadcn/ui; prefers-reduced-motion respected for strip animation.
- Rationale: Strong SEO defaults, fast DX, good tree-shaking and image/CDN support; aligns with constitution mobile/SEO goals.
- Alternatives: Gatsby (heavier plugin surface) or pure SPA (worse SEO without SSR/SSG).

### Blog ingestion security and publishing
- Decision: API key header (`x-api-key`) checked server-side against hashed keys in Supabase; valid payloads auto-publish; invalid rejected with no partial writes; rate limit per key.
- Rationale: Matches clarification (auto-publish) while keeping backend-only secrets and auditability.
- Alternatives: OAuth client credentials (overkill) or manual publish-only (slower throughput).

### Storage and media handling
- Decision: Supabase Storage public bucket with hashed paths; alt text required; store checksums; enforce MIME/size limits; CDN cached.
- Rationale: Simple path-based delivery, CDN-backed; checksum aids dedupe; aligns with accessibility/observability needs.
- Alternatives: Private bucket with signed URLs (higher complexity, not needed for public marketing assets).

### Observability and alerts
- Decision: Structured logs per ingestion step with correlation IDs; alert when failure rate >2% over 15 minutes; synthetic daily check for strip and metadata completeness.
- Rationale: Meets constitution observability gate; keeps ingestion health visible.
- Alternatives: Basic server logs only (insufficient signal) or tracing-first (overkill for scope).
