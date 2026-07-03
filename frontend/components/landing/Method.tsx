import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Define",
    body: "We pressure-test the idea, map the scope, and agree on what “done” looks like before a line of code is written.",
  },
  {
    n: "02",
    title: "Design",
    body: "Interface and flows come first. We prototype the real thing, so decisions are made on screens — not buried in documents.",
  },
  {
    n: "03",
    title: "Build",
    body: "Senior engineers ship in short cycles. You see working software every week, not a status report every month.",
  },
  {
    n: "04",
    title: "Ship & operate",
    body: "We launch to the App Store or the web, then stay on to monitor, fix, and iterate long after go-live.",
  },
];

export function Method() {
  return (
    <section
      id="method"
      className="relative scroll-mt-16 overflow-hidden border-t border-border bg-surface-2/30 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <div className="max-w-2xl">
          <Reveal className="eyebrow">
            <span className="text-signal">03</span>
            <span className="h-px w-6 bg-border" />
            The Method
          </Reveal>
          <Reveal variant="clip" delay={80}>
            <h2 className="mt-5 text-section font-semibold text-foreground">
              A studio you can watch work.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              The same four moves every time. Predictable process, so the
              product is the only surprise.
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 90}
              className="group relative bg-background p-8 transition-colors hover:bg-surface"
            >
              {/* top rule with gold tick */}
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.2em] text-signal">
                  {step.n}
                </span>
                <span className="signal-tick rotate-45 opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
