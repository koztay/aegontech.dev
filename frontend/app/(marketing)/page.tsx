import {
  HeroSection,
  ServicesSection,
  PortfolioPreview,
  TeamSection,
  TestimonialsSection,
  ContactSection,
} from "@/components/landing";
import { PublicShell } from "@/components/shell/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getHeroContent,
  getContactInfo,
  getTeamMembers,
  getTestimonials,
} from "@/lib/data/static";
import { buildPageMeta, buildWebsiteSchema } from "@/lib/seo/meta";
import type { Metadata } from "next";
import { getServices } from "@/lib/data/landing";
import { getAllPortfolioItems } from "@/lib/data/portfolio";

export const metadata: Metadata = buildPageMeta({
  title: "Aegontech.dev - Modern SaaS and Mobile Product Studio",
  description: "We build innovative SaaS products and mobile applications that drive business growth",
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aegontech.dev'}/`,
  type: "website",
});

export default async function MarketingPage() {
  const services = await getServices();
  const portfolioData = await getAllPortfolioItems();
  
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  // Map PortfolioItem to FeaturedPortfolioItem
  const portfolioItems = portfolioData.map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description,
    imageUrl: item.screenshot,
  }));

  const heroContent = getHeroContent();
  const contactInfo = getContactInfo();
  const teamMembers = getTeamMembers();
  const testimonials = getTestimonials();

  // Build WebSite schema
  const websiteSchema = buildWebsiteSchema({
    name: "Aegontech.dev",
    description: "We build innovative SaaS products and mobile applications that drive business growth",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/aegontech-logo.png`
  });

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <PublicShell navigationItems={navigationItems} currentPath="/">
      <JsonLd schema={websiteSchema} />
      <HeroSection content={heroContent} />
      <ServicesSection services={services} />
      <PortfolioPreview items={portfolioItems} />
      <TeamSection members={teamMembers} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection contactInfo={contactInfo} />
    </PublicShell>
  );
}
