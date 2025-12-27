# Blog Tests

## User Flow Tests

### Success Paths

1. **View Blog List**
   - Given: User navigates to `/blog`
   - When: Page loads
   - Then: Published posts displayed in grid, sorted newest first

2. **Click Blog Post**
   - Given: Blog list is displayed
   - When: User clicks a post card
   - Then: `onPostClick` called with slug, navigates to `/blog/[slug]`

3. **View Blog Detail**
   - Given: User navigates to `/blog/building-scalable-saas`
   - When: Page loads
   - Then: Full post content displayed with title, date, featured image

4. **Back Navigation**
   - Given: User is on blog detail page
   - When: User clicks "Back to Blog"
   - Then: `onBack` called, navigates to `/blog`

### Failure Paths

5. **Non-existent Post**
   - Given: User navigates to `/blog/invalid-slug`
   - When: Post not found
   - Then: 404 page or "Post not found" message

## Empty State Tests

6. **No Published Posts**
   - Given: Empty posts array or all posts are drafts
   - Then: Show empty state message

## Content Rendering Tests

7. **Heading Rendering**
   - Given: Content contains `## Heading`
   - Then: Renders as `<h2>` element

8. **List Rendering**
   - Given: Content contains numbered list
   - Then: Renders as `<ol>` with `<li>` items

9. **Paragraph Rendering**
   - Given: Content contains plain paragraphs
   - Then: Renders as `<p>` elements with proper spacing

## Component Interaction Tests

10. **Card Hover Effect**
    - Given: User hovers over blog card
    - When: Mouse enters card
    - Then: Shadow increases, title color changes to indigo

11. **Date Formatting**
    - Given: `publishedAt: "2024-12-20T10:00:00Z"`
    - Then: Displays as "December 20, 2024"

## Responsive Tests

12. **Desktop Grid**
    - Given: Viewport > 1024px
    - Then: 3-column grid layout

13. **Tablet Grid**
    - Given: Viewport 768px - 1024px
    - Then: 2-column grid layout

14. **Mobile Grid**
    - Given: Viewport < 768px
    - Then: 1-column stacked layout

## Sample Test Data

```typescript
const mockBlogPosts = [
  {
    id: "building-scalable-saas",
    title: "Building Scalable SaaS Applications in 2024",
    slug: "building-scalable-saas",
    excerpt: "Learn the key architectural patterns...",
    content: "Building a scalable SaaS...\n\n## Key Principles\n\n1. **Microservices**...",
    featuredImage: "https://picsum.photos/seed/saas-scale/800/400",
    publishedAt: "2024-12-20T10:00:00Z"
  }
]
```
