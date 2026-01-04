import { PortfolioGrid } from "@/components/portfolio";
import { PublicShell } from "@/components/shell/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, buildWebsiteSchema, buildBreadcrumbSchema } from "@/lib/seo/meta";
import type { Metadata } from "next";
import { getAllPortfolioItems } from "@/lib/data/portfolio";

export const metadata: Metadata = buildPageMeta({
  title: "Portfolio - Aegontech.dev",
  description: "Explore our portfolio of successful projects and case studies",
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aegontech.dev'}/portfolio`,
  type: "website",
});

export default async function PortfolioPage() {
  const portfolioItems = await getAllPortfolioItems();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  // Build WebSite schema
  const websiteSchema = buildWebsiteSchema({
    name: "Aegontech.dev",
    description: "Explore our portfolio of successful projects and case studies",
    url: SITE_URL
  });

  // Build BreadcrumbList schema
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "Home", url: SITE_URL },
      { name: "Portfolio", url: `${SITE_URL}/portfolio` }
    ]
  });

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <PublicShell
      navigationItems={navigationItems}
      currentPath="/portfolio"
    >
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <PortfolioGrid items={portfolioItems} />
    </PublicShell>
  );
}
