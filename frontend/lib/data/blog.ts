import { query } from "@/lib/db/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishedAt: string;
  status?: "draft" | "published";
};

const SAMPLE_POST: BlogPost = {
  id: "sample-post",
  slug: "sample-post",
  title: "Shipping Fast With Clarity",
  excerpt: "How we keep mobile and SaaS launches on-track with small, high-leverage teams.",
  content: `Momentum beats perfection. We ship in tight cycles, validate with users early, and keep the release train moving. This sample post demonstrates the blog layout, inline media, and SEO/schema wiring.

We also keep observability close to the work: every ingestion run is logged, rate limited, and auditable. Images are stored with checksums and alt text to keep accessibility front-and-center.`,
  featuredImage: "/assets/placeholder.svg",
  publishedAt: "2024-01-01T00:00:00.000Z",
  status: "published",
};

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await query<any>(
      "SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published' LIMIT 1",
      [slug]
    );

    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featured_image,
        publishedAt: row.published_at,
        status: row.status,
      };
    }
  } catch (err) {
    console.warn("Blog fetch failed, falling back when possible", err);
  }

  if (slug === SAMPLE_POST.slug) return SAMPLE_POST;
  return null;
}

export async function getBlogIndex(): Promise<BlogPost[]> {
  try {
    const rows = await query<any>(
      "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 50"
    );

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featured_image,
        publishedAt: row.published_at,
        status: row.status,
      }));
    }
  } catch (err) {
    console.warn("Blog index fetch failed, using fallback", err);
  }

  return [SAMPLE_POST];
}

export function blogUrl(slug: string) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";
  return `${SITE_URL}/blog/${slug}`;
}
