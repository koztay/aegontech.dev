import { describe, it, expect, beforeEach, vi } from "vitest";

describe("getSupabase", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when env is missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { getSupabase } = await import("@/lib/supabase/server");
    expect(() => getSupabase()).toThrow(/SUPABASE_URL/);
  });

  it("returns a cached client when configured", async () => {
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "k";
    const { getSupabase } = await import("@/lib/supabase/server");
    expect(getSupabase()).toBe(getSupabase());
  });
});
