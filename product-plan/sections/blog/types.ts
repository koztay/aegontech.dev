// Data Types

export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    featuredImage: string
    publishedAt: string
}

// Component Props

export interface BlogListProps {
    posts: BlogPost[]
    onPostClick?: (slug: string) => void
}

export interface BlogCardProps {
    post: BlogPost
    onPostClick?: (slug: string) => void
}

export interface BlogDetailProps {
    post: BlogPost
    onBack?: () => void
}
