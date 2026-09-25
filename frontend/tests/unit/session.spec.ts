import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TEST_SESSION_SECRET } from "./helpers/auth";
import { signSession, verifySession, getSessionCookie, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

const enc = new TextEncoder();
function b64url(bytes: Uint8Array | string) {
  const b = typeof bytes === "string" ? enc.encode(bytes) : bytes;
  return Buffer.from(b).toString("base64url");
}
async function hmac(data: string, secret = TEST_SESSION_SECRET) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
async function craft(payload: object) {
  const p = b64url(JSON.stringify(payload));
  return `${p}.${b64url(await hmac(p))}`;
}

beforeEach(() => { process.env.SESSION_SECRET = TEST_SESSION_SECRET; });
afterEach(() => { vi.useRealTimers(); });

describe("signSession / verifySession", () => {
  it("accepts a freshly signed token", async () => {
    expect(await verifySession(await signSession())).toBe(true);
  });
  it("lifetime is 24h", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(86400);
  });
  it("rejects a tampered payload", async () => {
    const [p, s] = (await signSession()).split(".");
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    payload.exp += 100000;
    expect(await verifySession(`${b64url(JSON.stringify(payload))}.${s}`)).toBe(false);
  });
  it("rejects a tampered signature", async () => {
    const [p, s] = (await signSession()).split(".");
    const flipped = (s[0] === "A" ? "B" : "A") + s.slice(1);
    expect(await verifySession(`${p}.${flipped}`)).toBe(false);
  });
  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const t = await signSession();
    vi.setSystemTime(new Date("2026-01-02T00:00:01Z"));
    expect(await verifySession(t)).toBe(false);
  });
  it("accepts just before expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const t = await signSession();
    vi.setSystemTime(new Date("2026-01-01T23:59:00Z"));
    expect(await verifySession(t)).toBe(true);
  });
  it("rejects malformed input", async () => {
    for (const t of ["x", "a.b", "a.b.c", ".", "..", "!!!.???", "x".repeat(20)]) {
      expect(await verifySession(t)).toBe(false);
    }
  });
  it("rejects oversized input", async () => {
    expect(await verifySession("a".repeat(5000) + "." + "b".repeat(5000))).toBe(false);
  });
  it("rejects empty / undefined / null", async () => {
    expect(await verifySession("")).toBe(false);
    expect(await verifySession(undefined)).toBe(false);
    expect(await verifySession(null)).toBe(false);
  });
  it("rejects a correctly signed token with an unknown version", async () => {
    const now = Math.floor(Date.now() / 1000);
    expect(await verifySession(await craft({ v: 1, iat: now, exp: now + 1000 }))).toBe(true);
    expect(await verifySession(await craft({ v: 2, iat: now, exp: now + 1000 }))).toBe(false);
  });
  it("rejects a token signed with another secret", async () => {
    const t = await signSession();
    process.env.SESSION_SECRET = "f".repeat(64);
    expect(await verifySession(t)).toBe(false);
  });
  it("fails closed when SESSION_SECRET is missing", async () => {
    const t = await signSession();
    delete process.env.SESSION_SECRET;
    expect(await verifySession(t)).toBe(false);
    await expect(signSession()).rejects.toThrow(/SESSION_SECRET/);
  });
  it("fails closed when SESSION_SECRET is too short", async () => {
    const t = await signSession();
    process.env.SESSION_SECRET = "short-secret-31-chars-xxxxxxxxx".slice(0, 31);
    expect(await verifySession(t)).toBe(false);
    await expect(signSession()).rejects.toThrow(/32/);
  });
  it("a token signed with an forged with a guessable secret is rejected when SESSION_SECRET is missing", async () => {
    delete process.env.SESSION_SECRET;
    const now = Math.floor(Date.now() / 1000);
    const p = b64url(JSON.stringify({ v: 1, iat: now, exp: now + 1000 }));
    expect(await verifySession(`${p}.${b64url(await hmac(p, "undefined"))}`)).toBe(false);
  });
});

describe("getSessionCookie", () => {
  const req = (cookie?: string) => new Request("http://x", { headers: cookie ? { cookie } : {} });
  it("returns the exact cookie value", () => {
    expect(SESSION_COOKIE).toBe("admin_session");
    expect(getSessionCookie(req("a=1; admin_session=tok.en; b=2"))).toBe("tok.en");
  });
  it("does not substring-match other cookie names", () => {
    expect(getSessionCookie(req("not_admin_session=zzz"))).toBeUndefined();
    expect(getSessionCookie(req("x=admin_session=zzz"))).toBeUndefined();
  });
  it("returns undefined without a cookie header or on garbage", () => {
    expect(getSessionCookie(req())).toBeUndefined();
    expect(getSessionCookie(req(";;; = ;"))).toBeUndefined();
  });
  it("tolerates quoted values and malformed percent-encoding", () => {
    expect(getSessionCookie(req('admin_session="abc"'))).toBe("abc");
    expect(getSessionCookie(req("admin_session=%E0%A4%A"))).toBe("%E0%A4%A");
  });
});
