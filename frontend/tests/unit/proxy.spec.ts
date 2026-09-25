import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setAuthEnv, validCookie, FAKE_COOKIE, TEST_ADMIN_PASSWORD, TEST_INTERNAL_SECRET } from "./helpers/auth";
import { proxy, config } from "@/proxy";

const call = (url: string, headers: Record<string, string> = {}, method = "GET") =>
  Promise.resolve(proxy(new Request(url, { method, headers })));

beforeEach(() => setAuthEnv());
afterEach(() => vi.useRealTimers());

const SITE = "https://www.aegontech.dev";

describe("existing behaviour", () => {
  it("redirects the apex host to www with 301", async () => {
    const res = await call("https://aegontech.dev/blog?x=1");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.aegontech.dev/blog?x=1");
  });
  it("applies security headers", async () => {
    const res = await call(`${SITE}/`);
    expect(res.headers.get("strict-transport-security")).toBe("max-age=31536000; includeSubDomains; preload");
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(res.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(res.headers.get("cross-origin-opener-policy")).toBe("same-origin");
  });
  it("cache headers: pages, api, static", async () => {
    expect((await call(`${SITE}/blog`)).headers.get("cache-control")).toBe("public, s-maxage=300, stale-while-revalidate=60");
    expect((await call(`${SITE}/api/data/blog`)).headers.get("cache-control")).toBe("no-store");
    expect((await call(`${SITE}/_next/static/x.js`)).headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect((await call(`${SITE}/favicon.ico`)).headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  });
  it("keeps its matcher", () => {
    expect(config.matcher).toEqual(["/((?!_next/static|_next/image|favicon.ico).*)"]);
  });
});

describe("/admin pages", () => {
  const redirected = (res: Response) => {
    expect([302, 307]).toContain(res.status);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin-login");
  };
  it("redirects without a cookie", async () => redirected(await call(`${SITE}/admin`)));
  it("redirects with the fake cookie admin_session=x", async () => {
    redirected(await call(`${SITE}/admin/blog`, { cookie: FAKE_COOKIE }));
  });
  it("redirects with an expired signed cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const c = await validCookie();
    vi.setSystemTime(new Date("2026-01-03T00:00:00Z"));
    redirected(await call(`${SITE}/admin`, { cookie: c }));
  });
  it("redirects when SESSION_SECRET is missing (fail closed)", async () => {
    const c = await validCookie();
    delete process.env.SESSION_SECRET;
    redirected(await call(`${SITE}/admin`, { cookie: c }));
  });
  it("allows a valid signed cookie (with security + cache headers)", async () => {
    const res = await call(`${SITE}/admin/portfolio`, { cookie: await validCookie() });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("cache-control")).toBe("public, s-maxage=300, stale-while-revalidate=60");
  });
  it("does not guard /admin-login", async () => {
    expect((await call(`${SITE}/admin-login`)).status).toBe(200);
  });
});

describe("/api/admin/*", () => {
  const paths = ["/api/admin/blog", "/api/admin/blog/abc", "/api/admin/portfolio", "/api/admin/portfolio/abc"];
  it("401 JSON without credentials or with the fake cookie", async () => {
    for (const p of paths) {
      for (const headers of [{}, { cookie: FAKE_COOKIE }, { "x-api-key": "wrong" }, { "x-internal-secret": "wrong" }]) {
        const res = await call(`${SITE}${p}`, headers, "POST");
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "Unauthorized" });
        expect(res.headers.get("cache-control")).toBe("no-store");
        expect(res.headers.get("x-frame-options")).toBe("DENY");
      }
    }
  });
  it("passes through with a valid session, x-api-key or x-internal-secret", async () => {
    for (const headers of [{ cookie: await validCookie() }, { "x-api-key": TEST_ADMIN_PASSWORD }, { "x-internal-secret": TEST_INTERNAL_SECRET }]) {
      const res = await call(`${SITE}/api/admin/blog`, headers, "POST");
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe("no-store");
    }
  });
  it("does not block login and logout", async () => {
    for (const p of ["/api/admin/login", "/api/admin/logout"]) {
      const res = await call(`${SITE}${p}`, {}, "POST");
      expect(res.status).toBe(200);
    }
  });
  it("leaves public routes untouched", async () => {
    for (const p of ["/api/data/blog", "/api/data/portfolio", "/api/contact"]) {
      const res = await call(`${SITE}${p}`, {}, p === "/api/contact" ? "POST" : "GET");
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe("no-store");
    }
  });
});
