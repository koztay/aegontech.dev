import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Smartphone, Globe } from "lucide-react";
import { buildPageMeta, buildCreativeWorkSchema, buildBreadcrumbSchema } from "@/lib/seo/meta";
import { getPortfolioItemBySlug } from "@/lib/data/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicShell } from "@/components/shell/PublicShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

const navigationItems = [
  { label: "Work", href: "/#work" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

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

  const isMobile = item.type === "mobile";

  const creativeWorkSchema = buildCreativeWorkSchema({
    name: item.title,
    description: item.description || "",
    url: `${SITE_URL}/portfolio/${slug}`,
    image: item.screenshot,
    keywords: [item.type === "saas" ? "SaaS" : "Mobile App"],
    applicationCategory: item.type === "saas" ? "BusinessApplication" : "MobileApplication",
    operatingSystem: item.type === "saas" ? "Web Browser" : "iOS, Android",
  });

  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "Home", url: SITE_URL },
      { name: "Portfolio", url: `${SITE_URL}/portfolio` },
      { name: item.title, url: `${SITE_URL}/portfolio/${slug}` },
    ],
  });

  const links = [
    item.links.website && { label: "Visit site", href: item.links.website },
    item.links.appStore && { label: "App Store", href: item.links.appStore },
    item.links.playStore && { label: "Play Store", href: item.links.playStore },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <PublicShell navigationItems={navigationItems} currentPath="/portfolio">
      <JsonLd schema={creativeWorkSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <article className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <Link
            href="/portfolio"
            className="link-under font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
          </Link>

          <header className="mt-10 border-b border-border pb-10">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {isMobile ? (
                <Smartphone className="h-3.5 w-3.5 text-signal" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-signal" />
              )}
              {isMobile ? "Mobile App · iOS / Android" : "SaaS · Web"}
            </div>
            <h1 className="mt-5 text-display font-semibold text-foreground">
              {item.title}
            </h1>
            {item.description ? (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}
            {links.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em]">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-under text-foreground/80 hover:text-signal"
                  >
                    {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </header>

          {item.screenshot ? (
            <div className="panel mt-12 overflow-hidden rounded-md">
              <Image
                src={item.screenshot}
                alt={item.title}
                width={1920}
                height={1080}
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
                quality={90}
                priority
              />
            </div>
          ) : null}
        </div>
      </article>
    </PublicShell>
  );
}
