import { getSupabaseClient } from "@/lib/supabase/client";

export type PortfolioItem = {
  id: string;
  title: string;
  summary: string;
  type: "web" | "app";
  link: string;
  order_rank: number;
  image: string;
};

const PLACEHOLDER_ITEMS: PortfolioItem[] = [
  {
    id: "dialable",
    title: "Dialable",
    summary: "Global SaaS dialer platform",
    type: "web",
    link: "https://www.dialable.world",
    order_rank: 1,
    image: "/assets/placeholder.svg"
  },
  {
    id: "maximus",
    title: "Maximus IPTV",
    summary: "Premium streaming app experience",
    type: "app",
    link: "https://apps.apple.com/app/maximus-iptv-player-m3u-xtream/id6744410529",
    order_rank: 2,
    image: "/assets/placeholder.svg"
  },
  {
    id: "saas-kit",
    title: "SaaS Launch Kit",
    summary: "Composable foundations for SaaS",
    type: "web",
    link: "https://aegontech.dev/saas-kit",
    order_rank: 3,
    image: "/assets/placeholder.svg"
  }
];

type PortfolioRow = {
  id: string;
  title: string;
  summary: string | null;
  type: "web" | "app";
  hero_link: string | null;
  order_rank: number | null;
  status: string;
  featured_flag: boolean | null;
};

function mapRowToItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    type: row.type,
    link: row.hero_link ?? "#",
    order_rank: row.order_rank ?? 0,
    image: "/assets/placeholder.svg"
  };
}

export async function getFeaturedPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("id,title,summary,type,hero_link,order_rank,status,featured_flag")
      .eq("status", "published")
      .order("featured_flag", { ascending: false })
      .order("order_rank", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(6);

    if (error) throw error;

    const items = (data ?? [])
      .filter((row) => row.featured_flag)
      .map(mapRowToItem);

    if (items.length >= 3) return items.slice(0, 3);

    const filler = (data ?? [])
      .filter((row) => !row.featured_flag)
      .map(mapRowToItem)
      .slice(0, 3 - items.length);

    const combined = [...items, ...filler];
    if (combined.length > 0) return combined;
  } catch (error) {
    console.warn("Falling back to placeholder portfolio items", error);
  }

  return PLACEHOLDER_ITEMS;
}
