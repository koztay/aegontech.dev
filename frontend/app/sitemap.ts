import { MetadataRoute } from "next";
import { getAllBlogSlugs, getBlogIndex } from "@/lib/data/blog";
import { getAllPortfolioItems } from "@/lib/data/portfolio";
import type { PortfolioItem } from "@/lib/types";

export const revalidate = 60;

/**
 * Dynamic sitemap generator for Next.js 15 App Router
 * Generates sitemap.xml including static pages, blog posts, and portfolio items
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.aegontech.dev";

  // Remove trailing slash from base URL for consistency
  const siteUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllBlogSlugs();
    blogPosts = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("Failed to fetch blog posts for sitemap:", error);
  }

  // Dynamic portfolio items
  let portfolioItems: MetadataRoute.Sitemap = [];
  try {
    const items = await getAllPortfolioItems();
    portfolioItems = items.map((item: PortfolioItem) => {
      // Convert title to slug format (replace spaces with hyphens)
      const slug = item.title.toLowerCase().replace(/\s+/g, "-");
      return {
        url: `${siteUrl}/portfolio/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });
  } catch (error) {
    console.warn("Failed to fetch portfolio items for sitemap:", error);
  }

  // Combine all sitemap entries
  return [...staticPages, ...blogPosts, ...portfolioItems];
}
