import { beforeEach, describe, expect, it, vi } from "vitest";

const blogInserts: any[] = [];
const mediaInserts: any[] = [];
const auditInserts: any[] = [];
const seenSlugs = new Set<string>();

const supabaseMock = {
  from: vi.fn((table: string) => {
    if (table === "blog_posts") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn((_, slug: string) => ({
            maybeSingle: vi.fn(async () => ({
              data: seenSlugs.has(slug) ? { id: `blog-${slug}` } : null,
              error: null
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({ data: null, error: null }))
        })),
        insert: vi.fn((payload: any) => {
          const slug = payload?.slug;
          if (slug && seenSlugs.has(slug)) {
            return {
              select: () => ({ single: async () => ({ data: null, error: { code: "23505", message: "duplicate slug" } }) })
            };
          }
          if (slug) seenSlugs.add(slug);
          blogInserts.push(payload);
          return {
            select: () => ({ single: async () => ({ data: { id: `blog-${blogInserts.length}`, ...payload }, error: null }) })
          };
        })
      };
    }
    if (table === "media_assets") {
      return {
        insert: vi.fn((payload: any) => {
          mediaInserts.push(payload);
          return {
            select: () => ({ single: async () => ({ data: { id: `media-${mediaInserts.length}`, ...payload }, error: null }) })
          };
        })
      };
    }
    if (table === "audit_logs") {
      return {
        insert: vi.fn((payload: any) => {
          auditInserts.push(payload);
          return { data: payload, error: null };
        })
      };
    }
    if (table === "api_keys") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: { id: "key-1", hashed_key: "abc", scope: "blog_ingest", status: "active" },
                error: null
              }))
            })),
            maybeSingle: vi.fn(async () => ({
              data: { id: "key-1", hashed_key: "abc", scope: "blog_ingest", status: "active" },
              error: null
            }))
          }))
        }))
      };
    }
    return { insert: vi.fn(() => ({ data: null, error: null })) };
  })
};

vi.mock("@/lib/supabase/client", () => ({
  getServiceRoleClient: () => supabaseMock
}));

vi.mock("@/lib/supabase/keys", () => ({
  verifyApiKey: (raw: string, hashed: string) => raw === hashed
}));

vi.mock("@/lib/ingestion/media", () => ({
  uploadToPublicBucket: vi.fn(async ({ buffer }: any) => ({ path: `blog/${buffer.toString()}.png`, checksum: "zzz" }))
}));

vi.mock("@/lib/observability/logging", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  withCorrelationId: (id?: string) => id ?? "corr-blog"
}));

vi.mock("@/lib/observability/audit", () => ({
  writeAuditLog: vi.fn(async () => null)
}));

import { POST } from "@/app/api/blog/ingest/route";

function buildRequest(body: any, key = "abc") {
  return new Request("http://localhost/api/blog/ingest", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key
    },
    body: JSON.stringify(body)
  });
}

function mockFetch(size = 1024, contentType = "image/png") {
  global.fetch = vi.fn(async () => ({
    ok: true,
    headers: new Map([["content-type", contentType]]),
    arrayBuffer: async () => new ArrayBuffer(size)
  })) as any;
}

describe("/api/blog/ingest", () => {
  beforeEach(() => {
    blogInserts.length = 0;
    mediaInserts.length = 0;
    auditInserts.length = 0;
    seenSlugs.clear();
    mockFetch();
  });

  it("rejects invalid key", async () => {
    const res = await POST(buildRequest({ title: "t", slug: "s", summary: "s", body: "b", tags: [], images: [] }, "bad"));
    expect(res.status).toBe(401);
  });

  it("rejects missing required fields", async () => {
    const res = await POST(buildRequest({ slug: "s", summary: "s", body: "b", tags: [], images: [] }));
    expect(res.status).toBe(400);
  });

  it("rejects duplicate slug", async () => {
    const payload = { title: "t", slug: "dup", summary: "s", body: "b", tags: [], images: [] };
    const first = await POST(buildRequest(payload));
    expect(first.status).toBe(200);
    const second = await POST(buildRequest(payload));
    expect(second.status).toBe(409);
  });

  it("rejects oversized images", async () => {
    mockFetch(2_500_000);
    const res = await POST(
      buildRequest({
        title: "big",
        slug: "big-img",
        summary: "sum",
        body: "body",
        tags: ["a"],
        featuredImage: "https://example.com/img.png",
        images: [{ url: "https://example.com/img.png", alt: "alt" }]
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates blog with images and marks published", async () => {
    const res = await POST(
      buildRequest({
        title: "t",
        slug: "s",
        summary: "sum",
        body: "body",
        tags: ["a"],
        featuredImage: "https://example.com/img.png",
        images: [{ url: "https://example.com/img.png", alt: "alt" }]
      })
    );
    expect(res.status).toBe(200);
    expect(blogInserts[0].status).toBe("published");
    expect(mediaInserts.length).toBeGreaterThan(0);
  });
});
