import type { HeroContent, ContactInfo, TeamMember, Testimonial } from "@/lib/types";

export function getHeroContent(): HeroContent {
    return {
        tagline: "Building Tomorrow's Software Today",
        description:
            "We craft innovative SaaS products and mobile applications that solve real-world problems.",
        ctaText: "Explore Our Work",
        ctaLink: "/portfolio",
        backgroundImage: "/images/hero-bg.jpg",
    };
}

export function getContactInfo(): ContactInfo {
    return {
        address: "123 Tech Boulevard, Suite 400, San Francisco, CA 94105",
        email: "hello@aegontech.com",
        phone: "+1 (555) 123-4567",
        mapEmbedUrl:
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019284573!",
    };
}

export function getTeamMembers(): TeamMember[] {
    return [
        {
            id: "1",
            name: "Alex Chen",
            role: "CEO & Founder",
            bio: "15+ years in software development. Previously led engineering at a Fortune 500 tech company.",
            photoUrl: "",
        },
        {
            id: "2",
            name: "Sarah Johnson",
            role: "CTO",
            bio: "Full-stack architect with expertise in scalable cloud systems and microservices.",
            photoUrl: "",
        },
        {
            id: "3",
            name: "Marcus Williams",
            role: "Lead Designer",
            bio: "Award-winning designer focused on creating exceptional user experiences.",
            photoUrl: "",
        },
        {
            id: "4",
            name: "Emily Rodriguez",
            role: "Mobile Lead",
            bio: "iOS and Android specialist with 20+ apps shipped to the App Store and Play Store.",
            photoUrl: "",
        },
    ];
}

export function getTestimonials(): Testimonial[] {
    return [
        {
            id: "1",
            quote:
                "AEGONTECH transformed our vision into a polished product that our users love. Their attention to detail is unmatched.",
            clientName: "Michael Foster",
            clientCompany: "TechVentures Inc.",
            clientPhotoUrl: "",
        },
        {
            id: "2",
            quote:
                "Working with AEGONTECH was seamless. They delivered on time, on budget, and exceeded our expectations.",
            clientName: "Jennifer Martinez",
            clientCompany: "StartupFlow",
            clientPhotoUrl: "",
        },
        {
            id: "3",
            quote:
                "Their mobile app development expertise helped us launch on both platforms simultaneously. Highly recommended!",
            clientName: "David Park",
            clientCompany: "MobileFirst Solutions",
            clientPhotoUrl: "",
        },
        {
            id: "4",
            quote:
                "The SaaS platform they built for us handles thousands of users daily without breaking a sweat.",
            clientName: "Lisa Thompson",
            clientCompany: "CloudScale Corp",
            clientPhotoUrl: "",
        },
    ];
}
