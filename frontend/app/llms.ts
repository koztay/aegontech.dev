/**
 * llms.txt generator for AegonTech API documentation
 * Provides structured information about public APIs for LLM consumption
 */

// ==================
// Type Definitions
// ==================

/**
 * Schema for BlogPost objects
 */
interface BlogPostSchema {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishedAt: string;
  status: "draft" | "published";
}

/**
 * Schema for PortfolioItem objects
 */
interface PortfolioItemSchema {
  id: string;
  title: string;
  description: string;
  type: "saas" | "mobile";
  screenshot: string;
  links: {
    website?: string;
    appStore?: string;
    playStore?: string;
  };
}

/**
 * Schema for Service objects
 */
interface ServiceSchema {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * API endpoint documentation
 */
interface ApiEndpoint {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: Record<string, unknown> | string;
}

/**
 * Authentication information
 */
interface Authentication {
  type: string;
  description: string;
}

/**
 * Rate limiting information
 */
interface RateLimit {
  requestsPerHour: number;
  per: string;
}

/**
 * Main llms.txt structure
 */
interface LlmsTxt {
  title: string;
  description: string;
  url: string;
  version: string;
  lastUpdated: string;
  endpoints: ApiEndpoint[];
  schemas: {
    BlogPost: BlogPostSchema;
    PortfolioItem: PortfolioItemSchema;
    Service: ServiceSchema;
  };
  authentication: Authentication;
  rateLimit: RateLimit;
}

// ==================
// API Endpoint Definitions
// ==================

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    url: "/api/data/blog",
    method: "GET",
    description: "Retrieve all published blog posts",
    response: {
      type: "Array<BlogPost>",
      fields: ["id", "slug", "title", "excerpt", "content", "featuredImage", "publishedAt", "status"],
    },
  },
  {
    url: "/api/data/blog/{slug}",
    method: "GET",
    description: "Retrieve a specific blog post by slug",
    parameters: [
      {
        name: "slug",
        type: "string",
        required: true,
        description: "The unique slug identifier for the blog post",
      },
    ],
    response: "BlogPost object",
  },
  {
    url: "/api/data/portfolio",
    method: "GET",
    description: "Retrieve all portfolio items",
    response: {
      type: "Array<PortfolioItem>",
      fields: ["id", "title", "description", "type", "screenshot", "links"],
    },
  },
  {
    url: "/api/data/services",
    method: "GET",
    description: "Retrieve all services offered",
    response: {
      type: "Array<Service>",
      fields: ["id", "icon", "title", "description"],
    },
  },
];

// ==================
// Data Schemas
// ==================

const DATA_SCHEMAS = {
  BlogPost: {
    id: "string",
    slug: "string",
    title: "string",
    excerpt: "string",
    content: "string",
    featuredImage: "string",
    publishedAt: "string",
    status: "draft" as const,
  } as unknown as BlogPostSchema,
  PortfolioItem: {
    id: "string",
    title: "string",
    description: "string",
    type: "saas" as const,
    screenshot: "string",
    links: {
      website: undefined,
      appStore: undefined,
      playStore: undefined,
    },
  } as unknown as PortfolioItemSchema,
  Service: {
    id: "string",
    icon: "string",
    title: "string",
    description: "string",
  } as ServiceSchema,
};

// ==================
// Main Export
// ==================

export default function llms(): LlmsTxt {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

  // Remove trailing slash from base URL for consistency
  const siteUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return {
    title: "AegonTech API Documentation",
    description: "Public APIs for accessing AegonTech blog posts, portfolio items, and services",
    url: siteUrl,
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    endpoints: API_ENDPOINTS,
    schemas: DATA_SCHEMAS,
    authentication: {
      type: "none",
      description: "Public APIs do not require authentication",
    },
    rateLimit: {
      requestsPerHour: 100,
      per: "IP address",
    },
  };
}
