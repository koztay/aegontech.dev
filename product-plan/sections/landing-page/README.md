# Landing Page Section

The public landing page for AEGONTECH LLC featuring:
- Hero section with gradient background and CTA
- Services grid with icon cards
- Featured portfolio horizontal scroll
- Team member cards
- Client testimonials
- Contact form with info cards

## Components

| Component | Description |
|-----------|-------------|
| `LandingPage.tsx` | Main page orchestrator |
| `HeroSection.tsx` | Full-screen hero with animated gradients |
| `ServicesSection.tsx` | Service cards with icon mapping |
| `PortfolioPreview.tsx` | Horizontal scroll featured projects |
| `TeamSection.tsx` | Team member grid with photos |
| `TestimonialsSection.tsx` | Client quotes in grid |
| `ContactSection.tsx` | Form with contact info cards |

## Props

See `types.ts` for complete TypeScript interfaces.

Main props:
- `heroContent` — Tagline, description, CTA text/link
- `services` — Array of service cards
- `teamMembers` — Array of team member profiles
- `testimonials` — Array of client quotes
- `featuredPortfolioItems` — Array of featured projects
- `contactInfo` — Address, email, phone, map URL

## Sample Data

See `sample-data.json` for realistic test data.

## Integration Notes

- Hero uses `@unsplash` placeholder image — replace with actual asset
- Icon mapping uses Lucide React icons (code, smartphone, cloud, palette, server)
- Contact form has local state for submission loading/success
- Portfolio preview duplicates items for infinite scroll effect
