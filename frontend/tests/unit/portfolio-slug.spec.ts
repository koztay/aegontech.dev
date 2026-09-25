import { vi } from "vitest";
import { slugify } from "@/lib/slug";

const queryMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

vi.mock("@/lib/storage/supabase-storage", () => ({
  getPublicUrl: (key: string) => `https://cdn.example.com/${key}`,
}));

import { getPortfolioItemBySlug } from "@/lib/data/portfolio";

const ROW = {
  id: "b96f4710-f8a0-4e40-a0c9-642029043d24",
  title: "Maximus IPTV Player",
  description: "Feature-rich IPTV player for iPhone, iPad, Android and Android TV",
  type: "mobile",
  screenshot: "portfolio/abc-Maximus.png",
  website_url: "https://www.maximusplayer.com",
  app_store_url: "https://apps.apple.com/app/id6744410529",
  play_store_url: "https://play.google.com/store/apps/details?id=com.aegontech.maximus",
};

describe("slugify", () => {
  test("matches the URLs already published in the sitemap", () => {
    expect(slugify("Maximus IPTV Player")).toBe("maximus-iptv-player");
    expect(slugify("Dialable")).toBe("dialable");
    expect(slugify("CloudSync Pro")).toBe("cloudsync-pro");
  });

  test("transliterates Turkish letters instead of dropping them", () => {
    // Without transliteration this collapses to "evre-temiz", because every
    // character outside [a-z0-9] is treated as a separator.
    expect(slugify("Çevre Temiz")).toBe("cevre-temiz");
    expect(slugify("Işık Güneş")).toBe("isik-gunes");
    expect(slugify("Şehir Ağı")).toBe("sehir-agi");
    expect(slugify("İstanbul")).toBe("istanbul");
  });

  test("strips other diacritics and tidies separators", () => {
    expect(slugify("Café Déjà")).toBe("cafe-deja");
    expect(slugify("  Spaced  Out  ")).toBe("spaced-out");
    expect(slugify("A/B — Test")).toBe("a-b-test");
  });
});

describe("getPortfolioItemBySlug", () => {
  // Block body on purpose: mockReset() returns the mock, and Vitest calls a
  // function returned from a hook as its teardown.
  beforeEach(() => {
    queryMock.mockReset();
  });

  test("resolves a multi-word title whose slug differs in case", async () => {
    queryMock.mockResolvedValue([ROW]);

    const item = await getPortfolioItemBySlug("maximus-iptv-player");

    expect(item).not.toBeNull();
    expect(item!.title).toBe("Maximus IPTV Player");
    expect(item!.links.playStore).toBe(ROW.play_store_url);
    expect(item!.screenshot).toBe("https://cdn.example.com/portfolio/abc-Maximus.png");
  });

  test("returns null for a slug that matches no item", async () => {
    queryMock.mockResolvedValue([ROW]);
    expect(await getPortfolioItemBySlug("not-a-real-project")).toBeNull();
  });

  test("falls back to placeholder items when the database is unreachable", async () => {
    // Throws synchronously, like getDbPool() does when DATABASE_URL is unset;
    // getAllPortfolioItems() catches both that and a rejected query the same way.
    queryMock.mockImplementation(() => {
      throw new Error("connection refused");
    });

    const item = await getPortfolioItemBySlug("maximus-iptv-player");

    expect(item).not.toBeNull();
    expect(item!.links.playStore).toContain("com.aegontech.maximus");
  });
});
