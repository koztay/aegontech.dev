import type { PortfolioCardProps } from "@/lib/types";
import { ArrowUpRight, Smartphone, Globe } from "lucide-react";
import Image from "next/image";

export function PortfolioCard({ item }: PortfolioCardProps) {
  const isMobile = item.type === "mobile";
  const both = item.links.appStore && item.links.playStore;

  return (
    <article className="panel group flex flex-col overflow-hidden rounded-md transition-colors hover:border-signal/40">
      {/* Screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <Image
          src={item.screenshot}
          alt={`${item.title} — product screenshot`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          {isMobile ? (
            <Smartphone className="h-3 w-3 text-signal" />
          ) : (
            <Globe className="h-3 w-3 text-signal" />
          )}
          {isMobile ? "Mobile" : "SaaS"}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {item.description}
        </p>

        {/* Links */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 font-mono text-[11px] uppercase tracking-[0.16em]">
          {item.links.appStore && (
            <a
              href={item.links.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="link-under text-foreground/80 hover:text-signal"
            >
              App Store <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          {item.links.playStore && (
            <a
              href={item.links.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="link-under text-foreground/80 hover:text-signal"
            >
              Play Store <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          {item.links.website && (
            <a
              href={item.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="link-under text-foreground/80 hover:text-signal"
            >
              {both ? "Website" : "Visit site"} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
