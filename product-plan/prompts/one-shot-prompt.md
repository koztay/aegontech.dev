# AEGONTECH LLC - One-Shot Implementation Prompt

Use this prompt with your coding agent to implement the complete AEGONTECH LLC website in one session.

---

## Prompt

You are building a complete company website for AEGONTECH LLC. I'm providing you with:

1. **UI Component Designs** — React components with complete styling (Tailwind CSS)
2. **TypeScript Types** — All data interfaces and component props
3. **Sample Data** — JSON data for testing and development
4. **Specifications** — User flows and requirements

**Your task is to:**
1. Set up the project (Next.js or Vite + React)
2. Implement Supabase integration (Auth, Database, Storage)
3. Wire up the UI components to real data
4. Implement all user flows and callbacks
5. Add proper routing and navigation
6. Ensure SEO and performance best practices

**What NOT to do:**
- Do NOT restyle the components — they are already designed
- Do NOT change the component interfaces — use the provided props

**Implementation order:**
1. Foundation (design tokens, types, routing, shell)
2. Landing Page (public home page)
3. Portfolio (public portfolio grid)
4. Blog (public blog list and detail)
5. Admin Panel (authentication and management)

Refer to `instructions/one-shot-instructions.md` for detailed requirements for each milestone.

---

Copy the contents of `instructions/one-shot-instructions.md` below when using this prompt.
