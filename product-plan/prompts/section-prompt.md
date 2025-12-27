# AEGONTECH LLC - Section-by-Section Prompt Template

Use this template when implementing one section at a time.

---

## Prompt Template

You are implementing the **[SECTION_NAME]** section of the AEGONTECH LLC website.

I'm providing you with:
1. UI components (React + Tailwind CSS) — DO NOT restyle
2. TypeScript types for data and props
3. Sample data for testing
4. Test specifications

**Your task:**
1. Integrate the provided components into the app
2. Connect to Supabase for data fetching
3. Implement all callbacks and user interactions
4. Write tests following the test specifications
5. Ensure the section works with the shell/layout

**Files to reference:**
- `sections/[section-id]/components/` — UI components
- `sections/[section-id]/types.ts` — TypeScript interfaces
- `sections/[section-id]/sample-data.json` — Test data
- `sections/[section-id]/tests.md` — Test requirements

---

## Section Order

1. **01-foundation** — Design tokens, routing, shell layout
2. **02-landing-page** — Public landing page with all sections
3. **03-portfolio** — Portfolio grid page
4. **04-blog** — Blog list and detail pages
5. **05-admin-panel** — Login, dashboard, and management pages

For each section, copy the corresponding instruction file from `instructions/incremental/`.
