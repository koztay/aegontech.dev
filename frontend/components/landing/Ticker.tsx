const ITEMS = [
  "Dolfy",
  "Dialable",
  "Maximus IPTV",
  "EmolyTicks",
  "SaaS Platforms",
  "Mobile Apps",
  "AI & Machine Learning",
  "Cloud Infrastructure",
  "UI / UX Design",
];

export function Ticker() {
  // Two copies for a seamless -50% loop
  const loop = [...ITEMS, ...ITEMS];

  return (
    <section
      aria-label="What we build"
      className="ticker-host relative overflow-hidden border-y border-border bg-surface-2/40 py-5"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-ticker">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center whitespace-nowrap">
            <span className="px-6 font-display text-lg font-medium text-foreground/80 sm:text-xl">
              {item}
            </span>
            <span className="signal-tick rotate-45" aria-hidden />
          </div>
        ))}
      </div>
    </section>
  );
}
