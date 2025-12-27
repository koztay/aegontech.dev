# Milestone 4: Blog

## Overview
Implement the blog list and blog detail pages for public viewing.

## What You're Receiving
- `BlogList.tsx` — Blog posts grid with sorting
- `BlogCard.tsx` — Post card with featured image and excerpt
- `BlogDetail.tsx` — Full article view with markdown content

## What You Need to Build
- Blog posts table
- Data fetching for list and detail
- n8n API endpoint for automated publishing
- URL slug routing

## TDD Approach
Reference `sections/blog/tests.md` for test specifications.

## Database Schema
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON blog_posts 
  FOR SELECT USING (status = 'published');
```

## Implementation

### Blog List Fetching
```typescript
const { data: posts } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
```

### Blog Detail Fetching
```typescript
const { data: post } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('slug', params.slug)
  .eq('status', 'published')
  .single()
```

### Routing
```typescript
// app/blog/page.tsx
<BlogList posts={posts} onPostClick={(slug) => router.push(`/blog/${slug}`)} />

// app/blog/[slug]/page.tsx
<BlogDetail post={post} onBack={() => router.push('/blog')} />
```

### n8n API Endpoint
Create an Edge Function or API route:
```typescript
// app/api/blog/publish/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  // Verify API key from n8n
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, slug, excerpt, content, featured_image } = body

  const supabase = createRouteHandlerClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status: 'published',
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true, post: data })
}
```

## Expected User Flows
1. User navigates to `/blog`
2. User sees grid of published posts (newest first)
3. User clicks post card → navigates to `/blog/[slug]`
4. User reads full article with formatted content
5. User clicks "Back to Blog" → returns to list

## Done Checklist
- [ ] Blog list showing published posts
- [ ] Posts sorted by date (newest first)
- [ ] Blog detail rendering markdown content
- [ ] Back navigation working
- [ ] 404 for non-existent slugs
- [ ] n8n API endpoint functional
- [ ] SEO meta tags on detail page
