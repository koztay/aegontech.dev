import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "./helpers/supabase-mock";

vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
vi.mock("@/lib/storage/supabase-storage", () => ({ getPublicUrl: (k: string) => `https://pub/${k}` }));

const post = (n: number) => ({ id: `id${n}`, slug: `s${n}`, title: `t${n}`, excerpt: "e", content: "c", featured_image: "f", status: "published", published_at: "2026-01-01T00:00:00+00:00", created_at: "2026-01-01T00:00:00+00:00" });
let warn: ReturnType<typeof vi.spyOn>, err: ReturnType<typeof vi.spyOn>;
beforeEach(() => { db.reset(); warn = vi.spyOn(console, "warn").mockImplementation(() => {}); err = vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { warn.mockRestore(); err.mockRestore(); });

describe("lib/data/blog", () => {
  it("getBlogPost maps the row; publishedAt stays a Date like pg returned", async () => {
    db.queue("blog_posts", { data: [post(1)] });
    const { getBlogPost } = await import("@/lib/data/blog");
    const p = await getBlogPost("s1");
    expect(p).toEqual({ id: "id1", slug: "s1", title: "t1", excerpt: "e", content: "c", featuredImage: "f", publishedAt: new Date("2026-01-01T00:00:00Z"), status: "published" });
    expect(db.find("blog_posts", "eq")).toEqual([["slug", "s1"], ["status", "published"]]);
  });
  it("getBlogPost falls back to the sample post / null exactly as before", async () => {
    const { getBlogPost } = await import("@/lib/data/blog");
    db.queue("blog_posts", { data: [] });
    expect(await getBlogPost("nope")).toBeNull();
    db.queue("blog_posts", { error: { message: "down" } });
    expect((await getBlogPost("sample-post"))?.id).toBe("sample-post");
  });
  it("getBlogIndex returns up to 50 published posts, else the sample", async () => {
    const { getBlogIndex } = await import("@/lib/data/blog");
    db.queue("blog_posts", { data: [post(1), post(2)] });
    expect((await getBlogIndex()).map((p) => p.slug)).toEqual(["s1", "s2"]);
    expect(db.find("blog_posts", "limit")[0]).toEqual([50]);
    db.queue("blog_posts", { data: [] });
    expect((await getBlogIndex())[0].id).toBe("sample-post");
  });
  it("getAllBlogSlugs pages past 1000 rows", async () => {
    const page1 = Array.from({ length: 1000 }, (_, i) => ({ slug: `a${i}`, published_at: "2026-01-01T00:00:00+00:00" }));
    const page2 = [{ slug: "z", published_at: "2026-01-01T00:00:00+00:00" }];
    db.queue("blog_posts", { data: page1 }, { data: page2 });
    const { getAllBlogSlugs } = await import("@/lib/data/blog");
    const all = await getAllBlogSlugs();
    expect(all).toHaveLength(1001);
    expect(all[1000].publishedAt).toBeInstanceOf(Date);
    expect(db.find("blog_posts", "range")).toEqual([[0, 999], [1000, 1999], [1001, 2000]]);
  });
  it("getAllBlogSlugs returns [] on error", async () => {
    db.queue("blog_posts", { error: { message: "x" } });
    const { getAllBlogSlugs } = await import("@/lib/data/blog");
    expect(await getAllBlogSlugs()).toEqual([]);
  });
});

const pRow = (n: number, extra: any = {}) => ({ id: `p${n}`, title: `P${n}`, description: "d", type: "saas", screenshot: "portfolio/x.png", website_url: "https://w", app_store_url: null, play_store_url: null, published: true, created_at: "2026-01-01T00:00:00+00:00", ...extra });

describe("lib/data/portfolio", () => {
  it("maps rows (public URL for storage paths) and only fetches published", async () => {
    db.queue("portfolio_items", { data: [pRow(1)] });
    const { getAllPortfolioItems } = await import("@/lib/data/portfolio");
    const items = await getAllPortfolioItems();
    expect(items).toEqual([{ id: "p1", title: "P1", description: "d", type: "saas", screenshot: "https://pub/portfolio/x.png", links: { website: "https://w", appStore: undefined, playStore: undefined } }]);
    expect(db.find("portfolio_items", "eq")[0]).toEqual(["published", true]);
  });
  it("falls back to placeholders on error or empty", async () => {
    const { getAllPortfolioItems } = await import("@/lib/data/portfolio");
    db.queue("portfolio_items", { error: { message: "x" } });
    expect((await getAllPortfolioItems())[0].id).toBe("dialable");
    db.queue("portfolio_items", { data: [] });
    expect((await getAllPortfolioItems())[0].id).toBe("dialable");
  });
});

describe("lib/data/landing", () => {
  it("getServices maps rows in sort order", async () => {
    db.queue("services", { data: [{ id: "s", icon: "i", title: "t", description: "d", sort_order: 1, created_at: "2026-01-01T00:00:00+00:00" }] });
    const { getServices } = await import("@/lib/data/landing");
    expect(await getServices()).toEqual([{ id: "s", icon: "i", title: "t", description: "d" }]);
    expect(db.find("services", "order")[0]).toEqual(["sort_order", { ascending: true }]);
  });
  it("getServices returns [] on error", async () => {
    db.queue("services", { error: { message: "x" } });
    const { getServices } = await import("@/lib/data/landing");
    expect(await getServices()).toEqual([]);
  });
  it("getFeaturedPortfolioItems maps imageUrl/url and limits to 6", async () => {
    db.queue("portfolio_items", { data: [pRow(1), pRow(2, { website_url: null, app_store_url: null })] });
    const { getFeaturedPortfolioItems } = await import("@/lib/data/landing");
    const r = await getFeaturedPortfolioItems();
    expect(r).toEqual([
      { id: "p1", title: "P1", type: "saas", description: "d", imageUrl: "portfolio/x.png", url: "https://w" },
      { id: "p2", title: "P2", type: "saas", description: "d", imageUrl: "portfolio/x.png", url: "#" },
    ]);
    expect(db.find("portfolio_items", "limit")[0]).toEqual([6]);
  });
  it("getBlogPosts maps camelCase with Date publishedAt", async () => {
    db.queue("blog_posts", { data: [post(1)] });
    const { getBlogPosts } = await import("@/lib/data/landing");
    const r = await getBlogPosts();
    expect(r[0]).toMatchObject({ id: "id1", featuredImage: "f", publishedAt: new Date("2026-01-01T00:00:00Z") });
  });
  it("submitContactForm inserts name/email/message and throws on error", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    db.queue("contact_submissions", { data: null });
    const { submitContactForm } = await import("@/lib/data/landing");
    await submitContactForm({ name: "n", email: "e@x.y", message: "m" } as any);
    expect(db.find("contact_submissions", "insert")[0][0]).toEqual({ name: "n", email: "e@x.y", message: "m" });
    db.queue("contact_submissions", { error: { message: "rls" } });
    await expect(submitContactForm({ name: "n", email: "e", message: "m" } as any)).rejects.toThrow("rls");
  });
});
