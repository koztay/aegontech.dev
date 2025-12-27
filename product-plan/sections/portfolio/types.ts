// Data Types

export type ProjectType = 'saas' | 'mobile'

export interface ProjectLinks {
    website?: string
    appStore?: string
    playStore?: string
}

export interface PortfolioItem {
    id: string
    title: string
    description: string
    type: ProjectType
    screenshot: string
    links: ProjectLinks
}

// Component Props

export interface PortfolioGridProps {
    items: PortfolioItem[]
    onExternalLink?: (url: string) => void
}

export interface PortfolioCardProps {
    item: PortfolioItem
    onExternalLink?: (url: string) => void
}
