# AEGONTECH LLC - Complete Implementation Instructions

This document contains all milestone instructions for implementing the complete AEGONTECH LLC website.

---

## Preamble

You are receiving:
- **UI Designs**: React components with Tailwind CSS styling
- **TypeScript Types**: Data interfaces and component props
- **Sample Data**: JSON data for testing
- **Specifications**: User flows and requirements

**Your task**: Build the backend, authentication, data layer, and routing while using the provided UI components.

**Guidelines**:
- DO NOT restyle the components — use them as-is
- Wire up all callbacks (onX props) to real functionality
- Use Supabase for auth, database, and storage
- Follow the milestone order for dependencies

---

## Milestone 1: Foundation

### Overview
Set up the project foundation including design tokens, TypeScript types, routing, and shell layout.

### Tasks
1. Create a new Next.js 14+ project with App Router (or Vite + React Router)
2. Install dependencies: `lucide-react`, `@supabase/supabase-js`
3. Configure Tailwind CSS with the design tokens from `design-system/`
4. Set up Supabase client
5. Create the route structure:
   - `/` — Landing Page
   - `/portfolio` — Portfolio Grid
   - `/blog` — Blog List
   - `/blog/[slug]` — Blog Detail
   - `/admin/login` — Admin Login (standalone, no shell)
   - `/admin` — Admin Dashboard
   - `/admin/portfolio` — Portfolio Management
   - `/admin/blog` — Blog Management
6. Integrate the `PublicShell` component for public pages
7. Integrate the `AdminShell` component for admin pages (after login)

### Design Tokens
```json
// colors.json
{
    "primary": "indigo",
    "secondary": "cyan",
    "neutral": "slate"
}

// typography.json
{
    "heading": "Inter",
    "body": "Inter",
    "mono": "JetBrains Mono"
}
```

### Done Checklist
- [ ] Project created with TypeScript
- [ ] Tailwind configured with design tokens
- [ ] Supabase client configured
- [ ] All routes created with placeholder content
- [ ] PublicShell wrapping public pages
- [ ] AdminShell wrapping admin pages

---

## Milestone 2: Landing Page

### Overview
Implement the public landing page with all sections: hero, services, portfolio preview, team, testimonials, and contact.

### Components
- `LandingPage` — Main page component
- `HeroSection` — Full-screen hero with CTA
- `ServicesSection` — Service cards grid
- `PortfolioPreview` — Featured projects horizontal scroll
- `TeamSection` — Team member cards
- `TestimonialsSection` — Client testimonials
- `ContactSection` — Contact form with info

### Supabase Tables
```sql
-- services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- team_members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT
);

-- testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_photo_url TEXT
);

-- contact_submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Implementation
1. Fetch services, team members, testimonials from Supabase
2. Wire `onContactSubmit` to insert into `contact_submissions`
3. Wire `onCtaClick` to scroll to contact section or navigate to portfolio
4. Wire `onViewAllPortfolio` to navigate to `/portfolio`

### Done Checklist
- [ ] All sections rendering with real data
- [ ] Contact form submitting to Supabase
- [ ] Navigation working (CTA, View All)
- [ ] Responsive on mobile/tablet/desktop

---

## Milestone 3: Portfolio

### Overview
Implement the portfolio grid page displaying all projects.

### Components
- `PortfolioGrid` — Page layout with grid
- `PortfolioCard` — Individual project card

### Supabase Tables
```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('saas', 'mobile')),
  screenshot TEXT NOT NULL,
  website_url TEXT,
  app_store_url TEXT,
  play_store_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Implementation
1. Fetch all portfolio items from Supabase
2. Transform data to match the component props (links object)
3. External links open in new tabs
4. Consider adding filtering by type (SaaS/Mobile)

### Done Checklist
- [ ] Portfolio grid rendering all items
- [ ] Type badges showing correctly
- [ ] External links working
- [ ] Responsive grid layout

---

## Milestone 4: Blog

### Overview
Implement the blog list and blog detail pages.

### Components
- `BlogList` — Blog posts grid
- `BlogCard` — Individual post card
- `BlogDetail` — Full post view

### Supabase Tables
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Optional: blog_tags join table for SEO
```

### n8n API Endpoint
Create an Edge Function or API route that n8n can POST to:
```typescript
// POST /api/blog/publish
{
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string // base64 or URL
}
```

### Implementation
1. Blog list fetches posts sorted by `published_at` DESC
2. Wire `onPostClick` to navigate to `/blog/[slug]`
3. Blog detail fetches post by slug
4. Wire `onBack` to navigate to `/blog`
5. Render markdown content (consider using `react-markdown`)

### Done Checklist
- [ ] Blog list showing published posts
- [ ] Blog detail rendering full content
- [ ] Navigation between list and detail
- [ ] n8n API endpoint functional

---

## Milestone 5: Admin Panel

### Overview
Implement authentication and admin management interfaces.

### Components
- `LoginForm` — Standalone login page
- `Dashboard` — Admin overview with stats
- `PortfolioList` — Portfolio CRUD table
- `AdminBlogList` — Blog CRUD table

### Authentication
1. Use Supabase Auth with email/password
2. Protect admin routes with middleware
3. Redirect unauthenticated users to `/admin/login`

### Implementation
1. Login form calls `supabase.auth.signInWithPassword()`
2. Dashboard fetches counts and recent items
3. Portfolio management: list, add, edit, delete
4. Blog management: list, add, edit, delete (including draft/publish status)
5. Logout clears session and redirects to login

### Admin Create/Edit Forms
Create modal or page-based forms for:
- Portfolio: title, description, type, screenshot (upload), URLs
- Blog: title, slug, excerpt, content (rich text), featured image

### Done Checklist
- [ ] Login working with Supabase Auth
- [ ] Protected routes redirecting
- [ ] Dashboard showing stats
- [ ] Portfolio CRUD working
- [ ] Blog CRUD working
- [ ] Logout working

---

## Final Verification

After completing all milestones:

1. **Test all user flows**:
   - Visitor browses landing page
   - Visitor views portfolio and clicks external links
   - Visitor reads blog posts
   - Visitor submits contact form
   - Admin logs in and manages content

2. **Test responsive design** on mobile, tablet, desktop

3. **Test dark mode** toggle

4. **Run Lighthouse** for performance and SEO

5. **Test n8n integration** with a sample blog post

---

## Database Schema Summary

```sql
-- Core tables
services (id, icon, title, description, sort_order)
team_members (id, name, role, bio, photo_url)
testimonials (id, quote, client_name, client_company, client_photo_url)
contact_submissions (id, name, email, message, created_at)
portfolio_items (id, title, description, type, screenshot, website_url, app_store_url, play_store_url, created_at)
blog_posts (id, title, slug, excerpt, content, featured_image, published_at, created_at)

-- Enable RLS on all tables
-- Public read access for: services, team_members, testimonials, portfolio_items, blog_posts (where published)
-- Authenticated write access for: all tables (admin only)
-- Insert access for: contact_submissions (public)
```
