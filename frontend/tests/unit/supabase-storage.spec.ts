import { describe, it, expect, vi, beforeEach } from "vitest";

const bucketApi = {
  createSignedUploadUrl: vi.fn(async (_k: string) => ({ data: { signedUrl: "https://s/up" }, error: null })),
  createSignedUrl: vi.fn(async (_k: string, _e: number) => ({ data: { signedUrl: "https://s/get" }, error: null })),
  remove: vi.fn(async (_k: string[]) => ({ data: [], error: null }) as any),
  info: vi.fn(async (_k: string) => ({ data: { size: 42, etag: '"abc"', contentType: "image/png" }, error: null }) as any),
  upload: vi.fn(async (_k: string, _b: any, _o: any) => ({ data: { path: "k" }, error: null }) as any),
  getPublicUrl: vi.fn((k: string) => ({ data: { publicUrl: `https://s/public/${k}` } })),
};
const storage = {
  from: vi.fn((_b: string) => bucketApi),
  getBucket: vi.fn(async (_b: string) => ({ data: { id: "b" }, error: null }) as any),
  createBucket: vi.fn(async (_b: string, _o: any) => ({ data: {}, error: null }) as any),
};
vi.mock("@/lib/supabase/server", () => ({ getSupabase: () => ({ storage }) }));

beforeEach(() => {
  process.env.SUPABASE_STORAGE_BUCKET = "b";
  vi.clearAllMocks();
});

describe("supabase-storage", () => {
  it("presignPut returns the signed upload url (string) for the configured bucket", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    expect(await m.presignPut("a/b c.png")).toBe("https://s/up");
    expect(storage.from).toHaveBeenCalledWith("b");
    expect(bucketApi.createSignedUploadUrl).toHaveBeenCalledWith("a/b c.png");
  });
  it("presignGet passes expiry", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    expect(await m.presignGet("k", 60)).toBe("https://s/get");
    expect(bucketApi.createSignedUrl).toHaveBeenCalledWith("k", 60);
  });
  it("statObject returns size plus etag and content-type in the MinIO-compatible shape", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    const s = await m.statObject("k");
    expect(s.size).toBe(42);
    expect(s.etag).toBe("abc");
    expect(s.metaData["content-type"]).toBe("image/png");
  });
  it("statObject rejects when the object is missing", async () => {
    bucketApi.info.mockResolvedValueOnce({ data: null, error: { message: "Object not found" } });
    const m = await import("@/lib/storage/supabase-storage");
    await expect(m.statObject("k")).rejects.toThrow("Object not found");
  });
  it("removeObject throws on error", async () => {
    bucketApi.remove.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const m = await import("@/lib/storage/supabase-storage");
    await expect(m.removeObject("k")).rejects.toThrow("boom");
  });
  it("removeObject removes the key", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    await m.removeObject("k");
    expect(bucketApi.remove).toHaveBeenCalledWith(["k"]);
  });
  it("getPublicUrl returns https url", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    expect(m.getPublicUrl("x/y.png")).toBe("https://s/public/x/y.png");
  });
  it("putObject uploads the buffer with content type and throws on error", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    const buf = Buffer.from("hi");
    await m.putObject("k.png", buf, "image/png");
    expect(bucketApi.upload).toHaveBeenCalledWith("k.png", buf, { contentType: "image/png", upsert: false });
    bucketApi.upload.mockResolvedValueOnce({ data: null, error: { message: "nope" } });
    await expect(m.putObject("k.png", buf, "image/png")).rejects.toThrow("nope");
  });
  it("ensureBucketExists creates a public bucket only when missing", async () => {
    const m = await import("@/lib/storage/supabase-storage");
    await m.ensureBucketExists();
    expect(storage.createBucket).not.toHaveBeenCalled();
    storage.getBucket.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    await m.ensureBucketExists();
    expect(storage.createBucket).toHaveBeenCalledWith("b", { public: true });
  });
  it("throws a clear error when SUPABASE_STORAGE_BUCKET is unset (no silent default bucket)", async () => {
    delete process.env.SUPABASE_STORAGE_BUCKET;
    const m = await import("@/lib/storage/supabase-storage");
    expect(() => m.getPublicUrl("k")).toThrow(/SUPABASE_STORAGE_BUCKET/);
    await expect(m.removeObject("k")).rejects.toThrow(/SUPABASE_STORAGE_BUCKET/);
    await expect(m.ensureBucketExists()).rejects.toThrow(/SUPABASE_STORAGE_BUCKET/);
    process.env.SUPABASE_STORAGE_BUCKET = " ";
    expect(() => m.getPublicUrl("k")).toThrow(/SUPABASE_STORAGE_BUCKET/);
  });
});
