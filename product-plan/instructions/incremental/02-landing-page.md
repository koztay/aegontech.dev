# Milestone 2: Landing Page

## Overview
Implement the public landing page with hero, services, portfolio preview, team, testimonials, and contact sections.

## What You're Receiving
- `LandingPage.tsx` — Main page orchestrator
- `HeroSection.tsx` — Full-screen hero with gradient overlays
- `ServicesSection.tsx` — Service cards with icons
- `PortfolioPreview.tsx` — Horizontal scroll featured projects
- `TeamSection.tsx` — Team member grid with photos
- `TestimonialsSection.tsx` — Client quotes grid
- `ContactSection.tsx` — Form with contact info cards

## What You Need to Build
- Supabase tables for content
- Data fetching hooks
- Form submission handling
- Navigation callbacks

## TDD Approach
Reference `sections/landing-page/tests.md` for test specifications.

## Database Schema
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT
);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_photo_url TEXT
);

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY "Public read" ON services FOR SELECT USING (true);
CREATE POLICY "Public read" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public read" ON testimonials FOR SELECT USING (true);

-- Public insert for contact
CREATE POLICY "Public insert" ON contact_submissions FOR INSERT WITH CHECK (true);
```

## Implementation

### Data Fetching
```typescript
// Fetch all landing page data in parallel
const [services, teamMembers, testimonials, featuredPortfolio] = await Promise.all([
  supabase.from('services').select('*').order('sort_order'),
  supabase.from('team_members').select('*'),
  supabase.from('testimonials').select('*'),
  supabase.from('portfolio_items').select('*').limit(4)
])
```

### Callbacks
- `onCtaClick` → Scroll to contact section or navigate to `/portfolio`
- `onViewAllPortfolio` → Navigate to `/portfolio`
- `onPortfolioItemClick` → Navigate to external URL
- `onTeamMemberClick` → Open modal with full bio (optional)
- `onContactSubmit` → Insert into `contact_submissions` table

### Hero Content
Hardcode or fetch from a `site_settings` table:
```typescript
const heroContent = {
  tagline: "Building Tomorrow's Software Today",
  description: "We craft innovative SaaS products and mobile applications...",
  ctaText: "Explore Our Work",
  ctaLink: "/portfolio",
  backgroundImage: "/images/hero-bg.jpg"
}
```

## Expected User Flows
1. Visitor lands on page → sees hero with animated gradient
2. Visitor clicks CTA → navigates to portfolio or scrolls to contact
3. Visitor scrolls → sees services, portfolio preview, team, testimonials
4. Visitor fills contact form → submits → sees success message
5. Visitor clicks "View All" on portfolio preview → navigates to `/portfolio`

## Done Checklist
- [ ] Hero section with gradient background and CTA
- [ ] Services grid with icon mapping
- [ ] Portfolio preview with horizontal scroll
- [ ] Team section with member cards
- [ ] Testimonials with quote styling
- [ ] Contact form submitting to Supabase
- [ ] Success/error states for form
- [ ] All navigation callbacks implemented
- [ ] Responsive across breakpoints
