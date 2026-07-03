import type { PortfolioGridProps } from "@/lib/types";
import { PortfolioCard } from "./PortfolioCard";

export function PortfolioGrid({ items }: PortfolioGridProps) {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        {/* Header */}
        <header className="border-b border-border pb-12">
          <div className="eyebrow">
            <span className="signal-tick rotate-45" aria-hidden />
            The Index
          </div>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-display font-semibold text-foreground">Portfolio</h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Every product we&apos;ve designed, built, and shipped — SaaS
              platforms and mobile apps, in the wild and in use.
            </p>
          </div>
          <div className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">{String(items.length).padStart(2, "0")}</span>{" "}
            {items.length === 1 ? "entry" : "entries"}
          </div>
        </header>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
