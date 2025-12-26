import type { Metadata } from "next";
import { BlogCard } from "@/components/blocks/blog-card";
import { getBlogIndex, blogUrl } from "@/lib/data/blog";
import { buildPageMeta } from "@/lib/seo/meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";
export const revalidate = 300;

export const metadata: Metadata = buildPageMeta({
  title: "Blog | Aegontech",
  description: "Insights on mobile, SaaS, and velocity from the Aegontech studio.",
  url: `${SITE_URL}/blog`
});

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function BlogIndexPage({ searchParams }: Props) {
  const posts = await getBlogIndex();
  const { tag: tagParam } = await searchParams;
  const tag = tagParam?.toLowerCase();
  const filtered = tag ? posts.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag)) : posts;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">Blog</p>
        <h1 className="text-4xl font-semibold text-ink">Inside the studio</h1>
        <p className="text-lg text-slate-600">Launch notes, playbooks, and lessons from shipping mobile and SaaS products fast.</p>
        {tag ? <p className="text-sm text-slate-500">Filtering by tag: {tag}</p> : null}
      </header>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Blog posts">
        {filtered.map((post) => (
          <BlogCard
            key={post.slug}
            title={post.title}
            summary={post.summary}
            href={`/blog/${post.slug}`}
            tag={post.tags[0]}
            publishedAt={post.publishedAt ?? undefined}
          />
        ))}
      </section>
    </main>
  );
}
