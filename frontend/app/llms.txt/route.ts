/**
 * llms.txt API route for AegonTech API documentation
 * Provides structured information about public APIs for LLM consumption
 *
 * Format specification: https://llmstxt.org/
 */

import { NextResponse } from 'next/server'

// ==================
// API Endpoint Definitions
// ==================

const API_ENDPOINTS = [
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
    fields: ["id", "slug", "title", "excerpt", "content", "featuredImage", "publishedAt", "status"],
  },
  PortfolioItem: {
    fields: ["id", "title", "description", "type", "screenshot", "links"],
  },
  Service: {
    fields: ["id", "icon", "title", "description"],
  },
};

// ==================
// Generate llms.txt Content
// ==================

function generateLlmsTxt(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.aegontech.dev";

  // Remove trailing slash from base URL for consistency
  const siteUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const lines: string[] = [];

  // H1 header - MUST be the first element
  lines.push("# AegonTech API Documentation");
  lines.push("");

  // Blockquote for description
  lines.push("> AegonTech provides public APIs for accessing blog posts, portfolio items, and services. All endpoints return JSON data and require no authentication.");
  lines.push("");

  // API Endpoints section (H2)
  lines.push("## API Endpoints");
  lines.push("");
  lines.push(`- [Blog Posts API](${siteUrl}/api/data/blog): GET - Retrieve all published blog posts with pagination support`);
  lines.push(`- [Blog Post by Slug](${siteUrl}/api/data/blog/{slug}): GET - Retrieve a specific blog post by its slug`);
  lines.push(`- [Portfolio Items API](${siteUrl}/api/data/portfolio): GET - Retrieve all portfolio items`);
  lines.push(`- [Services API](${siteUrl}/api/data/services): GET - Retrieve all services offered`);
  lines.push("");

  // Important Pages section (H2)
  lines.push("## Important Pages");
  lines.push("");
  lines.push(`- [Home Page](${siteUrl}): Main landing page`);
  lines.push(`- [Blog](${siteUrl}/blog): All blog posts with pagination`);
  lines.push(`- [Portfolio](${siteUrl}/portfolio): Portfolio showcase`);
  lines.push("");

  // Authentication section (H2)
  lines.push("## Authentication");
  lines.push("No authentication required for public APIs.");
  lines.push("");

  // Rate Limiting section (H2)
  lines.push("## Rate Limiting");
  lines.push("100 requests per hour per IP address.");
  lines.push("");

  return lines.join("\n");
}

// ==================
// API Route Handler
// ==================

export async function GET() {
  const content = generateLlmsTxt();
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
