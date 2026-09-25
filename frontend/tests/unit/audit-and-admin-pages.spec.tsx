import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { db } from "./helpers/supabase-mock";
import { validCookie } from "./helpers/auth";

const SESSION = (await validCookie()).split("=")[1];
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (n: string) => (n === "admin_session" ? { name: n, value: SESSION } : undefined) }) }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`NEXT_REDIRECT:${to}`); } }));

vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
vi.mock("@/components/admin/PortfolioRowActions", () => ({ default: () => null }));
vi.mock("@/components/admin/MediaUploader", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: ({ children, href }: any) => <a href={href}>{children}</a> }));

beforeEach(() => db.reset());

describe("logAudit", () => {
  let warn: ReturnType<typeof vi.spyOn>, log: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => { warn.mockRestore(); log.mockRestore(); });

  it("inserts into audit_logs and returns the correlation id", async () => {
    db.queue("audit_logs", { data: null });
    const { logAudit } = await import("@/lib/observability/audit");
    const cid = await logAudit({ action: "a", actor: "admin", entity_type: "t", entity_id: "1", details: { x: 1 }, correlation_id: "c1" });
    expect(cid).toBe("c1");
    expect(db.find("audit_logs", "insert")[0][0]).toMatchObject({ actor: "admin", action: "a", entity_type: "t", entity_id: "1", details: { x: 1 }, correlation_id: "c1" });
    expect(log).not.toHaveBeenCalled();
  });
  it("falls back to console logging when the table is missing (current production behaviour)", async () => {
    db.queue("audit_logs", { error: { message: "Could not find the table 'public.audit_logs'" } });
    const { logAudit } = await import("@/lib/observability/audit");
    const cid = await logAudit({ action: "a" });
    expect(cid).toMatch(/^[0-9a-f-]{36}$/);
    expect(log).toHaveBeenCalledWith("AUDIT", expect.objectContaining({ action: "a", correlation_id: cid }));
    expect(warn).toHaveBeenCalled();
  });
});

describe("admin dashboard counts", () => {
  it("renders exact row counts", async () => {
    db.queue("portfolio_items", { count: 6 });
    db.queue("blog_posts", { count: 198 });
    const { default: AdminDashboard } = await import("@/app/admin/page");
    render(await AdminDashboard());
    expect(screen.getByText("6")).toBeTruthy();
    expect(screen.getByText("198")).toBeTruthy();
    expect(db.find("blog_posts", "select")[0]).toEqual(["*", { count: "exact", head: true }]);
  });
});

describe("admin lists", () => {
  it("blog list shows posts newest first with locale dates", async () => {
    db.queue("blog_posts", { data: [{ id: "1", title: "Hello", slug: "hello", status: "published", created_at: "2026-03-04T12:00:00+00:00" }] });
    const { default: AdminBlog } = await import("@/app/admin/blog/page");
    render(await AdminBlog());
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText(/Status: published/).textContent).toContain(new Date("2026-03-04T12:00:00Z").toLocaleDateString());
    expect(db.find("blog_posts", "order")[0]).toEqual(["created_at", { ascending: false }]);
  });
  it("portfolio list shows the counts line", async () => {
    const item = (n: number, published: boolean) => ({ id: `${n}`, title: `Item${n}`, description: "d", type: "saas", screenshot: "s", website_url: null, app_store_url: null, play_store_url: null, published, created_at: "2026-03-04T12:00:00+00:00" });
    db.queue("portfolio_items", { data: [item(1, true), item(2, false)] });
    const { default: AdminPortfolio } = await import("@/app/admin/portfolio/page");
    render(await AdminPortfolio());
    expect(screen.getByText(/2 items/).textContent).toContain("1 published");
  });
});
