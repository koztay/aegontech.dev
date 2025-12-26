import { getSupabaseClient } from "@/lib/supabase/client";

export type BlogInlineImage = { url: string; alt: string };
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  featuredImage?: string;
  inlineImages: BlogInlineImage[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";
const SAMPLE_POST: BlogPost = {
  id: "sample-post",
  slug: "sample-post",
  title: "Shipping Fast With Clarity",
  summary: "How we keep mobile and SaaS launches on-track with small, high-leverage teams.",
  body: `<p>Momentum beats perfection. We ship in tight cycles, validate with users early, and keep the release train moving. This sample post demonstrates the blog layout, inline media, and SEO/schema wiring.</p>
  <p>We also keep observability close to the work: every ingestion run is logged, rate limited, and auditable. Images are stored with checksums and alt text to keep accessibility front-and-center.</p>`,
  tags: ["process", "mobile", "saas"],
  publishedAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
  featuredImage: "/assets/placeholder.svg",
  inlineImages: [
    { url: "/assets/placeholder.svg", alt: "Placeholder device mock" },
    { url: "/assets/placeholder.svg", alt: "Placeholder dashboard" }
  ]
};

function publicUrl(path: string) {
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${path}`;
}

function supabaseEnvAvailable() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[] | null;
  published_at: string | null;
  updated_at: string | null;
  featured_image_id: string | null;
};

type MediaRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  source: string | null;
  mime_type: string | null;
};

function mapMedia(rows: MediaRow[]): { featured?: string; inline: BlogInlineImage[] } {
  const featured = rows.find((row) => row.storage_path.includes("featured"));
  const inline = rows.filter((row) => !row.storage_path.includes("featured"));
  return {
    featured: featured ? publicUrl(featured.storage_path) ?? undefined : undefined,
    inline: inline.map((row) => ({ url: publicUrl(row.storage_path) ?? row.storage_path, alt: row.alt_text ?? "Inline image" }))
  };
}

function mapRowToPost(row: BlogRow, media: { featured?: string; inline: BlogInlineImage[] }): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    tags: row.tags ?? [],
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    featuredImage: media.featured,
    inlineImages: media.inline
  };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!supabaseEnvAvailable()) {
    return slug === SAMPLE_POST.slug ? SAMPLE_POST : null;
  }

  try {
    const supabase = getSupabaseClient();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,summary,body,tags,published_at,updated_at,featured_image_id")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (post) {
      const { data: mediaRows } = await supabase
        .from("media_assets")
        .select("id,storage_path,alt_text,source,mime_type")
        .eq("blog_post_id", post.id);

      const media = mapMedia(mediaRows ?? []);
      return mapRowToPost(post, media);
    }
  } catch (err) {
    console.warn("Blog fetch failed, falling back when possible", err);
  }

  if (slug === SAMPLE_POST.slug) return SAMPLE_POST;
  return null;
}

export async function getBlogIndex(): Promise<BlogPost[]> {
  if (!supabaseEnvAvailable()) {
    return [SAMPLE_POST];
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,summary,body,tags,published_at,updated_at,featured_image_id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    if (data && data.length > 0) {
      const posts = await Promise.all(
        data.map(async (row) => {
          const { data: mediaRows } = await supabase
            .from("media_assets")
            .select("id,storage_path,alt_text,source,mime_type")
            .eq("blog_post_id", row.id);
          const media = mapMedia(mediaRows ?? []);
          return mapRowToPost(row, media);
        })
      );
      return posts;
    }
  } catch (err) {
    console.warn("Blog index fetch failed, using fallback", err);
  }

  return [SAMPLE_POST];
}

export function blogUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}
