import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "./helpers/supabase-mock";
import { validCookie } from "./helpers/auth";

const COOKIE = await validCookie();

vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
const removeObject = vi.fn(async (_k: string) => undefined);
vi.mock("@/lib/storage/supabase-storage", () => ({ removeObject, getPublicUrl: (k: string) => `https://pub/${k}` }));
const logAudit = vi.fn(async (_a: any) => "cid");
vi.mock("@/lib/observability/audit", () => ({ logAudit }));

const blogRow = { id: "b1", title: "T", slug: "t", excerpt: "e", content: "c", featured_image: "f", status: "published", published_at: "2026-02-03T04:05:06+00:00", created_at: "2026-01-01T00:00:00+00:00" };
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (method: string, body: any, headers: Record<string, string> = {}) =>
  new Request("http://localhost/x", { method, headers: { "content-type": "application/json", cookie: COOKIE, ...headers }, body: JSON.stringify(body) });

let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => { db.reset(); vi.clearAllMocks(); errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => errSpy.mockRestore());

describe("/api/admin/blog", () => {
  it("POST inserts and returns the row (Date-typed timestamps serialise as ISO)", async () => {
    db.queue("blog_posts", { data: blogRow });
    const { POST } = await import("@/app/api/admin/blog/route");
    const res = await POST(json("POST", { title: "T", slug: "t", excerpt: "e", content: "c", featured_image: "f", status: "published" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ...blogRow, published_at: "2026-02-03T04:05:06.000Z", created_at: "2026-01-01T00:00:00.000Z" });
    const [ins] = db.find("blog_posts", "insert");
    expect(ins[0]).toMatchObject({ title: "T", slug: "t", status: "published" });
    expect(typeof ins[0].published_at).toBe("string");
    expect(db.find("blog_posts", "single")).toHaveLength(1);
  });
  it("POST stores null published_at for drafts and null for absent optional fields", async () => {
    db.queue("blog_posts", { data: blogRow });
    const { POST } = await import("@/app/api/admin/blog/route");
    await POST(json("POST", { title: "T", slug: "t", excerpt: "e", content: "c", featured_image: "f", status: "draft" }));
    expect(db.find("blog_posts", "insert")[0][0].published_at).toBeNull();
    db.reset(); db.queue("blog_posts", { data: blogRow });
    await POST(json("POST", { title: "T", slug: "t", excerpt: "e", content: "c" }));
    expect(db.find("blog_posts", "insert")[0][0]).toMatchObject({ featured_image: null, status: null, published_at: null });
  });
  it("POST returns 500 { error } on a database error", async () => {
    db.queue("blog_posts", { error: { message: "duplicate key" } });
    const { POST } = await import("@/app/api/admin/blog/route");
    const res = await POST(json("POST", { title: "T", slug: "t" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to create blog post" });
  });
});

describe("/api/admin/blog/[id]", () => {
  it("GET returns the row or 404", async () => {
    const { GET } = await import("@/app/api/admin/blog/[id]/route");
    db.queue("blog_posts", { data: blogRow });
    const ok = await GET(new Request("http://x", { headers: { cookie: COOKIE } }), params("b1"));
    expect(ok.status).toBe(200);
    expect((await ok.json()).id).toBe("b1");
    expect(db.find("blog_posts", "eq")[0]).toEqual(["id", "b1"]);
    db.queue("blog_posts", { data: null });
    const nf = await GET(new Request("http://x", { headers: { cookie: COOKIE } }), params("nope"));
    expect(nf.status).toBe(404);
    expect(await nf.json()).toEqual({ error: "Post not found" });
  });
  it("PUT updates or 404s", async () => {
    const { PUT } = await import("@/app/api/admin/blog/[id]/route");
    db.queue("blog_posts", { data: blogRow });
    const ok = await PUT(json("PUT", { title: "T2", slug: "t", excerpt: "e", content: "c", featured_image: "f", status: "draft" }), params("b1"));
    expect(ok.status).toBe(200);
    expect(db.find("blog_posts", "update")[0][0]).toMatchObject({ title: "T2", status: "draft", published_at: null });
    expect(db.find("blog_posts", "eq")[0]).toEqual(["id", "b1"]);
    db.queue("blog_posts", { data: null });
    const nf = await PUT(json("PUT", { title: "x" }), params("nope"));
    expect(nf.status).toBe(404);
    expect(await nf.json()).toEqual({ error: "Post not found" });
  });
  it("DELETE removes storage objects, media rows, the post, audits, returns { success }", async () => {
    const { DELETE } = await import("@/app/api/admin/blog/[id]/route");
    db.queue("media_assets", { data: [{ storage_path: "uploads/a.png" }, { storage_path: "uploads/b.png" }] }, { data: null });
    db.queue("blog_posts", { data: blogRow });
    const res = await DELETE(new Request("http://x", { headers: { cookie: COOKIE } }), params("b1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(removeObject.mock.calls.map((c) => c[0])).toEqual(["uploads/a.png", "uploads/b.png"]);
    expect(db.find("media_assets", "delete")).toHaveLength(1);
    expect(logAudit.mock.calls[0][0]).toMatchObject({ action: "blog.delete", actor: "admin", entity_id: "b1", details: { deleted_media_count: 2 } });
  });
  it("DELETE 404s when the post does not exist and 500s on error", async () => {
    const { DELETE } = await import("@/app/api/admin/blog/[id]/route");
    db.queue("media_assets", { data: [] }, { data: null });
    db.queue("blog_posts", { data: null });
    expect((await DELETE(new Request("http://x", { headers: { cookie: COOKIE } }), params("nope"))).status).toBe(404);
    db.reset();
    db.queue("media_assets", { error: { message: "boom" } });
    const res = await DELETE(new Request("http://x", { headers: { cookie: COOKIE } }), params("b1"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to delete blog post" });
  });
});

const pRow = { id: "p1", title: "P", description: "d", type: "saas", screenshot: "portfolio/x.png", website_url: null, app_store_url: null, play_store_url: null, published: true, created_at: "2026-01-01T00:00:00+00:00" };

describe("/api/admin/portfolio", () => {
  it("POST inserts and returns the row", async () => {
    db.queue("portfolio_items", { data: pRow });
    const { POST } = await import("@/app/api/admin/portfolio/route");
    const res = await POST(json("POST", { title: "P", description: "d", type: "saas", screenshot: "portfolio/x.png" }));
    expect(res.status).toBe(200);
    expect((await res.json()).created_at).toBe("2026-01-01T00:00:00.000Z");
    expect(db.find("portfolio_items", "insert")[0][0]).toEqual({ title: "P", description: "d", type: "saas", screenshot: "portfolio/x.png", website_url: null, app_store_url: null, play_store_url: null });
  });
  it("POST 500 on error", async () => {
    db.queue("portfolio_items", { error: { message: "check violation" } });
    const { POST } = await import("@/app/api/admin/portfolio/route");
    const res = await POST(json("POST", { title: "P" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to create portfolio item" });
  });
});

describe("/api/admin/portfolio/[id]", () => {
  it("GET adds screenshot_url (public url for storage paths, passthrough for http)", async () => {
    const { GET } = await import("@/app/api/admin/portfolio/[id]/route");
    db.queue("portfolio_items", { data: pRow });
    const a = await (await GET(new Request("http://x", { headers: { cookie: COOKIE } }), params("p1"))).json();
    expect(a.screenshot_url).toBe("https://pub/portfolio/x.png");
    db.queue("portfolio_items", { data: { ...pRow, screenshot: "https://h/y.png" } });
    expect((await (await GET(new Request("http://x", { headers: { cookie: COOKIE } }), params("p1"))).json()).screenshot_url).toBe("https://h/y.png");
    db.queue("portfolio_items", { data: null });
    const nf = await GET(new Request("http://x", { headers: { cookie: COOKIE } }), params("z"));
    expect(nf.status).toBe(404);
    expect(await nf.json()).toEqual({ error: "Item not found" });
  });
  it("PUT updates or 404s", async () => {
    const { PUT } = await import("@/app/api/admin/portfolio/[id]/route");
    db.queue("portfolio_items", { data: pRow });
    expect((await PUT(json("PUT", { title: "P", description: "d", type: "saas", screenshot: "s" }), params("p1"))).status).toBe(200);
    expect(db.find("portfolio_items", "update")[0][0]).toMatchObject({ title: "P", website_url: null });
    db.queue("portfolio_items", { data: null });
    expect((await PUT(json("PUT", {}), params("z"))).status).toBe(404);
  });
  it("PATCH toggles published, validates the body, returns { id, published }", async () => {
    const { PATCH } = await import("@/app/api/admin/portfolio/[id]/route");
    db.queue("portfolio_items", { data: { id: "p1", published: false } });
    const res = await PATCH(json("PATCH", { published: false }, { cookie: COOKIE }), params("p1"));
    expect(await res.json()).toEqual({ id: "p1", published: false });
    expect(db.find("portfolio_items", "select")[0]).toEqual(["id, published"]);
    expect(logAudit.mock.calls[0][0]).toMatchObject({ action: "portfolio.unpublish" });
    expect((await PATCH(json("PATCH", { published: "yes" }), params("p1"))).status).toBe(400);
    db.queue("portfolio_items", { data: null });
    expect((await PATCH(json("PATCH", { published: true }), params("z"))).status).toBe(404);
  });
  it("DELETE cleans media and item, 404s when missing", async () => {
    const { DELETE } = await import("@/app/api/admin/portfolio/[id]/route");
    db.queue("media_assets", { data: [{ storage_path: "portfolio/a.png" }] }, { data: null });
    db.queue("portfolio_items", { data: pRow });
    const res = await DELETE(new Request("http://x", { headers: { cookie: COOKIE } }), params("p1"));
    expect(await res.json()).toEqual({ success: true });
    expect(removeObject).toHaveBeenCalledWith("portfolio/a.png");
    expect(db.find("media_assets", "eq")).toContainEqual(["portfolio_item_id", "p1"]);
    db.reset();
    db.queue("media_assets", { data: [] }, { data: null });
    db.queue("portfolio_items", { data: null });
    expect((await DELETE(new Request("http://x", { headers: { cookie: COOKIE } }), params("z"))).status).toBe(404);
  });
});
