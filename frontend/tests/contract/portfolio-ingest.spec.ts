import { describe, expect, it, beforeEach, vi } from "vitest";

const portfolioUpserts: any[] = [];
const mediaUpserts: any[] = [];

const supabaseMock = {
  from: vi.fn((table: string) => {
    if (table === "portfolio_items") {
      return {
        upsert: vi.fn((payload: any) => {
          portfolioUpserts.push(payload);
          return {
            select: () => ({
              single: async () => ({ data: { id: "item-123", ...payload }, error: null })
            })
          };
        })
      };
    }
    if (table === "media_assets") {
      return {
        upsert: vi.fn((payload: any) => {
          mediaUpserts.push(payload);
          return { data: payload, error: null };
        })
      };
    }
    if (table === "audit_logs") {
      return {
        insert: vi.fn(() => ({ data: null, error: null }))
      };
    }
    return { upsert: vi.fn(() => ({ data: null, error: null })) };
  })
};

vi.mock("@/lib/supabase/client", () => ({
  getServiceRoleClient: () => supabaseMock
}));

vi.mock("@/lib/supabase/admin-session", () => ({
  requireAdminSession: vi.fn(async () => ({ userId: "admin-1", email: "admin@example.com" }))
}));

vi.mock("@/lib/ingestion/app-store", () => ({
  fetchAppStoreMetadata: vi.fn(async () => ({ id: "app-1", title: "App", summary: "Summary" }))
}));

vi.mock("@/lib/ingestion/browserless", () => ({
  fetchScreenshot: vi.fn(async () => ({ buffer: Buffer.from("abc"), mimeType: "image/png", checksum: "abc" }))
}));

vi.mock("@/lib/ingestion/media", () => ({
  uploadToPublicBucket: vi.fn(async () => ({ path: "portfolio/path.png", checksum: "abc" }))
}));

vi.mock("@/lib/observability/logging", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  withCorrelationId: (id?: string) => id ?? "corr-test"
}));

vi.mock("@/lib/observability/audit", () => ({
  writeAuditLog: vi.fn(async () => null)
}));

import { POST } from "@/app/api/portfolio/ingest/route";

function buildRequest(body: any) {
  return new Request("http://localhost/api/portfolio/ingest", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer test"
    },
    body: JSON.stringify(body)
  });
}

describe("/api/portfolio/ingest", () => {
  beforeEach(() => {
    portfolioUpserts.length = 0;
    mediaUpserts.length = 0;
  });

  it("marks needs_attention when screenshot capture fails but still upserts", async () => {
    const { fetchScreenshot } = await import("@/lib/ingestion/browserless");
    // @ts-expect-error mock rewrite
    fetchScreenshot.mockRejectedValueOnce(new Error("shot fail"));

    const res = await POST(buildRequest({ sourceUrl: "https://example.com", type: "web" }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.needsAttention).toBe(true);
    expect(portfolioUpserts).toHaveLength(1);
    expect(portfolioUpserts[0].status).toBe("needs_attention");
  });

  it("is idempotent for duplicate sourceUrl", async () => {
    const res1 = await POST(buildRequest({ sourceUrl: "https://example.com/x", type: "web" }));
    const res2 = await POST(buildRequest({ sourceUrl: "https://example.com/x", type: "web" }));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(portfolioUpserts.length).toBe(2);
  });
});
