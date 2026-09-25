// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";

// Uses the REAL supabase-js client (no network: getPublicUrl only builds a string) to pin down
// how getPublicUrl treats awkward object keys, as documented in supabase-storage.ts:
// the key is percent-encoded segment-wise; "/" separators are preserved.
describe("getPublicUrl with the real supabase-js client", () => {
  // node environment + a single client: no jsdom "Multiple GoTrueClient instances" warnings
  beforeAll(() => {
    process.env.SUPABASE_URL = "https://supabase.example.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.SUPABASE_STORAGE_BUCKET = "aegontech";
  });
  const base = "https://supabase.example.test/storage/v1/object/public/aegontech/";

  it("leaves sanitized keys untouched (all existing production keys)", async () => {
    const { getPublicUrl } = await import("@/lib/storage/supabase-storage");
    expect(getPublicUrl("uploads/moeqir7k-mnk5ew-1777145448058-ylbnd96sug.png")).toBe(`${base}uploads/moeqir7k-mnk5ew-1777145448058-ylbnd96sug.png`);
    expect(getPublicUrl("portfolio/A_b-1.PNG")).toBe(`${base}portfolio/A_b-1.PNG`);
  });
  it("percent-encodes spaces", async () => {
    const { getPublicUrl } = await import("@/lib/storage/supabase-storage");
    expect(getPublicUrl("uploads/my file.png")).toBe(`${base}uploads/my%20file.png`);
  });
  it("percent-encodes unicode as UTF-8", async () => {
    const { getPublicUrl } = await import("@/lib/storage/supabase-storage");
    expect(getPublicUrl("uploads/çevre günlüğü.png")).toBe(`${base}uploads/%C3%A7evre%20g%C3%BCnl%C3%BC%C4%9F%C3%BC.png`);
  });
  it("keeps nested slashes as path separators", async () => {
    const { getPublicUrl } = await import("@/lib/storage/supabase-storage");
    expect(getPublicUrl("a/b/c/d.png")).toBe(`${base}a/b/c/d.png`);
    expect(getPublicUrl("a b/c d/e.png")).toBe(`${base}a%20b/c%20d/e.png`);
  });
});
