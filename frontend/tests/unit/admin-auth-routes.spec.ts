import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { db } from "./helpers/supabase-mock";
import { setAuthEnv, validCookie, FAKE_COOKIE, TEST_ADMIN_PASSWORD, TEST_INTERNAL_SECRET } from "./helpers/auth";

const storage = vi.hoisted(() => ({
  removeObject: vi.fn(async () => undefined),
  getPublicUrl: vi.fn((k: string) => `https://pub/${k}`),
  putObject: vi.fn(async () => undefined),
  statObject: vi.fn(async () => ({ size: 1, etag: "e", metaData: { "content-type": "image/png" } })),
  presignPut: vi.fn(async () => "https://signed/upload"),
  ensureBucketExists: vi.fn(async () => undefined),
}));
const logAudit = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
vi.mock("@/lib/storage/supabase-storage", () => storage);
vi.mock("@/lib/observability/audit", () => ({ logAudit }));

type Handler = (req: Request, ctx?: any) => Promise<Response>;
const ctx = { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }) };

// Every exported HTTP handler of every guarded route: [label, loader, method]
const routes: Array<[string, () => Promise<Record<string, Handler>>, string]> = [
  ["admin/blog", () => import("@/app/api/admin/blog/route") as any, "POST"],
  ["admin/blog/[id]", () => import("@/app/api/admin/blog/[id]/route") as any, "GET"],
  ["admin/blog/[id]", () => import("@/app/api/admin/blog/[id]/route") as any, "PUT"],
  ["admin/blog/[id]", () => import("@/app/api/admin/blog/[id]/route") as any, "DELETE"],
  ["admin/portfolio", () => import("@/app/api/admin/portfolio/route") as any, "POST"],
  ["admin/portfolio/[id]", () => import("@/app/api/admin/portfolio/[id]/route") as any, "GET"],
  ["admin/portfolio/[id]", () => import("@/app/api/admin/portfolio/[id]/route") as any, "PUT"],
  ["admin/portfolio/[id]", () => import("@/app/api/admin/portfolio/[id]/route") as any, "PATCH"],
  ["admin/portfolio/[id]", () => import("@/app/api/admin/portfolio/[id]/route") as any, "DELETE"],
  ["media/presign", () => import("@/app/api/media/presign/route") as any, "POST"],
  ["media/finalize", () => import("@/app/api/media/finalize/route") as any, "POST"],
  ["media/proxy", () => import("@/app/api/media/proxy/route") as any, "POST"],
  ["media/list", () => import("@/app/api/media/list/route") as any, "GET"],
  ["media/delete", () => import("@/app/api/media/delete/route") as any, "POST"],
  ["media/upload", () => import("@/app/api/media/upload/route") as any, "POST"],
  ["blog/publish", () => import("@/app/api/blog/publish/route") as any, "POST"],
  ["blog/titles", () => import("@/app/api/blog/titles/route") as any, "GET"],
];

function mkReq(method: string, headers: Record<string, string> = {}) {
  const init: RequestInit = { method, headers: { "content-type": "application/json", ...headers } };
  if (method !== "GET") init.body = JSON.stringify({ title: "t", slug: "s", excerpt: "e", content: "c", objectKey: "k", altText: "a", published: true, filename: "f.png", contentType: "image/png", sizeBytes: 10 });
  return new Request("http://localhost/api/x", init);
}

function noSideEffects() {
  expect(db.client.from).not.toHaveBeenCalled();
  for (const fn of Object.values(storage)) expect(fn).not.toHaveBeenCalled();
  expect(logAudit).not.toHaveBeenCalled();
}

