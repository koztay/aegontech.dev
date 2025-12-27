# Admin Panel Section

Authenticated admin dashboard for managing portfolio and blog content.

## Components

| Component | Description |
|-----------|-------------|
| `LoginForm.tsx` | Standalone login with AEGONTECH branding |
| `Dashboard.tsx` | Overview with stats and recent items |
| `PortfolioList.tsx` | Portfolio items table with CRUD actions |
| `AdminBlogList.tsx` | Blog posts table with CRUD actions |

## Routes

- `/admin/login` — Login page (standalone, no shell)
- `/admin` — Dashboard (requires auth)
- `/admin/portfolio` — Portfolio management (requires auth)
- `/admin/blog` — Blog management (requires auth)

## Authentication

Uses Supabase Auth with email/password. Protected routes redirect to login.

## Props

See `types.ts` for complete TypeScript interfaces.

### Key Types

```typescript
interface LoginFormProps {
  onLogin?: (email: string, password: string) => void
  isLoading?: boolean
  error?: string | null
}

interface DashboardProps {
  stats: DashboardStats
  recentPortfolioItems: RecentPortfolioItem[]
  recentBlogPosts: RecentBlogPost[]
  onViewPortfolio?: () => void
  onViewBlog?: () => void
  onAddPortfolioItem?: () => void
  onAddBlogPost?: () => void
}

interface PortfolioListProps {
  items: PortfolioItem[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

interface BlogListProps {
  posts: BlogPost[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}
```

## Sample Data

See `sample-data.json` for admin user, stats, and recent items.

## Integration Notes

- Login form has built-in loading and error states
- Dashboard shows aggregated counts from database
- CRUD tables need create/edit forms (modal or page-based)
- Delete should show confirmation modal
- Blog posts have draft/published status toggle
