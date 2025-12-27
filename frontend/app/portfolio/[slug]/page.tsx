import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMeta } from "@/lib/seo/meta";
import { getPortfolioItemBySlug } from "@/lib/data/portfolio";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);

  return buildPageMeta({
    title: item?.title ?? "Portfolio item",
    description: item?.description ?? "Recent work showcase",
    url: `${SITE_URL}/portfolio/${slug}`,
    image: item?.screenshot,
    type: "article",
  });
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const projectUrl =
    item.links.website || item.links.appStore || item.links.playStore;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">
          Portfolio
        </p>
        <h1 className="text-4xl font-semibold text-ink">{item.title}</h1>
        {item.description ? (
          <p className="text-lg text-slate-600">{item.description}</p>
        ) : null}
        {projectUrl ? (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            Visit project →
          </a>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
            {item.type === "saas" ? "SaaS" : "Mobile App"}
          </span>
        </div>
      </div>

      {item.screenshot ? (
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.screenshot}
            alt={item.title}
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      ) : null}
    </main>
  );
}
