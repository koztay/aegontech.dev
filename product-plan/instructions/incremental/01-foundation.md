# Milestone 1: Foundation

## Overview
Set up the project foundation including design tokens, TypeScript types, routing, and shell layout.

## What You're Receiving
- Design tokens (colors, typography)
- Shell components (PublicShell, AdminShell)
- Type definitions for all sections

## What You Need to Build
- Project scaffolding
- Supabase client configuration
- Route structure
- Layout wrappers

## Tasks

### 1. Project Setup
```bash
npx create-next-app@latest aegontech --typescript --tailwind --app --src-dir
cd aegontech
npm install lucide-react @supabase/supabase-js
```

### 2. Design Tokens
Configure Tailwind with the design tokens:
- Primary: Indigo (indigo-600, indigo-500, etc.)
- Secondary: Cyan
- Neutral: Slate
- Fonts: Inter (heading/body), JetBrains Mono (mono)

### 3. Supabase Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 4. Route Structure
```
app/
├── layout.tsx           # Root layout with fonts
├── page.tsx             # Landing page (/)
├── portfolio/
│   └── page.tsx         # Portfolio grid
├── blog/
│   ├── page.tsx         # Blog list
│   └── [slug]/
│       └── page.tsx     # Blog detail
└── admin/
    ├── login/
    │   └── page.tsx     # Login (no shell)
    ├── layout.tsx       # Admin shell wrapper
    ├── page.tsx         # Dashboard
    ├── portfolio/
    │   └── page.tsx     # Portfolio management
    └── blog/
        └── page.tsx     # Blog management
```

### 5. Shell Integration
- Public pages use `PublicShell` with navigation items: Home, Portfolio, Blog, Contact
- Admin pages use `AdminShell` with navigation items: Dashboard, Portfolio, Blog Posts, Settings
- Login page renders standalone (no shell)

## Done Checklist
- [ ] Next.js project created with TypeScript
- [ ] Tailwind configured with design tokens
- [ ] Inter and JetBrains Mono fonts loaded
- [ ] Supabase client configured
- [ ] All routes created with placeholder content
- [ ] PublicShell wrapping public pages
- [ ] AdminShell wrapping admin pages (except login)
- [ ] Dark mode toggle working in PublicShell
