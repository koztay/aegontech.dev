import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMeta, buildCreativeWorkSchema, buildBreadcrumbSchema } from "@/lib/seo/meta";
import { getPortfolioItemBySlug } from "@/lib/data/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";

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

  // Build CreativeWork schema
  const creativeWorkSchema = buildCreativeWorkSchema({
    name: item.title,
    description: item.description || "",
    url: `${SITE_URL}/portfolio/${slug}`,
    image: item.screenshot,
    keywords: [item.type === "saas" ? "SaaS" : "Mobile App"],
    applicationCategory: item.type === "saas" ? "BusinessApplication" : "MobileApplication",
    operatingSystem: item.type === "saas" ? "Web Browser" : "iOS, Android"
  });

  // Build BreadcrumbList schema
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "Home", url: SITE_URL },
      { name: "Portfolio", url: `${SITE_URL}/portfolio` },
      { name: item.title, url: `${SITE_URL}/portfolio/${slug}` }
    ]
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <JsonLd schema={creativeWorkSchema} />
      <JsonLd schema={breadcrumbSchema} />
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
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm relative">
          <Image
            src={item.screenshot}
            alt={item.title}
            width={1920}
            height={1080}
            className="h-auto w-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1920px"
            priority
          />
        </div>
      ) : null}
    </main>
  );
}
