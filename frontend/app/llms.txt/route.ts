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

  // Header
  lines.push("# Title: AegonTech API Documentation");
  lines.push("# Description: Public APIs for accessing AegonTech blog posts, portfolio items, and services");
  lines.push(`# URL: ${siteUrl}`);
  lines.push(`# Version: 1.0.0`);
  lines.push(`# Last Updated: ${new Date().toISOString()}`);
  lines.push("");

  // API Endpoints section
  lines.push("## API Endpoints");
  lines.push("");

  for (const endpoint of API_ENDPOINTS) {
    lines.push(`### ${endpoint.url}`);
    lines.push(`Method: ${endpoint.method}`);
    lines.push(`Description: ${endpoint.description}`);
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      lines.push("Parameters:");
      for (const param of endpoint.parameters) {
        lines.push(`  - ${param.name} (${param.type}, ${param.required ? "required" : "optional"}): ${param.description}`);
      }
    }
    
    if (typeof endpoint.response === "string") {
      lines.push(`Response: ${endpoint.response}`);
    } else {
      lines.push(`Response Type: ${endpoint.response.type}`);
      lines.push(`Response Fields: ${endpoint.response.fields.join(", ")}`);
    }
    
    lines.push("");
  }

  // Data Schemas section
  lines.push("## Data Schemas");
  lines.push("");

  for (const [schemaName, schema] of Object.entries(DATA_SCHEMAS)) {
    lines.push(`### ${schemaName}`);
    lines.push(`Fields: ${schema.fields.join(", ")}`);
    lines.push("");
  }

  // Authentication section
  lines.push("## Authentication");
  lines.push("Type: none");
  lines.push("Description: Public APIs do not require authentication");
  lines.push("");

  // Rate Limiting section
  lines.push("## Rate Limiting");
  lines.push("Requests per hour: 100");
  lines.push("Per: IP address");
  lines.push("");

  // Important URLs section
  lines.push("## Important URLs");
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
