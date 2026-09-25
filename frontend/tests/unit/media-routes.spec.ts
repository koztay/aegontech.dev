import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "./helpers/supabase-mock";
import { validCookie } from "./helpers/auth";

const COOKIE = await validCookie();

const storageMock = {
  presignPut: vi.fn(async (_k: string, _e?: number) => "https://s/signed-put"),
  statObject: vi.fn(async (_k: string) => ({ size: 7, etag: "e1", mimeType: "image/png", metaData: { "content-type": "image/png" } })),
  getPublicUrl: vi.fn((k: string) => `https://pub/${k}`),
  putObject: vi.fn(async (_k: string, _b: Buffer, _c: string) => undefined),
  ensureBucketExists: vi.fn(async () => undefined),
  removeObject: vi.fn(async (_k: string) => undefined),
};
vi.mock("@/lib/storage/supabase-storage", () => storageMock);
vi.mock("@/lib/supabase/server", async () => (await import("./helpers/supabase-mock")).serverModuleMock);
// pg returned size_bytes (bigint) as a string and created_at as a Date; the routes must still do so.
const dbRow = { id: "m1", storage_path: "k", url: "u", size_bytes: 7, created_at: "2026-01-01T00:00:00+00:00" };
const jsonRow = { id: "m1", storage_path: "k", url: "u", size_bytes: "7", created_at: "2026-01-01T00:00:00.000Z" };
vi.mock("@/lib/observability/audit", () => ({ logAudit: vi.fn(async () => undefined) }));

const admin = { cookie: COOKIE, "content-type": "application/json" };
const req = (url: string, body: any, headers: Record<string, string> = admin) =>
  new Request(`http://localhost${url}`, { method: "POST", headers, body: JSON.stringify(body) });

let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.clearAllMocks();
  db.reset();
  db.queue("media_assets", { data: dbRow }, { data: null });
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe("POST /api/media/presign", () => {
  it("returns { uploadUrl, objectKey, expiresIn } with the signed URL string", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(req("/api/media/presign", { filename: "a b.png", contentType: "image/png", sizeBytes: 10, purpose: "portfolio" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).sort()).toEqual(["expiresIn", "objectKey", "uploadUrl"]);
    expect(json.uploadUrl).toBe("https://s/signed-put");
    expect(json.objectKey).toMatch(/^portfolio\/[a-z0-9-]+-a_b\.png$/);
    expect(json.expiresIn).toBe(7200); // real, fixed Supabase signed-upload-URL lifetime
  });
  it("rejects non-admin and bad types", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    expect((await POST(req("/x", {}, {}))).status).toBe(401);
    expect((await POST(req("/x", { filename: "a", contentType: "text/html", sizeBytes: 1 }))).status).toBe(415);
  });
});

