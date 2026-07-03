import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Smartphone, Globe } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";
import { Reveal } from "./Reveal";

function WorkLinks({ links }: { links: PortfolioItem["links"] }) {
  const both = links.appStore && links.playStore;
  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-[0.16em]">
      {links.appStore && (
        <a
          href={links.appStore}
          target="_blank"
          rel="noopener noreferrer"
          className="link-under text-foreground/80 hover:text-signal"
        >
          App Store <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {links.playStore && (
        <a
          href={links.playStore}
          target="_blank"
          rel="noopener noreferrer"
          className="link-under text-foreground/80 hover:text-signal"
        >
          Play Store <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {links.website && (
        <a
          href={links.website}
          target="_blank"
          rel="noopener noreferrer"
          className="link-under text-foreground/80 hover:text-signal"
        >
          {both ? "Website" : "Visit site"} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function SelectedWork({ items }: { items: PortfolioItem[] }) {
  return (
    <section id="work" className="relative scroll-mt-16 border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        {/* Section header */}
        <div className="flex flex-col gap-8 border-b border-border pb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal className="eyebrow">
              <span className="text-signal">01</span>
              <span className="h-px w-6 bg-border" />
              Selected Work
            </Reveal>
            <Reveal variant="clip" delay={80}>
              <h2 className="mt-5 text-section font-semibold text-foreground">
                Products we designed, built, and put into the world.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160} className="shrink-0">
            <Link
              href="/portfolio"
              className="link-under font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              View full index <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        {/* Editorial rows */}
        <div className="mt-4">
          {items.map((item, i) => {
            const idx = String(i + 1).padStart(2, "0");
            const flipped = i % 2 === 1;
            const isMobile = item.type === "mobile";
            return (
              <Reveal
                key={item.id}
                className="group grid grid-cols-1 items-center gap-8 border-b border-border py-14 md:grid-cols-12 md:gap-12 lg:py-20"
              >
                {/* Media */}
                <div
                  className={`md:col-span-7 ${flipped ? "md:order-2" : "md:order-1"}`}
                >
                  <div className="panel group/panel relative overflow-hidden rounded-md">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                      <Image
                        src={item.screenshot}
                        alt={`${item.title} — product screenshot`}
                        fill
                        sizes="(max-width: 768px) 100vw, 58vw"
                        quality={85}
                        className="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      {/* gold hairline sweep on hover */}
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-transparent transition-colors duration-500 group-hover:ring-signal/40" />
                    </div>
                    {/* type tag */}
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-sm border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                      {isMobile ? (
                        <Smartphone className="h-3 w-3 text-signal" />
                      ) : (
                        <Globe className="h-3 w-3 text-signal" />
                      )}
                      {isMobile ? "Mobile" : "SaaS"}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div
                  className={`md:col-span-5 ${flipped ? "md:order-1" : "md:order-2"}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-signal">{idx}</span>
                    <span className="h-px flex-1 bg-border" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      {isMobile ? "iOS · Android" : "Web"}
                    </span>
                  </div>
                  <h3 className="mt-5 text-display-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-4">
                    {item.description}
                  </p>
                  <WorkLinks links={item.links} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
