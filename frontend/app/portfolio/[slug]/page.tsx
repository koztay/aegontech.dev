import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMeta } from "@/lib/seo/meta";
import { getSupabaseClient } from "@/lib/supabase/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";
const BUCKET = "public-media";
export const revalidate = 300;

type PortfolioRow = {
  id: string;
  title: string;
  summary: string | null;
  hero_link: string | null;
  tags: string[] | null;
  metadata_snapshot: Record<string, unknown> | null;
  status: string;
};

async function fetchPortfolio(slug: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id,title,summary,hero_link,tags,metadata_snapshot,status")
    .eq("id", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data;
}

async function fetchMedia(portfolioId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("storage_path,alt_text")
    .eq("portfolio_item_id", portfolioId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return data as { storage_path: string; alt_text: string };
}

function publicUrl(path: string) {
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${path}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const record = await fetchPortfolio(slug);
  const media = record ? await fetchMedia(record.id) : null;
  const image = media ? publicUrl(media.storage_path) ?? undefined : undefined;

  return buildPageMeta({
    title: record?.title ?? "Portfolio item",
    description: record?.summary ?? "Recent work showcase",
    url: `${SITE_URL}/portfolio/${slug}`,
    image,
    type: "article"
  });
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await fetchPortfolio(slug);
  if (!record) {
    notFound();
  }
  const media = await fetchMedia(record.id);
  const imageUrl = media ? publicUrl(media.storage_path) : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">Portfolio</p>
        <h1 className="text-4xl font-semibold text-ink">{record.title}</h1>
        {record.summary ? <p className="text-lg text-slate-600">{record.summary}</p> : null}
        {record.hero_link ? (
          <a
            href={record.hero_link}
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            Visit project
          </a>
        ) : null}
        {record.tags && record.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {record.tags.map((tag: string) => (
              <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {imageUrl ? (
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={media?.alt_text ?? record.title} className="h-auto w-full" loading="lazy" />
        </div>
      ) : null}

      {record.metadata_snapshot ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Metadata</h2>
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <pre>{JSON.stringify(record.metadata_snapshot, null, 2)}</pre>
          </div>
        </section>
      ) : null}
    </main>
  );
}
