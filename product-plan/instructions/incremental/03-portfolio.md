# Milestone 3: Portfolio

## Overview
Implement the portfolio grid page displaying all AEGONTECH projects.

## What You're Receiving
- `PortfolioGrid.tsx` — Page layout with responsive grid
- `PortfolioCard.tsx` — Project card with screenshot, badges, and links

## What You Need to Build
- Portfolio items table
- Data fetching
- External link handling
- Optional: filtering by type

## TDD Approach
Reference `sections/portfolio/tests.md` for test specifications.

## Database Schema
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
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON portfolio_items FOR SELECT USING (true);
```

## Implementation

### Data Fetching
```typescript
const { data: items } = await supabase
  .from('portfolio_items')
  .select('*')
  .order('sort_order')
```

### Transform for Component
```typescript
const portfolioItems = items.map(item => ({
  id: item.id,
  title: item.title,
  description: item.description,
  type: item.type as 'saas' | 'mobile',
  screenshot: item.screenshot,
  links: {
    website: item.website_url,
    appStore: item.app_store_url,
    playStore: item.play_store_url
  }
}))
```

### External Link Handler
```typescript
const handleExternalLink = (url: string) => {
  // Optional: track click analytics
  window.open(url, '_blank', 'noopener,noreferrer')
}
```

### Optional: Type Filter
```typescript
const [filter, setFilter] = useState<'all' | 'saas' | 'mobile'>('all')
const filteredItems = filter === 'all' 
  ? items 
  : items.filter(item => item.type === filter)
```

## Expected User Flows
1. User navigates to `/portfolio`
2. User sees grid of all projects with screenshots
3. User identifies project type by badge (SaaS/Mobile)
4. User clicks external link → opens in new tab
5. Optional: User filters by SaaS or Mobile

## Done Checklist
- [ ] Portfolio grid showing all items
- [ ] Type badges displaying correctly
- [ ] Screenshot images loading
- [ ] External links opening in new tabs
- [ ] Responsive grid (3/2/1 columns)
- [ ] Empty state if no items
