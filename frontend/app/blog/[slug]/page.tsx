import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blocks/blog-card";
import { getBlogIndex, getBlogPost, blogUrl } from "@/lib/data/blog";
import { buildArticleSchema, buildPageMeta } from "@/lib/seo/meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    return buildPageMeta({
      title: "Blog post",
      description: "Recent updates from Aegontech",
      url: `${SITE_URL}/blog/${slug}`,
      type: "article"
    });
  }

  return buildPageMeta({
    title: post.title,
    description: post.summary,
    url: blogUrl(post.slug),
    image: post.featuredImage,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    updatedTime: post.updatedAt ?? undefined
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const schema = buildArticleSchema({
    title: post.title,
    description: post.summary,
    url: blogUrl(post.slug),
    image: post.featuredImage,
    publishedTime: post.publishedAt ?? undefined,
    updatedTime: post.updatedAt ?? undefined,
    tags: post.tags,
    authorName: "Aegontech"
  });

  const inlineGallery = post.inlineImages ?? [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <link rel="canonical" href={blogUrl(post.slug)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">Blog</p>
        <h1 className="text-4xl font-semibold text-ink" data-testid="blog-title">
          {post.title}
        </h1>
        <p className="text-lg text-slate-600">{post.summary}</p>
        {post.publishedAt ? <p className="text-sm text-slate-500">Published {new Date(post.publishedAt).toDateString()}</p> : null}
        {post.tags.length ? (
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground" data-testid="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {post.featuredImage ? (
        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-auto w-full object-cover"
            loading="lazy"
            data-testid="featured-image"
          />
        </div>
      ) : null}

      <article className="prose prose-lg prose-slate max-w-none pb-10" dangerouslySetInnerHTML={{ __html: post.body }} />

      {inlineGallery.length ? (
        <section className="space-y-4" aria-label="Inline media">
          <h2 className="text-2xl font-semibold text-ink">In the build</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inlineGallery.map((img, idx) => (
              <figure key={img.url + idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" loading="lazy" data-testid="inline-image" />
                <figcaption className="px-4 py-2 text-sm text-slate-600">{img.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 space-y-3" aria-label="More posts">
        <h2 className="text-xl font-semibold text-ink">More from the studio</h2>
        <RelatedPosts currentSlug={post.slug} />
      </section>
    </main>
  );
}

async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const posts = await getBlogIndex();
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {others.map((post) => (
        <BlogCard
          key={post.slug}
          title={post.title}
          summary={post.summary}
          href={`/blog/${post.slug}`}
          tag={post.tags[0]}
          publishedAt={post.publishedAt ?? undefined}
        />
      ))}
    </div>
  );
}
