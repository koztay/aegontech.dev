import { describe, it, expect } from "vitest";
import { reviveRow, fetchAll, escapeLike, orValue, unwrap } from "@/lib/db/supabase";

describe("reviveRow (pg-compatible value types)", () => {
  it("turns timestamptz strings into Date and bigint numbers into strings", () => {
    const r = reviveRow({ id: "x", created_at: "2026-01-02T03:04:05.123456+00:00", published_at: null, size_bytes: 3849123, title: "t" });
    expect(r.created_at).toBeInstanceOf(Date);
    expect((r.created_at as Date).toISOString()).toBe("2026-01-02T03:04:05.123Z");
    expect(r.published_at).toBeNull();
    expect(r.size_bytes).toBe("3849123");
    expect(r.title).toBe("t");
  });
  it("leaves rows without those columns untouched and passes through null", () => {
    expect(reviveRow({ a: 1 })).toEqual({ a: 1 });
    expect(reviveRow(null)).toBeNull();
  });
});

describe("unwrap", () => {
  it("returns data and throws on error", () => {
    expect(unwrap({ data: [1], error: null })).toEqual([1]);
    expect(() => unwrap({ data: null, error: { message: "boom" } })).toThrow("boom");
  });
});

describe("fetchAll", () => {
  const rows = Array.from({ length: 2500 }, (_, i) => ({ i }));
  const build = (from: number, to: number) => Promise.resolve({ data: rows.slice(from, to + 1), error: null });

  it("pages past the 1000-row PostgREST cap", async () => {
    const all = await fetchAll(build);
    expect(all).toHaveLength(2500);
    expect(all[2499]).toEqual({ i: 2499 });
  });
  it("honours max and stops at an empty page", async () => {
    expect(await fetchAll(build, { max: 1500 })).toHaveLength(1500);
    expect(await fetchAll(build, { max: 5 })).toHaveLength(5);
    expect(await fetchAll((f, t) => Promise.resolve({ data: rows.slice(f, Math.min(t + 1, 10)), error: null }))).toHaveLength(10);
  });
  it("does not stop on a short page: a server max-rows below the page size still yields every row", async () => {
    const seen: Array<[number, number]> = [];
    const cap = 300; // server returns at most 300 rows per request
    const all = await fetchAll((f, t) => { seen.push([f, t]); return Promise.resolve({ data: rows.slice(f, Math.min(t + 1, f + cap)), error: null }); });
    expect(all).toHaveLength(2500);
    expect(all.map((r: any) => r.i)).toEqual(rows.map((r) => r.i));
    expect(seen.slice(0, 3)).toEqual([[0, 999], [300, 1299], [600, 1599]]);
  });
  it("returns [] for an empty first page (one request)", async () => {
    let calls = 0;
    expect(await fetchAll(() => { calls++; return Promise.resolve({ data: [], error: null }); })).toEqual([]);
    expect(calls).toBe(1);
  });
  it("exact multiple of the page size ends with an empty page", async () => {
    const seen: Array<[number, number]> = [];
    const exact = Array.from({ length: 2000 }, (_, i) => i);
    await fetchAll((f, t) => { seen.push([f, t]); return Promise.resolve({ data: exact.slice(f, t + 1), error: null }); });
    expect(seen).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });
  it("has a hard safety cap against a server that never stops returning rows", async () => {
    await expect(fetchAll(() => Promise.resolve({ data: [1], error: null }), { pageSize: 1 })).rejects.toThrow(/exceeded/);
  });
  it("throws when a page errors", async () => {
    await expect(fetchAll(() => Promise.resolve({ data: null, error: { message: "bad" } }))).rejects.toThrow("bad");
  });
});

describe("like escaping", () => {
  it("escapes wildcards and quotes values for .or()", () => {
    expect(escapeLike("50%_a\\b")).toBe("50\\%\\_a\\\\b");
    expect(orValue('a,b"c')).toBe('"a,b\\"c"');
  });
});
