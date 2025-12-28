# Feature Specification: Portfolio & Blog Marketing Site

**Feature Branch**: `001-portfolio-site`  
**Created**: 2025-12-25  
**Status**: Draft  
**Input**: User description: "Build a web page for a software development company focused on SaaS and mobile apps, with automated portfolio ingestion (web + App Store), an admin panel, blog ingestion via API/n8n, modern SEO/UX, and a landing strip showing 3 portfolio items in infinite horizontal scroll."

## Clarifications

### Session 2025-12-28
- Q: Should images be deleted from storage when a Portfolio/Blog item is deleted, or only unlinked? → A: Delete images from storage when a Portfolio/Blog item is deleted.

### Session 2025-12-25
- Q: Should blog submissions from n8n auto-publish when validation passes, or require manual review? → A: Auto-publish all valid blog submissions from n8n if validation passes.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Visitor sees hero and featured portfolio strip (Priority: P1)

A prospective client lands on the homepage, sees a modern hero with clear positioning, and immediately views a horizontally scrolling strip of 3 featured portfolio items (auto-sourced) that loops infinitely and is responsive on mobile.

**Why this priority**: Establishes credibility and showcases capability on first impression; delivers value even without admin tooling.

**Independent Test**: Open the homepage on mobile and desktop; verify hero renders quickly, portfolio strip shows 3 items looping infinitely with accessible controls/auto-scroll, and all items include title, type (web/mobile), and actionable link.

**Acceptance Scenarios**:

1. **Given** the site is published with at least 3 featured portfolio entries, **When** a visitor opens the homepage, **Then** they see a hero section with CTA and a looping horizontal strip showing exactly 3 items with titles, tags (web/app), and live links.
2. **Given** the visitor is on mobile, **When** the strip auto-scrolls, **Then** the interaction remains smooth (no jank), can be paused via user interaction (swipe/tap), and preserves focus/ARIA for accessibility.


Constitution alignment: All requirements below are explicit and testable, including:
- Mobile-first/SEO performance budgets (Lighthouse, LCP/CLS)
- Automated portfolio/blog ingestion (screenshots, metadata, fallbacks)
- Supabase auth/API key constraints for admin/blog writes
- Observability: structured logging for all ingestion, mutation, and publish steps; audit logs for all admin and blog write actions; synthetic health checks for screenshot freshness, metadata completeness, and public page health; alerting when ingestion failure rate exceeds 2% over 15 minutes
- Structured content fields (SEO metadata, alt text, versioning/rollback)
**Why this priority**: Keeps the portfolio fresh with minimal effort; necessary to sustain the homepage strip with accurate content.

**Independent Test**: From admin panel, submit a new entry with a web URL and an App Store URL; verify auto metadata + screenshot are pulled, overrides save, and the entry appears in the portfolio list and (if marked featured) in the homepage strip.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they submit a web URL, **Then** the system fetches title/description/OG image, captures a screenshot, stores both, and shows them for confirmation with edit fields before publishing.
2. **Given** an admin submits an App Store URL, **When** ingestion runs, **Then** the system pulls the store artwork, app name, category, ratings summary, and creates a portfolio entry; if artwork fetch fails, a fallback placeholder is used and a retry option is offered.
3. **Given** a URL already exists, **When** an admin tries to add it again, **Then** the system prevents duplicate creation and surfaces the existing entry with an option to update fields.

---

### User Story 3 - Blog ingestion via secure API (Priority: P3)

An automation (n8n) posts blog content, metadata, and images to a secure API using an API key; the blog renders on the site with SEO-rich metadata, featured image, inline images, and mobile-friendly reading experience.

**Why this priority**: Enables ongoing content marketing with minimal manual effort, improving SEO and lead generation.

**Independent Test**: Send a POST from n8n with a blog payload (title, body with inline images, featured image URL/uploads, tags, slug); verify the post is stored, images are uploaded to site storage, and the blog page displays correctly with schema metadata.

**Acceptance Scenarios**:

1. **Given** a valid API key and blog payload, **When** n8n submits to the blog endpoint, **Then** the system stores the post, uploads all images, enforces slug uniqueness, and auto-publishes immediately after validation with no review queue.
2. **Given** an invalid or missing API key, **When** a request is made, **Then** the system rejects it with 401/403, logs the attempt, and no content is stored.
3. **Given** images exceed size/type limits, **When** the request is processed, **Then** the system rejects or strips offending assets, logs the issue, and responds with validation errors without partial publish.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases
- When a Portfolio or Blog item is deleted, all associated images are also deleted from storage to prevent orphaned files and reduce storage costs.

- Screenshot capture times out or site blocks the crawler; system retries once, stores last-known-good screenshot if available, and flags the item for manual upload.
- App Store metadata fetch fails or artwork missing; show placeholder artwork, keep entry in draft, and allow manual image upload.
- Duplicate source URLs submitted; enforce idempotency and surface existing record for edit instead of creating a new one.
- Blog ingestion with mismatched inline image references; respond with validation errors and do not publish until all assets are resolvable.
- Horizontal strip has fewer than 3 published featured items; fall back to available items without breaking layout and prompt admin to add more.
- API key rotated; old keys expire immediately and produce 401 without leaking reason.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

> Constitution alignment: capture mobile-first/SEO performance budgets (Lighthouse, LCP/CLS), automated portfolio/blog ingestion behavior (screenshots, metadata, fallbacks), Supabase auth/API key constraints for admin/blog writes, observability/alerting needs, and structured content fields (SEO metadata, alt text, versioning/rollback).


