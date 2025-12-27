# Data Model

## Entities

### PortfolioItem
A SaaS application or mobile app showcased in the portfolio. Contains auto-extracted screenshot and metadata from the provided URL (web app, App Store, or Play Store).

### BlogPost
A blog article with content, featured image, inline images, and SEO tags. Created via the secure n8n API endpoint.

### Tag
A label for categorizing blog posts, primarily used for SEO purposes.

### TeamMember
A person on the AEGONTECH team displayed in the About Us section of the landing page.

### Service
A service offering that AEGONTECH provides, displayed on the landing page.

### Testimonial
A client testimonial with a quote and attribution, displayed on the landing page.

### ContactSubmission
A message submitted through the contact form on the landing page.

### Admin
An authenticated user who can manage portfolio items and blog posts via the admin panel.

## Relationships

- BlogPost has many Tag (via a join for categorization)
- Tag belongs to many BlogPost
- PortfolioItem is managed by Admin
- BlogPost is created via n8n API (or managed by Admin)
- ContactSubmission is received by Admin (for review)
