# AEGONTECH LLC - Product Implementation Package

A complete handoff package for implementing the AEGONTECH LLC company website.

## Quick Start

1. **Review the product overview**: Start with `product-overview.md` to understand what you're building.

2. **Choose your implementation approach**:
   - **One-shot**: Use `prompts/one-shot-prompt.md` for a complete implementation in one session
   - **Incremental**: Use `prompts/section-prompt.md` and follow `instructions/incremental/` for milestone-based development

3. **Set up your project**:
   - Create a new Next.js or Vite project with React + TypeScript
   - Install dependencies: `lucide-react` for icons
   - Copy the design system tokens from `design-system/`

4. **Implement features**:
   - Start with foundation (design tokens, types, routing, shell)
   - Proceed section by section following the milestone instructions

## Package Contents

```
product-plan/
├── README.md                    # This file
├── product-overview.md          # Product description and features
├── prompts/
│   ├── one-shot-prompt.md       # Complete implementation prompt
│   └── section-prompt.md        # Section-by-section prompt template
├── instructions/
│   ├── one-shot-instructions.md # All milestones in one document
│   └── incremental/
│       ├── 01-foundation.md     # Design tokens, routing, shell
│       ├── 02-landing-page.md   # Public landing page
│       ├── 03-portfolio.md      # Portfolio grid page
│       ├── 04-blog.md           # Blog list and detail pages
│       └── 05-admin-panel.md    # Admin authentication and dashboard
├── design-system/
│   ├── colors.json              # Color palette tokens
│   └── typography.json          # Typography tokens
├── data-model/
│   └── data-model.md            # Entity definitions and relationships
├── shell/
│   ├── PublicShell.tsx          # Public site navigation shell
│   └── AdminShell.tsx           # Admin panel sidebar shell
└── sections/
    ├── landing-page/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   └── components/
    ├── portfolio/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   └── components/
    ├── blog/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   └── components/
    └── admin-panel/
        ├── README.md
        ├── tests.md
        ├── types.ts
        ├── sample-data.json
        └── components/
```

## Technology Recommendations

- **Framework**: Next.js 14+ (App Router) or Vite + React Router
- **Styling**: Tailwind CSS (components are pre-styled with Tailwind classes)
- **Icons**: Lucide React
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for screenshots and images)

## Implementation Notes

- Components are **props-based** and framework-agnostic
- All callbacks are optional (`onX?: () => void`) for flexibility
- Transform `@/...` imports to relative paths for your project structure
- Dark mode is supported via Tailwind's `dark:` prefix
- All components are responsive (mobile-first)

## TDD Approach

Each section includes a `tests.md` file with:
- User flow tests (success + failure paths)
- Empty state tests
- Component interaction tests
- Edge cases and sample test data

Adapt tests to your testing framework (Jest, Vitest, Playwright, etc.)
