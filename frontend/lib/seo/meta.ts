import type { Metadata } from "next";

type MetaArgs = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  updatedTime?: string;
  locale?: string;
};

export function buildPageMeta(args: MetaArgs): Metadata {
  const other: Record<string, string> = {};
  if (args.publishedTime) other.published_time = args.publishedTime;
  if (args.updatedTime) other.modified_time = args.updatedTime;

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical: args.url },
    openGraph: {
      type: args.type ?? "website",
      title: args.title,
      description: args.description,
      url: args.url,
      locale: args.locale ?? "en_US",
      images: args.image
        ? [
            {
              url: args.image,
              width: 1200,
              height: 630,
              alt: args.title
            }
          ]
        : undefined
    },
    twitter: {
      card: args.image ? "summary_large_image" : "summary",
      title: args.title,
      description: args.description,
      images: args.image ? [args.image] : undefined
    },
    other: Object.keys(other).length ? other : undefined
  };
}

export function buildArticleSchema(args: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: string;
  updatedTime?: string;
  tags?: string[];
  authorName?: string;
}): Record<string, unknown> {
  const { title, description, url, image, publishedTime, updatedTime, tags, authorName } = args;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: publishedTime,
    dateModified: updatedTime,
    author: authorName ? { "@type": "Person", name: authorName } : undefined,
    mainEntityOfPage: url,
    keywords: tags?.join(", ")
  };

  if (image) {
    schema.image = [{ url: image, width: 1200, height: 630 }];
  }

  return schema;
}
