import { Suspense } from 'react';
import { BlogList } from "@/components/blog";
import { PublicShell } from "@/components/shell/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, buildWebsiteSchema, buildBreadcrumbSchema } from "@/lib/seo/meta";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMeta({
  title: "Blog - Aegontech.dev",
  description: "Latest insights, tutorials, and updates from Aegontech",
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aegontech.dev'}/blog`,
  type: "website",
});

export default async function BlogPage() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  // Build WebSite schema with search action
  const websiteSchema = buildWebsiteSchema({
    name: "Aegontech.dev",
    description: "Latest insights, tutorials, and updates from Aegontech",
    url: SITE_URL,
    searchAction: true
  });

  // Build BreadcrumbList schema
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "Home", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` }
    ]
  });

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <PublicShell
      navigationItems={navigationItems}
      currentPath="/blog"
    >
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
        <BlogList />
      </Suspense>
    </PublicShell>
  );
}
