import { describe, it, expect, vi, beforeEach } from "vitest";
import { setAuthEnv, validCookie, FAKE_COOKIE } from "./helpers/auth";

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

import AdminLayout from "@/app/admin/layout";

beforeEach(() => {
  setAuthEnv();
  redirect.mockClear();
  store.value = undefined;
});

describe("AdminLayout", () => {
  it("redirects to /admin-login without a cookie", async () => {
    await expect(AdminLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT:/admin-login");
  });
  it("redirects for the fake cookie admin_session=x", async () => {
    store.value = FAKE_COOKIE.split("=")[1];
    await expect(AdminLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT:/admin-login");
  });
  it("redirects when SESSION_SECRET is missing", async () => {
    store.value = (await validCookie()).split("=")[1];
    delete process.env.SESSION_SECRET;
    await expect(AdminLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT:/admin-login");
  });
  it("renders for a valid signed cookie", async () => {
    store.value = (await validCookie()).split("=")[1];
    const el = await AdminLayout({ children: null });
    expect(el).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
