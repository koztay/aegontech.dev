# Blog Section

The public blog with list and detail views.

## Components

| Component | Description |
|-----------|-------------|
| `BlogList.tsx` | Blog posts grid sorted by date |
| `BlogCard.tsx` | Post card with featured image and excerpt |
| `BlogDetail.tsx` | Full article view with markdown content |

## Props

See `types.ts` for complete TypeScript interfaces.

### BlogPost Structure

```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  publishedAt: string  // ISO date string
}
```

## Sample Data

See `sample-data.json` for realistic test data with 6 blog posts.

## Integration Notes

- Posts sorted by `publishedAt` descending (newest first)
- `slug` used for URL routing: `/blog/[slug]`
- Content supports basic markdown: headings, lists, paragraphs
- Date formatting uses `Intl.DateTimeFormat` for localization
- Back button navigates to `/blog`
