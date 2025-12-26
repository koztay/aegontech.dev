export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          SaaS & Mobile Product Studio
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
          We design, build, and launch <span className="text-accent">modern SaaS</span> and mobile apps.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          From zero to launch: product strategy, UX, engineering, and growth-ready infrastructure with SEO, performance, and accessibility baked in.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-white shadow-lg shadow-accent/30 transition hover:translate-y-[-2px] hover:shadow-accent/40"
            href="#portfolio"
          >
            View portfolio
          </a>
          <a
            className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-ink transition hover:border-accent hover:text-accent"
            href="mailto:hello@aegontech.dev"
          >
            Book a call
          </a>
        </div>
      </div>
    </section>
  );
}
