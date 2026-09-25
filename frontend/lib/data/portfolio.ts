import { query } from "@/lib/db/client";
import { getPublicUrl } from "@/lib/storage/supabase-storage";
import { slugify } from "@/lib/slug";
import type { PortfolioItem } from "@/lib/types";

export type { PortfolioItem } from "@/lib/types";

const PLACEHOLDER_ITEMS: PortfolioItem[] = [
  {
    id: "dialable",
    title: "Dialable",
    description: "Global SaaS dialer platform with competitive international rates",
    type: "saas",
    screenshot: "https://picsum.photos/seed/dialable1234/400/300",
    links: {
      website: "https://www.dialable.world",
    },
  },
  {
    id: "maximus",
    title: "Maximus IPTV Player",
    description:
      "Feature-rich IPTV player for iPhone, iPad, Android and Android TV — M3U and Xtream Codes, live EPG, casting, and offline downloads",
    type: "mobile",
    screenshot: "https://picsum.photos/seed/maximus5678/400/300",
    links: {
      website: "https://www.maximusplayer.com",
      appStore:
        "https://apps.apple.com/app/maximus-iptv-player-m3u-xtream/id6744410529",
      playStore: "https://play.google.com/store/apps/details?id=com.aegontech.maximus",
    },
  },
  {
    id: "cloudsync",
    title: "CloudSync Pro",
    description: "Enterprise file synchronization and collaboration platform",
    type: "saas",
    screenshot: "https://picsum.photos/seed/cloudsync9012/400/300",
    links: {
      website: "https://cloudsync.example.com",
    },
  },
];

function mapRow(row: any): PortfolioItem {
  let screenshotUrl = row.screenshot;
  if (screenshotUrl && !screenshotUrl.startsWith("http")) {
    screenshotUrl = getPublicUrl(screenshotUrl);
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    screenshot: screenshotUrl,
    links: {
      website: row.website_url || undefined,
      appStore: row.app_store_url || undefined,
      playStore: row.play_store_url || undefined,
    },
  };
}

export async function getAllPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const rows = await query<any>(
      "SELECT * FROM portfolio_items WHERE published = true ORDER BY created_at DESC"
    );

    if (rows.length > 0) {
      return rows.map(mapRow);
    }
  } catch (error) {
    console.warn("Falling back to placeholder portfolio items", error);
  }

  return PLACEHOLDER_ITEMS;
}

export async function getPortfolioItemBySlug(
  slug: string
): Promise<PortfolioItem | null> {
  // Resolve through the same slugify() the sitemap and cards use rather than
  // trying to invert the slug back into a title. The previous approach
  // (slug.replace(/-/g, " ")) matched `title` case-sensitively in SQL, so every
  // lookup missed and multi-word items 404'd.
  const items = await getAllPortfolioItems();
  return items.find((item) => slugify(item.title) === slug) ?? null;
}

export async function getFeaturedPortfolioItems(): Promise<PortfolioItem[]> {
  const allItems = await getAllPortfolioItems();
  return allItems.slice(0, 3); // Return first 3 items as featured
}
