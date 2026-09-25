import { describe, it, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabaseImagePatterns } = require("../../config/supabase-image-patterns");

describe("supabaseImagePatterns", () => {
  it("derives the storage host pattern from SUPABASE_URL", () => {
    expect(supabaseImagePatterns({ SUPABASE_URL: "https://supabase.aegontech.dev" }, true)).toEqual([
      { protocol: "https", hostname: "supabase.aegontech.dev", port: "", pathname: "/storage/v1/object/public/**" },
    ]);
    expect(supabaseImagePatterns({ SUPABASE_URL: "http://localhost:54321" }, false)[0]).toMatchObject({ protocol: "http", hostname: "localhost", port: "54321" });
  });
  it("throws a clear error in a production build when unset or invalid", () => {
    expect(() => supabaseImagePatterns({}, true)).toThrow(/SUPABASE_URL is not set: it is required at build time/);
    expect(() => supabaseImagePatterns({ SUPABASE_URL: "nope" }, true)).toThrow(/not a valid URL/);
  });
  it("falls back to no pattern in dev/tests", () => {
    expect(supabaseImagePatterns({}, false)).toEqual([]);
    expect(supabaseImagePatterns({ SUPABASE_URL: "nope" }, false)).toEqual([]);
  });
});
