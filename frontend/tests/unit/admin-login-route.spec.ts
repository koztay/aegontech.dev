import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setAuthEnv, TEST_ADMIN_PASSWORD } from "./helpers/auth";
import { verifySession } from "@/lib/auth/session";

const jar = vi.hoisted(() => ({ set: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));

const login = async (body: unknown) => {
  const { POST } = await import("@/app/api/admin/login/route");
  return POST(new Request("http://localhost/api/admin/login", { method: "POST", body: JSON.stringify(body) }));
};

let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  setAuthEnv();
  vi.clearAllMocks();
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe("POST /api/admin/login", () => {
  it("correct password sets a signed cookie that verifySession accepts, with unchanged flags", async () => {
    const res = await login({ password: TEST_ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(jar.set).toHaveBeenCalledTimes(1);
    const [name, value, opts] = jar.set.mock.calls[0];
    expect(name).toBe("admin_session");
    expect(await verifySession(value)).toBe(true);
    expect(opts).toMatchObject({ httpOnly: true, sameSite: "strict", maxAge: 86400 });
    expect(opts.secure).toBe(process.env.NODE_ENV === "production");
  });
  it("wrong password (also same length / prefix) is 401 and sets no cookie", async () => {
    for (const password of ["nope", TEST_ADMIN_PASSWORD + "x", TEST_ADMIN_PASSWORD.slice(0, -1), "x".repeat(TEST_ADMIN_PASSWORD.length)]) {
      const res = await login({ password });
      expect(res.status).toBe(401);
    }
    expect(jar.set).not.toHaveBeenCalled();
  });
  it("missing password is 400", async () => {
    expect((await login({})).status).toBe(400);
    expect(jar.set).not.toHaveBeenCalled();
  });
  it("missing SESSION_SECRET is a generic 500, logs the variable name only", async () => {
    delete process.env.SESSION_SECRET;
    const res = await login({ password: TEST_ADMIN_PASSWORD });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Login failed" });
    expect(jar.set).not.toHaveBeenCalled();
    const logged = errSpy.mock.calls.map((c) => c.map(String).join(" ")).join("\n");
    expect(logged).toContain("SESSION_SECRET");
    expect(logged).not.toContain(TEST_ADMIN_PASSWORD);
  });
  it("too-short SESSION_SECRET is also a generic 500", async () => {
    process.env.SESSION_SECRET = "short";
    const res = await login({ password: TEST_ADMIN_PASSWORD });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Login failed" });
  });
  it("missing ADMIN_PASSWORD is a generic 500 and never authenticates", async () => {
    delete process.env.ADMIN_PASSWORD;
    const res = await login({ password: "" + "anything" });
    expect(res.status).toBe(500);
    expect(jar.set).not.toHaveBeenCalled();
  });
});
