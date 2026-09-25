import { describe, it, expect, vi, beforeEach } from "vitest";

const storageMock = {
  presignPut: vi.fn(async (_k: string, _e?: number) => "https://s/signed-put"),
  statObject: vi.fn(async (_k: string) => ({ size: 7, etag: "e1", mimeType: "image/png", metaData: { "content-type": "image/png" } })),
  getPublicUrl: vi.fn((k: string) => `https://pub/${k}`),
  putObject: vi.fn(async (_k: string, _b: Buffer, _c: string) => undefined),
  ensureBucketExists: vi.fn(async () => undefined),
};
vi.mock("@/lib/storage/supabase-storage", () => storageMock);
const query = vi.fn(async (_sql: string, _p?: any[]) => [{ id: "m1", storage_path: "k", url: "u" }] as any[]);
vi.mock("@/lib/db/client", () => ({ query }));
vi.mock("@/lib/observability/audit", () => ({ logAudit: vi.fn(async () => undefined) }));

const admin = { cookie: "admin_session=1", "content-type": "application/json" };
const req = (url: string, body: any, headers: Record<string, string> = admin) =>
  new Request(`http://localhost${url}`, { method: "POST", headers, body: JSON.stringify(body) });

beforeEach(() => vi.clearAllMocks());

describe("POST /api/media/presign", () => {
  it("returns { uploadUrl, objectKey, expiresIn } with the signed URL string", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(req("/api/media/presign", { filename: "a b.png", contentType: "image/png", sizeBytes: 10, purpose: "portfolio" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).sort()).toEqual(["expiresIn", "objectKey", "uploadUrl"]);
    expect(json.uploadUrl).toBe("https://s/signed-put");
    expect(json.objectKey).toMatch(/^portfolio\/[a-z0-9-]+-a_b\.png$/);
    expect(json.expiresIn).toBe(300);
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
    expect(await res.json()).toEqual({ media: { id: "m1", storage_path: "k", url: "u" } });
    const params = query.mock.calls[0][1]!;
    expect(params).toEqual(["uploads/k.png", "https://pub/uploads/k.png", "alt", null, "upload", "image/png", 7, "e1", null]);
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
    expect(await res.json()).toEqual({ media: { id: "m1", storage_path: "k", url: "u" } });
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
    const res = await POST(new Request("http://localhost/api/media/proxy", { method: "POST", headers: { cookie: "admin_session=1" }, body: fd }));
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