describe("POST /api/media/finalize", () => {
  it("stats the object, inserts the row and returns { media }", async () => {
    const { POST } = await import("@/app/api/media/finalize/route");
    const res = await POST(req("/api/media/finalize", { objectKey: "uploads/k.png", altText: "alt" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ media: jsonRow });
    expect(db.find("media_assets", "insert")[0][0]).toEqual({
      storage_path: "uploads/k.png", url: "https://pub/uploads/k.png", alt_text: "alt", caption: null,
      source: "upload", mime_type: "image/png", size_bytes: 7, checksum: "e1", created_by: null,
    });
    expect(db.find("media_assets", "single")).toHaveLength(1);
  });
  it("returns 404 when the object is missing", async () => {
    storageMock.statObject.mockRejectedValueOnce(new Error("Object not found"));
    const { POST } = await import("@/app/api/media/finalize/route");
    const res = await POST(req("/api/media/finalize", { objectKey: "nope", altText: "alt" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Object not found in storage" });
  });
});

describe("POST /api/media/upload (JSON base64 path) and /proxy", () => {
  it("upload puts the buffer via putObject and returns { media }", async () => {
    const { POST } = await import("@/app/api/media/upload/route");
    const res = await POST(req("/api/media/upload", { filename: "x.png", contentType: "image/png", altText: "alt", dataBase64: Buffer.from("hello").toString("base64") }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ media: jsonRow });
    expect(storageMock.ensureBucketExists).toHaveBeenCalled();
    const [key, buf, ct] = storageMock.putObject.mock.calls[0];
    expect(key).toMatch(/^uploads\/[a-z0-9-]+-x\.png$/);
    expect(buf.toString()).toBe("hello");
    expect(ct).toBe("image/png");
  });
  it("proxy uploads multipart via putObject and returns { media }", async () => {
    const { POST } = await import("@/app/api/media/proxy/route");
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "y.png", { type: "image/png" }));
    fd.set("altText", "alt");
    const res = await POST(new Request("http://localhost/api/media/proxy", { method: "POST", headers: { cookie: COOKIE }, body: fd }));
    expect(res.status).toBe(200);
    expect((await res.json()).media.id).toBe("m1");
    expect(storageMock.putObject).toHaveBeenCalledTimes(1);
    expect(storageMock.putObject.mock.calls[0][2]).toBe("image/png");
  });
  it("upload surfaces storage failure as 500 { error: 'Server error' }", async () => {
    storageMock.putObject.mockRejectedValueOnce(new Error("boom"));
    const { POST } = await import("@/app/api/media/upload/route");
    const res = await POST(req("/api/media/upload", { filename: "x.png", contentType: "image/png", altText: "a", dataBase64: "aGk=" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Server error" });
  });
});

describe("association with a portfolio item / blog post", () => {
  it("upload links the new row via a follow-up update", async () => {
    const { POST } = await import("@/app/api/media/upload/route");
    const res = await POST(req("/api/media/upload", { filename: "x.png", contentType: "image/png", altText: "a", dataBase64: "aGk=", associatedType: "portfolio", associatedId: "pid" }));
    expect(res.status).toBe(200);
    expect(db.find("media_assets", "update")[0][0]).toEqual({ portfolio_item_id: "pid" });
    expect(db.find("media_assets", "eq")).toContainEqual(["id", "m1"]);
  });
  it("finalize links to a blog post for any non-portfolio type", async () => {
    const { POST } = await import("@/app/api/media/finalize/route");
    await POST(req("/api/media/finalize", { objectKey: "k.png", altText: "a", associatedType: "blog", associatedId: "bid" }));
    expect(db.find("media_assets", "update")[0][0]).toEqual({ blog_post_id: "bid" });
  });
  it("a failed insert is a 500", async () => {
    db.reset();
    db.queue("media_assets", { error: { message: "unique violation" } });
    const { POST } = await import("@/app/api/media/finalize/route");
    const res = await POST(req("/api/media/finalize", { objectKey: "k.png", altText: "a" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Server error" });
  });
});

describe("GET /api/media/list", () => {
  const listRow = { id: "m1", url: "https://h/u1", alt_text: "a", storage_path: "uploads/a.png", mime_type: "image/png", created_at: "2026-01-01T00:00:00+00:00" };
  const get = (qs = "") => new Request(`http://localhost/api/media/list${qs}`, { headers: { cookie: COOKIE } });
  it("returns { media } newest first, url normalised, created_at serialised as before", async () => {
    db.reset();
    db.queue("media_assets", { data: [listRow, { ...listRow, id: "m2", url: "uploads/b.png" }] });
    const { GET } = await import("@/app/api/media/list/route");
    const res = await GET(get("?limit=10"));
    expect(await res.json()).toEqual({
      media: [
        { ...listRow, created_at: "2026-01-01T00:00:00.000Z" },
        { ...listRow, id: "m2", url: "https://pub/uploads/b.png", created_at: "2026-01-01T00:00:00.000Z" },
      ],
    });
    expect(db.find("media_assets", "select")[0]).toEqual(["id, url, alt_text, storage_path, mime_type, created_at"]);
    expect(db.find("media_assets", "order")[0]).toEqual(["created_at", { ascending: false }]);
    expect(db.find("media_assets", "range")[0]).toEqual([0, 9]);
  });
  it("search uses a case-insensitive OR on alt_text/storage_path with LIKE wildcards escaped", async () => {
    db.reset();
    db.queue("media_assets", { data: [] });
    const { GET } = await import("@/app/api/media/list/route");
    await GET(get("?q=" + encodeURIComponent('50%_a,"b')));
    const [or] = db.find("media_assets", "or")[0];
    expect(or).toBe(String.raw`alt_text.ilike."%50\\%\\_a,\"b%",storage_path.ilike."%50\\%\\_a,\"b%"`);
  });
  it("pages past 1000 rows when a large limit is requested", async () => {
    db.reset();
    const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ ...listRow, id: `m${i}` }));
    db.queue("media_assets", { data: mk(1000) }, { data: mk(616) });
    const { GET } = await import("@/app/api/media/list/route");
    const res = await GET(get("?limit=5000"));
    expect((await res.json()).media).toHaveLength(1616);
    expect(db.find("media_assets", "range")).toEqual([[0, 999], [1000, 1999], [1616, 2615]]);
  });
  it("401 for unauthenticated, 500 on db error", async () => {
    const { GET } = await import("@/app/api/media/list/route");
    expect((await GET(new Request("http://localhost/api/media/list"))).status).toBe(401);
    db.reset(); db.queue("media_assets", { error: { message: "x" } });
    const res = await GET(get());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Server error" });
  });
});

describe("POST /api/media/delete", () => {
  it("removes the object then the row; still cleans the row if storage fails", async () => {
    db.reset();
    const removeObject = storageMock.removeObject;
    const { POST } = await import("@/app/api/media/delete/route");
    const res = await POST(req("/api/media/delete", { objectKey: "uploads/a.png" }));
    expect(await res.json()).toEqual({ success: true });
    expect(removeObject).toHaveBeenCalledWith("uploads/a.png");
    expect(db.find("media_assets", "delete")).toHaveLength(1);
    expect(db.find("media_assets", "eq")[0]).toEqual(["storage_path", "uploads/a.png"]);
    removeObject.mockRejectedValueOnce(new Error("gone"));
    db.reset();
    expect((await (await POST(req("/api/media/delete", { objectKey: "k" }))).json())).toEqual({ success: true });
    expect(db.find("media_assets", "delete")).toHaveLength(1);
    expect((await POST(req("/api/media/delete", {}))).status).toBe(400);
  });
});
