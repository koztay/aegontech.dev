import type { LandingPageProps } from '../types'
import { HeroSection } from './HeroSection'
import { ServicesSection } from './ServicesSection'
import { PortfolioPreview } from './PortfolioPreview'
import { TeamSection } from './TeamSection'
import { TestimonialsSection } from './TestimonialsSection'
import { ContactSection } from './ContactSection'

export function LandingPage({
    heroContent,
    services,
    teamMembers,
    testimonials,
    featuredPortfolioItems,
    contactInfo,
    onPortfolioItemClick,
    onViewAllPortfolio,
    onTeamMemberClick,
    onContactSubmit,
    onCtaClick
}: LandingPageProps) {
    return (
        <div className="min-h-screen">
            <HeroSection
                content={heroContent}
                onCtaClick={onCtaClick}
            />

            <ServicesSection
                services={services}
            />

            <PortfolioPreview
                items={featuredPortfolioItems}
                onItemClick={onPortfolioItemClick}
                onViewAll={onViewAllPortfolio}
            />

            <TeamSection
                members={teamMembers}
                onMemberClick={onTeamMemberClick}
            />

            <TestimonialsSection
                testimonials={testimonials}
            />

            <ContactSection
                contactInfo={contactInfo}
                onSubmit={onContactSubmit}
            />
        </div>
    )
}
