// Data Types

export interface AdminUser {
    id: string
    email: string
    name: string
}

export interface DashboardStats {
    totalPortfolioItems: number
    totalBlogPosts: number
    recentActivityCount: number
}

export interface RecentPortfolioItem {
    id: string
    title: string
    type: 'saas' | 'mobile'
    updatedAt: string
}

export interface RecentBlogPost {
    id: string
    title: string
    status: 'draft' | 'published'
    updatedAt: string
}

// Login Props
export interface LoginFormProps {
    onLogin?: (email: string, password: string) => void
    isLoading?: boolean
    error?: string | null
}

// Dashboard Props
export interface DashboardProps {
    stats: DashboardStats
    recentPortfolioItems: RecentPortfolioItem[]
    recentBlogPosts: RecentBlogPost[]
    onViewPortfolio?: () => void
    onViewBlog?: () => void
    onAddPortfolioItem?: () => void
    onAddBlogPost?: () => void
}

// Portfolio Management Props
export interface PortfolioItem {
    id: string
    title: string
    description: string
    type: 'saas' | 'mobile'
    screenshot: string
    links: {
        website?: string
        appStore?: string
        playStore?: string
    }
}

export interface PortfolioListProps {
    items: PortfolioItem[]
    onAdd?: () => void
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export interface PortfolioFormProps {
    item?: PortfolioItem | null
    onSave?: (item: Omit<PortfolioItem, 'id'>) => void
    onCancel?: () => void
}

// Blog Management Props
export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    featuredImage: string
    status: 'draft' | 'published'
    publishedAt: string | null
}

export interface BlogListProps {
    posts: BlogPost[]
    onAdd?: () => void
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export interface BlogFormProps {
    post?: BlogPost | null
    onSave?: (post: Omit<BlogPost, 'id'>) => void
    onCancel?: () => void
}
