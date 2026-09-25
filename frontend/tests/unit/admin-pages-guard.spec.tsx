import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "./helpers/supabase-mock";
import { setAuthEnv, validCookie, FAKE_COOKIE } from "./helpers/auth";

vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
vi.mock("@/components/admin/PortfolioRowActions", () => ({ default: () => null }));
vi.mock("@/components/admin/MediaGallery", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const store = vi.hoisted(() => ({ value: undefined as string | undefined }));
const redirect = vi.hoisted(() =>
  vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  })
);
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (n: string) => (n === "admin_session" && store.value !== undefined ? { name: n, value: store.value } : undefined) }),
}));

const pages: Array<[string, () => Promise<{ default: () => any }>, boolean]> = [
  ["/admin", () => import("@/app/admin/page") as any, true],
  ["/admin/blog", () => import("@/app/admin/blog/page") as any, true],
  ["/admin/portfolio", () => import("@/app/admin/portfolio/page") as any, true],
  ["/admin/media", () => import("@/app/admin/media/page") as any, false],
];

beforeEach(() => {
  setAuthEnv();
  db.reset();
  redirect.mockClear();
  store.value = undefined;
});

describe("server admin pages guard themselves before any data access", () => {
  for (const [path, load, usesDb] of pages) {
    describe(path, () => {
      it("redirects without a cookie, with a fake cookie and with a tampered token; no db access", async () => {
        const { default: Page } = await load();
        const good = (await validCookie()).split("=")[1];
        const [p, s] = good.split(".");
        const tampered = `${p}.${(s[0] === "A" ? "B" : "A") + s.slice(1)}`;
        for (const v of [undefined, FAKE_COOKIE.split("=")[1], tampered]) {
          store.value = v;
          await expect(Promise.resolve().then(() => Page())).rejects.toThrow("NEXT_REDIRECT:/admin-login");
          expect(db.client.from).not.toHaveBeenCalled();
        }
      });
      it("proceeds with a valid signed cookie", async () => {
        const { default: Page } = await load();
        store.value = (await validCookie()).split("=")[1];
        db.queue("portfolio_items", { data: [], count: 0 });
        db.queue("blog_posts", { data: [], count: 0 });
        await expect(Promise.resolve(Page())).resolves.toBeTruthy();
        expect(redirect).not.toHaveBeenCalled();
        if (usesDb) expect(db.client.from).toHaveBeenCalled();
      });
    });
  }
});
