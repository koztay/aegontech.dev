// ==================
// Landing Page Types
// ==================

export interface HeroContent {
    tagline: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
}

export interface Service {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUrl: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    clientName: string;
    clientCompany: string;
    clientPhotoUrl?: string;
}

export interface FeaturedPortfolioItem {
    id: string;
    title: string;
    type: "saas" | "mobile";
    description: string;
    imageUrl: string;
    url: string;
}

export interface ContactInfo {
    address: string;
    email: string;
    phone: string;
    mapEmbedUrl: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    message: string;
    userAgent?: string;
    ip?: string;
}

// ==================
// Portfolio Types
// ==================

export type ProjectType = "saas" | "mobile";

export interface ProjectLinks {
    website?: string;
    appStore?: string;
    playStore?: string;
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    type: ProjectType;
    screenshot: string;
    links: ProjectLinks;
}

// ==================
// Blog Types
// ==================

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    publishedAt: string;
    status?: "draft" | "published";
}

// ==================
// Admin Types
// ==================

export interface AdminUser {
    id: string;
    email: string;
    name: string;
}

export interface DashboardStats {
    totalPortfolioItems: number;
    totalBlogPosts: number;
    recentActivityCount: number;
}

export interface RecentPortfolioItem {
    id: string;
    title: string;
    type: "saas" | "mobile";
    updatedAt: string;
}

export interface RecentBlogPost {
    id: string;
    title: string;
    status: "draft" | "published";
    updatedAt: string;
}

// ==================
// Component Props
// ==================

export interface HeroSectionProps {
    content: HeroContent;
    onCtaClick?: () => void;
}

export interface ServicesSectionProps {
    services: Service[];
}

export interface TeamSectionProps {
    members: TeamMember[];
    onMemberClick?: (id: string) => void;
}

export interface TestimonialsSectionProps {
    testimonials: Testimonial[];
}

export interface PortfolioPreviewProps {
    items: FeaturedPortfolioItem[];
    onItemClick?: (id: string) => void;
    onViewAll?: () => void;
}

export interface ContactSectionProps {
    contactInfo: ContactInfo;
    onSubmit?: (data: ContactFormData) => Promise<void>;
}

export interface LandingPageProps {
    heroContent: HeroContent;
    services: Service[];
    teamMembers: TeamMember[];
    testimonials: Testimonial[];
    featuredPortfolioItems: FeaturedPortfolioItem[];
    contactInfo: ContactInfo;
    onPortfolioItemClick?: (id: string) => void;
    onViewAllPortfolio?: () => void;
    onTeamMemberClick?: (id: string) => void;
    onContactSubmit?: (data: ContactFormData) => Promise<void>;
    onCtaClick?: () => void;
}

export interface PortfolioGridProps {
    items: PortfolioItem[];
    onExternalLink?: (url: string) => void;
}

export interface PortfolioCardProps {
    item: PortfolioItem;
    onExternalLink?: (url: string) => void;
}

export interface BlogListProps {
    posts: BlogPost[];
    onPostClick?: (slug: string) => void;
}

export interface BlogCardProps {
    post: BlogPost;
    onPostClick?: (slug: string) => void;
}

export interface BlogDetailProps {
    post: BlogPost;
    onBack?: () => void;
}
