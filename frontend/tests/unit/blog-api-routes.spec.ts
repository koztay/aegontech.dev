import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "./helpers/supabase-mock";

vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);

const authed = { "x-api-key": "secret", "content-type": "application/json" };
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  db.reset();
  process.env.ADMIN_PASSWORD = "secret";
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe("GET /api/blog/titles", () => {
  it("returns { titles } for published posts, newest first, capped at 50", async () => {
    db.queue("blog_posts", { data: [{ title: "A", slug: "a" }] });
    const { GET } = await import("@/app/api/blog/titles/route");
    const { NextRequest } = await import("next/server");
    const res = await GET(new NextRequest("http://localhost/api/blog/titles?limit=999", { headers: authed }));
    expect(await res.json()).toEqual({ titles: [{ title: "A", slug: "a" }] });
    expect(db.find("blog_posts", "select")[0]).toEqual(["title, slug"]);
    expect(db.find("blog_posts", "eq")[0]).toEqual(["status", "published"]);
    expect(db.find("blog_posts", "order")[0]).toEqual(["published_at", { ascending: false }]);
    expect(db.find("blog_posts", "limit")[0]).toEqual([50]);
  });
  it("401 without auth, 500 on db error", async () => {
    const { GET } = await import("@/app/api/blog/titles/route");
    const { NextRequest } = await import("next/server");
    expect((await GET(new NextRequest("http://localhost/api/blog/titles"))).status).toBe(401);
    db.queue("blog_posts", { error: { message: "x" } });
    const res = await GET(new NextRequest("http://localhost/api/blog/titles", { headers: authed }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to fetch blog titles" });
  });
});

describe("POST /api/blog/publish", () => {
  const body = { title: "T", slug: "t", excerpt: "e", content: "c" };
  it("inserts as published and returns the camelCase post shape", async () => {
    db.queue("blog_posts", { data: { id: "i", title: "T", slug: "t", excerpt: "e", content: "c", featured_image: "https://picsum.photos/800/400", published_at: "2026-05-01T10:00:00+00:00", status: "published" } });
    const { POST } = await import("@/app/api/blog/publish/route");
    const res = await POST(new Request("http://x", { method: "POST", headers: authed, body: JSON.stringify(body) }));
    expect(await res.json()).toEqual({
      success: true,
      post: { id: "i", title: "T", slug: "t", excerpt: "e", content: "c", featuredImage: "https://picsum.photos/800/400", publishedAt: "2026-05-01T10:00:00.000Z", status: "published" },
    });
    const ins = db.find("blog_posts", "insert")[0][0];
    expect(ins).toMatchObject({ title: "T", status: "published", featured_image: "https://picsum.photos/800/400" });
    expect(typeof ins.published_at).toBe("string");
    expect(db.find("blog_posts", "select")[0]).toEqual(["id, title, slug, excerpt, content, featured_image, published_at, status"]);
  });
  it("400 on missing fields, 401 unauthorised, 500 on error", async () => {
    const { POST } = await import("@/app/api/blog/publish/route");
    expect((await POST(new Request("http://x", { method: "POST", headers: authed, body: JSON.stringify({ title: "x" }) }))).status).toBe(400);
    expect((await POST(new Request("http://x", { method: "POST", body: "{}" }))).status).toBe(401);
    db.queue("blog_posts", { error: { message: "dup" } });
    const res = await POST(new Request("http://x", { method: "POST", headers: authed, body: JSON.stringify(body) }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to publish blog post" });
  });
});

describe("GET /api/data/blog", () => {
  const row = { id: "1", slug: "s", title: "t", excerpt: "e", content: "c", featured_image: "f", published_at: "2026-03-04T05:06:07+00:00", status: "published", created_at: "2026-03-04T05:06:07+00:00" };
  it("returns paginated { data, total, page, limit, totalPages } with Date-serialised publishedAt", async () => {
    db.queue("blog_posts", { count: 13, data: null }, { data: [row] });
    const { GET } = await import("@/app/api/data/blog/route");
    const res = await GET(new Request("http://localhost/api/data/blog?page=2&limit=6"));
    expect(await res.json()).toEqual({
      data: [{ id: "1", slug: "s", title: "t", excerpt: "e", content: "c", featuredImage: "f", publishedAt: "2026-03-04T05:06:07.000Z", status: "published" }],
      total: 13, page: 2, limit: 6, totalPages: 3,
    });
    expect(db.find("blog_posts", "select")[0]).toEqual(["*", { count: "exact", head: true }]);
    expect(db.find("blog_posts", "range")[0]).toEqual([6, 11]);
  });
  it("clamps page/limit and 500s on error", async () => {
    db.queue("blog_posts", { count: 0 }, { data: [] });
    const { GET } = await import("@/app/api/data/blog/route");
    const res = await GET(new Request("http://localhost/api/data/blog?page=-4&limit=5000"));
    expect(await res.json()).toMatchObject({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
    expect(db.find("blog_posts", "range")[0]).toEqual([0, 99]);
    db.reset(); db.queue("blog_posts", { error: { message: "x" } });
    const bad = await GET(new Request("http://localhost/api/data/blog"));
    expect(bad.status).toBe(500);
    expect(await bad.json()).toEqual({ error: "Failed to fetch blog posts" });
  });
});
