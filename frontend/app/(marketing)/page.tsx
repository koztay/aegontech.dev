"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeroSection,
  ServicesSection,
  PortfolioPreview,
  TeamSection,
  TestimonialsSection,
  ContactSection,
} from "@/components/landing";
import { PublicShell } from "@/components/shell/PublicShell";
import {
  getHeroContent,
  getContactInfo,
  getTeamMembers,
  getTestimonials,
} from "@/lib/data/static";
import type {
  Service,
  FeaturedPortfolioItem,
  ContactFormData,
} from "@/lib/types";

export default function MarketingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<FeaturedPortfolioItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const heroContent = getHeroContent();
  const contactInfo = getContactInfo();
  const teamMembers = getTeamMembers();
  const testimonials = getTestimonials();

  useEffect(() => {
    // Fetch data from API routes (only for portfolio and services)
    Promise.all([
      fetch("/api/data/services").then((r) => r.json()),
      fetch("/api/data/portfolio").then((r) => r.json()),
    ])
      .then(([servicesData, portfolioData]) => {
        setServices(servicesData);
        // Map PortfolioItem to FeaturedPortfolioItem
        const mappedPortfolio = portfolioData.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          description: item.description,
          imageUrl: item.screenshot,
          url: item.links?.website || item.links?.appStore || item.links?.playStore || `/portfolio/${item.id}`,
        }));
        setPortfolioItems(mappedPortfolio);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });

    // Check dark mode preference
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to submit contact form");
    }
  };

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <PublicShell
      navigationItems={navigationItems}
      currentPath="/"
      isDarkMode={isDarkMode}
      onToggleDarkMode={handleToggleDarkMode}
      onNavigate={(href) => {
        if (href.startsWith("#")) {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: "smooth" });
        } else {
          router.push(href);
        }
      }}
    >
      <HeroSection
        content={heroContent}
        onCtaClick={() => router.push("/portfolio")}
      />

      <ServicesSection services={services} />

      <PortfolioPreview
        items={portfolioItems}
        onViewAll={() => router.push("/portfolio")}
        onItemClick={(id) => console.log("Portfolio item clicked:", id)}
      />

      <TeamSection
        members={teamMembers}
        onMemberClick={(id) => console.log("Team member clicked:", id)}
      />

      <TestimonialsSection testimonials={testimonials} />

      <ContactSection contactInfo={contactInfo} onSubmit={handleContactSubmit} />
    </PublicShell>
  );
}
