// ==================
// Data Types
// ==================

export interface HeroContent {
    tagline: string
    description: string
    ctaText: string
    ctaLink: string
    backgroundImage: string
}

export interface Service {
    id: string
    icon: string
    title: string
    description: string
}

export interface TeamMember {
    id: string
    name: string
    role: string
    bio: string
    photoUrl: string
}

export interface Testimonial {
    id: string
    quote: string
    clientName: string
    clientCompany: string
    clientPhotoUrl?: string
}

export interface FeaturedPortfolioItem {
    id: string
    title: string
    type: 'saas' | 'mobile'
    description: string
    imageUrl: string
    url: string
}

export interface ContactInfo {
    address: string
    email: string
    phone: string
    mapEmbedUrl: string
}

export interface ContactFormData {
    name: string
    email: string
    message: string
}

// ==================
// Component Props
// ==================

export interface HeroSectionProps {
    content: HeroContent
    onCtaClick?: () => void
}

export interface ServicesSectionProps {
    services: Service[]
}

export interface TeamSectionProps {
    members: TeamMember[]
    onMemberClick?: (id: string) => void
}

export interface TestimonialsSectionProps {
    testimonials: Testimonial[]
}

export interface PortfolioPreviewProps {
    items: FeaturedPortfolioItem[]
    onItemClick?: (id: string) => void
    onViewAll?: () => void
}

export interface ContactSectionProps {
    contactInfo: ContactInfo
    onSubmit?: (data: ContactFormData) => void
}

export interface LandingPageProps {
    heroContent: HeroContent
    services: Service[]
    teamMembers: TeamMember[]
    testimonials: Testimonial[]
    featuredPortfolioItems: FeaturedPortfolioItem[]
    contactInfo: ContactInfo
    onPortfolioItemClick?: (id: string) => void
    onViewAllPortfolio?: () => void
    onTeamMemberClick?: (id: string) => void
    onContactSubmit?: (data: ContactFormData) => void
    onCtaClick?: () => void
}
