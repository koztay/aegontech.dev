import {
  HeroSection,
  Ticker,
  SelectedWork,
  Practice,
  Method,
  Voices,
  StudioRoster,
  ContactSection,
  SpineRail,
} from "@/components/landing";
import type { SpineSection } from "@/components/landing/SpineRail";
import { PublicShell } from "@/components/shell/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getContactInfo,
  getTeamMembers,
  getTestimonials,
} from "@/lib/data/static";
import { buildPageMeta, buildWebsiteSchema } from "@/lib/seo/meta";
import type { Metadata } from "next";
import { getServices } from "@/lib/data/landing";
import { getAllPortfolioItems } from "@/lib/data/portfolio";

export const revalidate = 60;

export const metadata: Metadata = buildPageMeta({
  title: "Aegontech.dev — Software Product Studio",
  description:
    "A software product studio. We design, engineer, and ship SaaS platforms and mobile apps end to end — from the first sketch to the App Store.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://aegontech.dev"}/`,
  type: "website",
});

const SPINE: SpineSection[] = [
  { id: "hero", index: "00", label: "Index" },
  { id: "work", index: "01", label: "Work" },
  { id: "practice", index: "02", label: "Practice" },
  { id: "method", index: "03", label: "Method" },
  { id: "voices", index: "04", label: "Voices" },
  { id: "studio", index: "05", label: "Studio" },
  { id: "contact", index: "06", label: "Contact" },
];

export default async function MarketingPage() {
  const services = await getServices();
  const portfolioItems = await getAllPortfolioItems();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  const contactInfo = getContactInfo();
  const teamMembers = getTeamMembers();
  const testimonials = getTestimonials();

  const websiteSchema = buildWebsiteSchema({
    name: "Aegontech.dev",
    description:
      "A software product studio designing and shipping SaaS platforms and mobile apps.",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/aegontech-logo.png`,
  });

  const navigationItems = [
    { label: "Work", href: "/#work" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <PublicShell navigationItems={navigationItems} currentPath="/">
      <JsonLd schema={websiteSchema} />
      <SpineRail sections={SPINE} />
      <HeroSection shippedCount={portfolioItems.length} />
      <Ticker />
      <SelectedWork items={portfolioItems} />
      <Practice services={services} />
      <Method />
      <Voices testimonials={testimonials} />
      <StudioRoster members={teamMembers} />
      <ContactSection contactInfo={contactInfo} />
    </PublicShell>
  );
}
