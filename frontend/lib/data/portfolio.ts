import { query } from "@/lib/db/client";

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  type: "saas" | "mobile";
  screenshot: string;
  websiteUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
};

const PLACEHOLDER_ITEMS: PortfolioItem[] = [
  {
    id: "dialable",
    title: "Dialable",
    description: "Global SaaS dialer platform with competitive international rates",
    type: "saas",
    screenshot: "https://picsum.photos/seed/dialable/400/300",
    websiteUrl: "https://www.dialable.world",
  },
  {
    id: "maximus",
    title: "Maximus IPTV Player",
    description: "Feature-rich IPTV player for iOS with M3U and Xtream support",
    type: "mobile",
    screenshot: "https://picsum.photos/seed/maximus/400/300",
    appStoreUrl: "https://apps.apple.com/app/maximus-iptv-player-m3u-xtream/id6744410529",
  },
  {
    id: "cloudsync",
    title: "CloudSync Pro",
    description: "Enterprise file synchronization and collaboration platform",
    type: "saas",
    screenshot: "https://picsum.photos/seed/cloudsync/400/300",
    websiteUrl: "https://cloudsync.example.com",
  },
];

export async function getAllPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const rows = await query<any>(
      "SELECT * FROM portfolio_items ORDER BY created_at DESC"
    );

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        screenshot: row.screenshot,
        websiteUrl: row.website_url,
        appStoreUrl: row.app_store_url,
        playStoreUrl: row.play_store_url,
      }));
    }
  } catch (error) {
    console.warn("Falling back to placeholder portfolio items", error);
  }

  return PLACEHOLDER_ITEMS;
}

export async function getPortfolioItemBySlug(
  slug: string
): Promise<PortfolioItem | null> {
  try {
    const rows = await query<any>(
      "SELECT * FROM portfolio_items WHERE title = $1 LIMIT 1",
      [slug.replace(/-/g, " ")]
    );

    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        screenshot: row.screenshot,
        websiteUrl: row.website_url,
        appStoreUrl: row.app_store_url,
        playStoreUrl: row.play_store_url,
      };
    }
  } catch (error) {
    console.warn("Error fetching portfolio item:", error);
  }

  // Fallback to placeholder
  const item = PLACEHOLDER_ITEMS.find((item) => item.id === slug);
  return item || null;
}
