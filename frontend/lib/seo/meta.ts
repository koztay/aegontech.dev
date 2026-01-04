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

export function buildWebsiteSchema(args: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  searchAction?: boolean;
}): Record<string, unknown> {
  const { name, description, url, logo, searchAction } = args;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name,
      url
    }
  };

  if (logo) {
    schema.publisher = {
      "@type": "Organization",
      name,
      url,
      logo: {
        "@type": "ImageObject",
        url: logo
      }
    };
  }

  if (searchAction) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    };
  }

  return schema;
}

export function buildLocalBusinessSchema(args: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  type?: "SoftwareCompany" | "ProfessionalService";
  email?: string;
  phone?: string;
  sameAs?: string[];
  areaServed?: string;
}): Record<string, unknown> {
  const { name, description, url, logo, type, email, phone, sameAs, areaServed } = args;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type || "SoftwareCompany",
    name,
    description,
    url
  };

  if (logo) {
    schema.logo = {
      "@type": "ImageObject",
      url: logo
    };
  }

  if (email) {
    schema.email = email;
  }

  if (phone) {
    schema.telephone = phone;
  }

  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (areaServed) {
    schema.areaServed = {
      "@type": "Place",
      name: areaServed
    };
  }

  return schema;
}

export function buildBreadcrumbSchema(args: {
  items: Array<{
    name: string;
    url: string;
  }>;
}): Record<string, unknown> {
  const { items } = args;
  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };
}

export function buildCreativeWorkSchema(args: {
  name: string;
  description: string;
  url: string;
  image?: string;
  dateCreated?: string;
  dateModified?: string;
  author?: string;
  keywords?: string[];
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}): Record<string, unknown> {
  const { name, description, url, image, dateCreated, dateModified, author, keywords, applicationCategory, operatingSystem, offers } = args;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url
  };

  if (image) {
    schema.image = {
      "@type": "ImageObject",
      url: image
    };
  }

  if (dateCreated) {
    schema.dateCreated = dateCreated;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (author) {
    schema.author = {
      "@type": "Organization",
      name: author
    };
  }

  if (keywords && keywords.length > 0) {
    schema.keywords = keywords.join(", ");
  }

  if (applicationCategory) {
    schema.applicationCategory = applicationCategory;
  }

  if (operatingSystem) {
    schema.operatingSystem = operatingSystem;
  }

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      ...offers
    };
  }

  return schema;
}
