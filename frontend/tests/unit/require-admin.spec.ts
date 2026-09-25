import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setAuthEnv, validCookie, FAKE_COOKIE, TEST_ADMIN_PASSWORD, TEST_INTERNAL_SECRET, TEST_SESSION_SECRET } from "./helpers/auth";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";

const req = (headers: Record<string, string> = {}) => new Request("http://x/api", { headers });

beforeEach(() => setAuthEnv());
afterEach(() => vi.useRealTimers());

describe("requireAdmin", () => {
  it("accepts a valid signed cookie as admin", async () => {
    expect(await requireAdmin(req({ cookie: await validCookie() }))).toEqual({ ok: true, actor: "admin" });
  });
  it("rejects the fake cookie admin_session=x", async () => {
    expect(await requireAdmin(req({ cookie: FAKE_COOKIE }))).toEqual({ ok: false });
  });
  it("rejects a validly signed but expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const c = await validCookie();
    vi.setSystemTime(new Date("2026-01-03T00:00:00Z"));
    expect(await requireAdmin(req({ cookie: c }))).toEqual({ ok: false });
  });
  it("x-api-key correct -> admin", async () => {
    expect(await requireAdmin(req({ "x-api-key": TEST_ADMIN_PASSWORD }))).toEqual({ ok: true, actor: "admin" });
  });
  it("x-api-key incorrect / length mismatch -> rejected", async () => {
    expect(await requireAdmin(req({ "x-api-key": "wrong-password-of-same" }))).toEqual({ ok: false });
    expect(await requireAdmin(req({ "x-api-key": TEST_ADMIN_PASSWORD + "x" }))).toEqual({ ok: false });
    expect(await requireAdmin(req({ "x-api-key": "a" }))).toEqual({ ok: false });
  });
  it("x-internal-secret correct -> internal", async () => {
    expect(await requireAdmin(req({ "x-internal-secret": TEST_INTERNAL_SECRET }))).toEqual({ ok: true, actor: "internal" });
  });
  it("x-internal-secret incorrect / length mismatch -> rejected", async () => {
    expect(await requireAdmin(req({ "x-internal-secret": "nope" }))).toEqual({ ok: false });
    expect(await requireAdmin(req({ "x-internal-secret": TEST_INTERNAL_SECRET + "1" }))).toEqual({ ok: false });
  });
  it("nothing -> rejected", async () => {
    expect(await requireAdmin(req())).toEqual({ ok: false });
  });
  it("unset ADMIN_PASSWORD / INTERNAL_SERVICE_SECRET never match an empty header", async () => {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.INTERNAL_SERVICE_SECRET;
    expect(await requireAdmin(req({ "x-api-key": "" }))).toEqual({ ok: false });
    expect(await requireAdmin(req({ "x-internal-secret": "" }))).toEqual({ ok: false });
    expect(await requireAdmin(req({ "x-api-key": "undefined" }))).toEqual({ ok: false });
  });
  it("valid cookie with missing SESSION_SECRET -> rejected (fail closed)", async () => {
    const c = await validCookie();
    delete process.env.SESSION_SECRET;
    expect(await requireAdmin(req({ cookie: c }))).toEqual({ ok: false });
    expect(TEST_SESSION_SECRET.length).toBe(64);
  });
});

describe("unauthorizedResponse", () => {
  it("is 401 JSON with no-store", async () => {
    const r = unauthorizedResponse();
    expect(r.status).toBe(401);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(await r.json()).toEqual({ error: "Unauthorized" });
  });
});
