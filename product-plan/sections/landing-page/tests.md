# Landing Page Tests

## User Flow Tests

### Success Paths

1. **Hero CTA Click**
   - Given: User is on landing page
   - When: User clicks the CTA button
   - Then: `onCtaClick` callback is invoked
   - Expected: Navigate to portfolio or scroll to contact

2. **View All Portfolio**
   - Given: User is viewing portfolio preview section
   - When: User clicks "View All"
   - Then: `onViewAllPortfolio` callback is invoked
   - Expected: Navigate to `/portfolio`

3. **Contact Form Submission**
   - Given: User has filled in name, email, message
   - When: User clicks "Send Message"
   - Then: Loading state shown → `onContactSubmit` called → Success message displayed
   - Expected: Form resets, success toast/message for 5 seconds

4. **Team Member Click**
   - Given: User is viewing team section
   - When: User clicks a team member
   - Then: `onTeamMemberClick` callback invoked with member ID
   - Expected: Show bio modal or expand details

### Failure Paths

5. **Contact Form Validation**
   - Given: User submits form with empty fields
   - When: Required field validation triggers
   - Then: Form does not submit, field errors shown

6. **Contact Form Error**
   - Given: Backend returns error on submission
   - When: `onContactSubmit` fails
   - Then: Error message displayed, form remains populated

## Empty State Tests

7. **No Services**
   - Given: Empty services array
   - Then: Services section should handle gracefully (hide or show placeholder)

8. **No Team Members**
   - Given: Empty team members array
   - Then: Team section should hide or show placeholder

9. **No Testimonials**
   - Given: Empty testimonials array
   - Then: Testimonials section should hide or show placeholder

10. **No Featured Portfolio**
    - Given: Empty featured portfolio array
    - Then: Portfolio preview should hide or show placeholder

## Component Interaction Tests

11. **Horizontal Scroll**
    - Given: Portfolio preview with items
    - When: User clicks left/right arrows
    - Then: Carousel scrolls by 200px

12. **Mobile Menu Toggle**
    - Given: User on mobile viewport
    - When: User clicks menu button
    - Then: Mobile navigation opens/closes

13. **Dark Mode Toggle**
    - Given: User is on landing page
    - When: User clicks dark mode toggle
    - Then: `onToggleDarkMode` callback invoked

## Sample Test Data

```typescript
const mockHeroContent = {
  tagline: "Building Tomorrow's Software Today",
  description: "We craft innovative SaaS products...",
  ctaText: "Explore Our Work",
  ctaLink: "/portfolio",
  backgroundImage: "/images/hero-bg.jpg"
}

const mockServices = [
  { id: "svc-001", icon: "code", title: "Custom Software", description: "..." }
]

const mockTeamMembers = [
  { id: "team-001", name: "Alex Chen", role: "CEO", bio: "...", photoUrl: "/images/team/alex.jpg" }
]

const mockTestimonials = [
  { id: "test-001", quote: "Amazing work!", clientName: "John Doe", clientCompany: "Acme Inc" }
]

const mockContactInfo = {
  address: "123 Tech Blvd, SF, CA",
  email: "hello@aegontech.com",
  phone: "+1 (555) 123-4567",
  mapEmbedUrl: "https://maps.google.com/..."
}
```