let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  setAuthEnv();
  db.reset();
  vi.clearAllMocks();
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe("every exported handler rejects unauthenticated requests before any effect", () => {
  it("covers 17 route/method pairs", () => expect(routes).toHaveLength(17));

  for (const [label, load, method] of routes) {
    for (const [credName, headers] of [["no credentials", {}], ["fake cookie admin_session=x", { cookie: FAKE_COOKIE }]] as const) {
      it(`${method} ${label} -> 401 with ${credName}`, async () => {
        const handler = (await load())[method];
        expect(typeof handler).toBe("function");
        const req = mkReq(method, headers);
        const res = await handler(req, ctx);
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "Unauthorized" });
        expect(res.headers.get("cache-control")).toBe("no-store");
        expect(req.bodyUsed).toBe(false);
        noSideEffects();
      });
    }
  }

  it("wrong x-api-key and wrong x-internal-secret are rejected too", async () => {
    const { POST } = await import("@/app/api/blog/publish/route");
    for (const h of [{ "x-api-key": "nope" }, { "x-internal-secret": "nope" }]) {
      expect((await POST(mkReq("POST", h))).status).toBe(401);
    }
    noSideEffects();
  });

  it("modules do not export unguarded extra HTTP methods", async () => {
    const http = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    const exported = new Map<string, Set<string>>();
    for (const [label, load, method] of routes) {
      const m = await load();
      const set = exported.get(label) ?? new Set();
      set.add(method);
      exported.set(label, set);
      for (const k of Object.keys(m).filter((k) => http.includes(k))) {
        expect(exported.get(label)!.has(k) || routes.some(([l, , mm]) => l === label && mm === k)).toBe(true);
      }
    }
  });
});

describe("valid credentials still work", () => {
  it("admin blog create (signed cookie)", async () => {
    const { POST } = await import("@/app/api/admin/blog/route");
    db.queue("blog_posts", { data: { id: "b1", title: "t", created_at: "2026-01-01T00:00:00Z" } });
    const res = await POST(mkReq("POST", { cookie: await validCookie() }));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("b1");
  });

  it("admin portfolio create (signed cookie)", async () => {
    const { POST } = await import("@/app/api/admin/portfolio/route");
    db.queue("portfolio_items", { data: { id: "p1", created_at: "2026-01-01T00:00:00Z" } });
    const res = await POST(mkReq("POST", { cookie: await validCookie() }));
    expect(res.status).toBe(200);
  });

  it("audit actor label comes from requireAdmin (admin cookie vs internal secret)", async () => {
    const { DELETE } = await import("@/app/api/admin/blog/[id]/route");
    db.queue("media_assets", { data: [] }, { data: null });
    db.queue("blog_posts", { data: { id: "b1" } });
    expect((await DELETE(mkReq("DELETE", { cookie: await validCookie() }), ctx)).status).toBe(200);
    expect(logAudit).toHaveBeenLastCalledWith(expect.objectContaining({ action: "blog.delete", actor: "admin" }));

    db.queue("media_assets", { data: [] }, { data: null });
    db.queue("blog_posts", { data: { id: "b1" } });
    expect((await DELETE(mkReq("DELETE", { "x-internal-secret": TEST_INTERNAL_SECRET }), ctx)).status).toBe(200);
    expect(logAudit).toHaveBeenLastCalledWith(expect.objectContaining({ actor: "internal" }));
  });

  it("portfolio PATCH uses requireAdmin actor", async () => {
    const { PATCH } = await import("@/app/api/admin/portfolio/[id]/route");
    db.queue("portfolio_items", { data: { id: "p1", published: true } });
    const res = await PATCH(mkReq("PATCH", { cookie: await validCookie() }), ctx);
    expect(res.status).toBe(200);
    expect(logAudit).toHaveBeenLastCalledWith(expect.objectContaining({ action: "portfolio.publish", actor: "admin" }));
  });

  it("media list (signed cookie)", async () => {
    const { GET } = await import("@/app/api/media/list/route");
    db.queue("media_assets", { data: [] });
    const res = await GET(new Request("http://localhost/api/media/list", { headers: { cookie: await validCookie() } }));
    expect(res.status).toBe(200);
  });

  it("media presign (signed cookie)", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(mkReq("POST", { cookie: await validCookie() }));
    expect(res.status).toBe(200);
    expect(storage.presignPut).toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ actor: "admin" }));
  });

  it("blog titles and publish accept x-api-key", async () => {
    const titles = await import("@/app/api/blog/titles/route");
    db.queue("blog_posts", { data: [{ title: "a", slug: "a" }] });
    const r1 = await titles.GET(new NextRequest("http://localhost/api/blog/titles", { headers: { "x-api-key": TEST_ADMIN_PASSWORD } }));
    expect(r1.status).toBe(200);

    const publish = await import("@/app/api/blog/publish/route");
    db.queue("blog_posts", { data: { id: "1", title: "t", slug: "s", excerpt: "e", content: "c", featured_image: null, published_at: "2026-01-01T00:00:00Z", status: "published" } });
    const r2 = await publish.POST(mkReq("POST", { "x-api-key": TEST_ADMIN_PASSWORD }));
    expect(r2.status).toBe(200);
  });
});
