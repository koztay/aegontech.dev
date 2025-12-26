import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { PortfolioStrip } from "@/components/sections/portfolio-strip";
import { buildPageMeta } from "@/lib/seo/meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegontech.dev";

export const metadata: Metadata = buildPageMeta({
  title: "AegonTech Studio — SaaS & Mobile Launches",
  description: "We design, build, and launch modern SaaS and mobile apps with performance, SEO, and accessibility baked in.",
  url: SITE_URL,
  image: `${SITE_URL}/assets/og-default.png`
});

export default function MarketingPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <PortfolioStrip />
    </main>
  );
}
