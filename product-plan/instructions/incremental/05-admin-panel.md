# Milestone 5: Admin Panel

## Overview
Implement authentication and admin management interfaces for portfolio and blog.

## What You're Receiving
- `LoginForm.tsx` — Standalone login with branding
- `Dashboard.tsx` — Overview with stats and recent items
- `PortfolioList.tsx` — Portfolio items table with CRUD actions
- `AdminBlogList.tsx` — Blog posts table with CRUD actions

## What You Need to Build
- Supabase Auth integration
- Route protection middleware
- Dashboard data aggregation
- CRUD operations for portfolio and blog
- Create/Edit forms for both content types

## TDD Approach
Reference `sections/admin-panel/tests.md` for test specifications.

## Authentication

### Login Handler
```typescript
const handleLogin = async (email: string, password: string) => {
  setIsLoading(true)
  setError(null)
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    setError(error.message)
    setIsLoading(false)
    return
  }
  
  router.push('/admin')
}
```

### Route Protection (Middleware)
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect admin routes (except login)
  if (req.nextUrl.pathname.startsWith('/admin') && 
      !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

## Dashboard Implementation
```typescript
// Fetch dashboard stats
const [portfolioCount, blogCount, recentPortfolio, recentBlog] = await Promise.all([
  supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
  supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
  supabase.from('portfolio_items').select('id, title, type, updated_at').order('updated_at', { ascending: false }).limit(3),
  supabase.from('blog_posts').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(3)
])
```

## CRUD Operations

### Portfolio CRUD
```typescript
// Create
const { data, error } = await supabase
  .from('portfolio_items')
  .insert(formData)
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('portfolio_items')
  .update(formData)
  .eq('id', itemId)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('portfolio_items')
  .delete()
  .eq('id', itemId)
```

### Blog CRUD
Same pattern as portfolio, with additional status handling:
```typescript
// Publish
await supabase
  .from('blog_posts')
  .update({ 
    status: 'published', 
    published_at: new Date().toISOString() 
  })
  .eq('id', postId)

// Unpublish
await supabase
  .from('blog_posts')
  .update({ status: 'draft' })
  .eq('id', postId)
```

## Admin RLS Policies
```sql
-- Authenticated users can do anything
CREATE POLICY "Admin full access" ON portfolio_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');
```

## Create/Edit Forms (You Need to Build)
Modal or page-based forms for:

### Portfolio Form
- Title (text input)
- Description (textarea)
- Type (select: SaaS/Mobile)
- Screenshot (file upload to Supabase Storage)
- Website URL (optional text input)
- App Store URL (optional text input)
- Play Store URL (optional text input)

### Blog Form
- Title (text input)
- Slug (auto-generated from title, editable)
- Excerpt (textarea)
- Content (rich text editor or markdown)
- Featured Image (file upload)
- Status (draft/published toggle)

## Expected User Flows
1. Admin navigates to `/admin/login`
2. Admin enters credentials → logged in → redirected to `/admin`
3. Admin sees dashboard with stats and recent items
4. Admin clicks "Add Portfolio Item" → fills form → saves
5. Admin clicks edit on existing item → modifies → updates
6. Admin clicks delete → confirms → item removed
7. Same flows for blog posts
8. Admin clicks logout → session cleared → redirected to login

## Done Checklist
- [ ] Login form working with Supabase Auth
- [ ] Invalid credentials showing error
- [ ] Protected routes redirecting to login
- [ ] Dashboard showing accurate stats
- [ ] Recent items linking to management pages
- [ ] Portfolio list showing all items
- [ ] Portfolio create/edit/delete working
- [ ] Blog list showing all posts (draft + published)
- [ ] Blog create/edit/delete working
- [ ] Publish/unpublish toggle for blog
- [ ] Image upload to Supabase Storage
- [ ] Logout clearing session
- [ ] Responsive admin interface
