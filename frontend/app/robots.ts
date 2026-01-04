import { MetadataRoute } from "next";

/**
 * Dynamic robots.txt generator for Next.js 15 App Router
 * Controls search engine crawler access and references the sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.aegontech.dev";

  // Remove trailing slash from base URL for consistency
  const siteUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin-login"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    llms: `${siteUrl}/llms.txt`,
  } as MetadataRoute.Robots;
}
