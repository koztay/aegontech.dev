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

  // Header metadata (plain text, not markdown headers)
  lines.push("Title: AegonTech API Documentation");
  lines.push("Description: Public APIs for accessing AegonTech blog posts, portfolio items, and services");
  lines.push(`URL: ${siteUrl}`);
  lines.push(`Version: 1.0.0`);
  lines.push(`Last Updated: ${new Date().toISOString()}`);
  lines.push("");

  // API Endpoints section
  lines.push("API Endpoints:");

  for (const endpoint of API_ENDPOINTS) {
    let endpointLine = `- ${endpoint.url}: ${endpoint.method} - ${endpoint.description}`;
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      endpointLine += `. Parameters: ${endpoint.parameters.map(p =>
        `${p.name} (${p.type}, ${p.required ? "required" : "optional"}): ${p.description}`
      ).join(", ")}`;
    }
    
    if (typeof endpoint.response === "string") {
      endpointLine += `. Response: ${endpoint.response}`;
    } else {
      endpointLine += `. Response: ${endpoint.response.type} with fields ${endpoint.response.fields.join(", ")}`;
    }
    
    lines.push(endpointLine);
  }

  lines.push("");

  // Data Schemas section
  lines.push("Data Schemas:");

  for (const [schemaName, schema] of Object.entries(DATA_SCHEMAS)) {
    lines.push(`- ${schemaName}: ${schema.fields.join(", ")}`);
  }

  lines.push("");

  // Authentication section
  lines.push("Authentication:");
  lines.push("- Type: none (Public APIs do not require authentication)");
  lines.push("");

  // Rate Limiting section
  lines.push("Rate Limiting:");
  lines.push("- 100 requests per hour per IP address");
  lines.push("");

  // Important URLs section
  lines.push("Important URLs:");
  lines.push(`- Home: ${siteUrl}`);
  lines.push(`- Blog: ${siteUrl}/blog`);
  lines.push(`- Portfolio: ${siteUrl}/portfolio`);
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
