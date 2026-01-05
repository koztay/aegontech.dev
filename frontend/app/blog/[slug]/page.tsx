import { BlogDetail } from "@/components/blog";
import { PublicShell } from "@/components/shell/PublicShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/meta";
import type { Metadata } from "next";
import { getBlogPost } from "@/lib/data/blog";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return buildPageMeta({
      title: "Blog Post Not Found - Aegontech.dev",
      description: "The requested blog post could not be found.",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aegontech.dev'}/blog/${slug}`,
    });
  }

  return buildPageMeta({
    title: `${post.title} - Aegontech.dev`,
    description: post.excerpt || post.content?.substring(0, 160) || "Read this insightful article from Aegontech",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aegontech.dev'}/blog/${slug}`,
    image: post.featuredImage,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  // Build Article schema
  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160) || "",
    url: `${SITE_URL}/blog/${slug}`,
    image: post.featuredImage,
    publishedTime: post.publishedAt,
    updatedTime: undefined,
    tags: undefined,
    authorName: undefined
  });

  // Build BreadcrumbList schema
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "Home", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: post.title, url: `${SITE_URL}/blog/${slug}` }
    ]
  });

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <PublicShell navigationItems={navigationItems} currentPath="/blog">
      <JsonLd schema={articleSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <BlogDetail post={post} onBack={() => {}} />
    </PublicShell>
  );
}