### Functional Requirements

- **FR-001**: Homepage must present a hero section with CTA and an infinite horizontal strip showing exactly 3 featured portfolio items pulled from Supabase, with smooth auto-scroll and keyboard/touch controls.
- **FR-002**: Portfolio entries must be created from either web URLs or App Store URLs, automatically fetching metadata (title, summary, category/tags) and a cover image (screenshot or store artwork) within 15 seconds.
- **FR-003**: Admins must be able to override auto-fetched metadata and upload replacement images before publishing; overrides are stored alongside source metadata for traceability.
- **FR-004**: Duplicate submissions (same source URL) must be rejected or routed to an update flow to prevent multiple records; idempotency keys based on source URL are required.
- **FR-005**: Portfolio items must support a "featured" flag; only featured items appear in the homepage strip, with stable ordering defined in admin using `order_rank`.
- **FR-006**: Blog ingestion API must accept authenticated POST requests with title, slug, summary, body (rich text/HTML/MD), tags, featured image, inline images, and publication status; all images are stored in site storage with canonical URLs. Valid submissions auto-publish immediately after validation; invalid payloads are rejected with no partial writes.
- **FR-007**: API requests must be authorized via server-stored API keys with rotation support; invalid keys are rejected without side effects and attempts are audited.
- **FR-008**: Supabase Auth must gate admin panel access with role-based permissions for portfolio and blog management; no unauthenticated writes are permitted.
- **FR-009**: All public pages (home, portfolio detail, blog posts) must emit SEO metadata (title, description, canonical, OG/Twitter tags, schema.org) and readable slugs.
- **FR-010**: Performance budgets: Lighthouse ≥90 (mobile/desktop) on home/portfolio/blog, LCP ≤2.5s, CLS <0.1, TTI ≤4s on 4G; strip animation must not drop below 55fps on modern mobile.
- **FR-011**: Accessibility: all media must include alt text; horizontal strip must be operable via keyboard and provide pause/previous/next controls; color contrast meets WCAG AA.
- **FR-012**: Observability: All ingestion steps (metadata fetch, screenshot, uploads), admin actions, and blog API calls must be logged with correlation IDs; synthetic health checks must run daily for screenshot freshness, metadata completeness, and public page health; alerts must trigger when ingestion failure rate >2% over 15 minutes; all logs must be auditable.
- **FR-013**: Resilience: When screenshot or metadata fetch fails, the system retries once, applies placeholders, and marks the record as "needs_attention" without blocking other entries.
- **FR-014**: Versioning: Content changes (portfolio/blog) must record author, timestamp, and change summary with ability to restore the last version; versioning/rollback must be testable and mapped to acceptance criteria.
- **FR-015**: Admin UI must surface ingestion status (success, retry, failed) and allow manual retry for screenshot/metadata pulls, with explicit acceptance criteria and test mapping.

### Key Entities *(include if feature involves data)*

- **PortfolioItem**: source_url, type (web/app), title, summary, tags, featured_flag, status (draft/published), order, hero_link, metadata_snapshot, version info, created_by.
- **MediaAsset**: storage_path, alt_text, caption, source (capture/app_store/upload), associated_entity_id, mime, size, checksum, created_by.
- **BlogPost**: title, slug, summary, body, tags, featured_image_id, inline_media_ids, status, published_at, source (n8n/api), api_key_id, version info.
- **AdminUser**: auth_id (Supabase), roles/permissions, last_login, audit trail for mutations.
- **ApiKey**: key_id, hashed_key, scope (blog ingestion), status (active/rotated/revoked), created_by, last_used_at, rate_limit_window.
- **AuditLog**: actor (user/key), action, entity_type/id, timestamp, ip, user_agent, correlation_id, outcome.

### Assumptions & Dependencies

- Supabase MCP server is available for auth, database, storage, and schema management.
- A screenshot/metadata capture service can reach public URLs and App Store pages within allowed timeouts.
- n8n is configured to call the blog API with valid API keys and to upload referenced images.
- At least 3 portfolio items will be seeded/featured for the homepage strip at launch.
- Brand assets (logo, palette, typography choices) will be provided to style the hero and portfolio strip.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->


### Measurable Outcomes

- **SC-001**: Homepage LCP ≤2.5s and CLS <0.1 on mobile and desktop; Lighthouse performance score ≥90 for home/portfolio/blog pages.
- **SC-002**: Portfolio strip renders 3 featured items and begins smooth auto-scroll within 1s of initial paint; animation maintains ≥55fps on modern mobile devices.
- **SC-003**: 95% of portfolio ingestions (web or App Store) complete successfully on first attempt within 15 seconds; failed ingestions are flagged with retry available.
- **SC-004**: 100% of published pages (home, portfolio detail, blog posts) include valid schema.org and OG/Twitter metadata with unique, human-readable slugs.
- **SC-005**: Blog API rejects 100% of requests without a valid API key; valid requests store posts with all referenced images resolved and return success within 5 seconds for payloads ≤2MB.
- **SC-006**: Accessibility checks: 0 critical WCAG violations on home/portfolio/blog; all images have alt text and strip is keyboard operable with pause/next/prev controls.
- **SC-007**: Admin workflow: creating and publishing a portfolio item via URL (including override edits) completes in ≤3 minutes end-to-end in staging.
- **SC-008**: Observability: Ingestion failure alert triggers when 3 or more failures occur within 15 minutes; audit logs are captured for 100% of admin and blog write actions; synthetic health checks for screenshot freshness, metadata completeness, and public page health run daily and are testable.
