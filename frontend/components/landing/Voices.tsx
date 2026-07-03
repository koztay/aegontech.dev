"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";

export function Voices({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % testimonials.length),
      6500
    );
    return () => clearInterval(t);
  }, [paused, testimonials.length]);

  if (!testimonials.length) return null;
  const current = testimonials[active];

  return (
    <section
      id="voices"
      className="relative scroll-mt-16 border-t border-border py-24 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <div className="eyebrow">
          <span className="text-signal">04</span>
          <span className="h-px w-6 bg-border" />
          Voices
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            {/* big gold quote mark */}
            <span
              aria-hidden
              className="block font-display text-7xl leading-none text-signal/70"
            >
              &ldquo;
            </span>
            <blockquote
              key={active}
              className="animate-fade-up -mt-4 max-w-4xl font-display text-2xl font-medium leading-[1.3] text-foreground sm:text-[2rem] sm:leading-[1.28]"
            >
              {current.quote}
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em]">
              <span className="signal-tick rotate-45" aria-hidden />
              <span className="text-foreground">{current.clientName}</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-muted-foreground">{current.clientCompany}</span>
            </figcaption>
          </div>

          {/* dot controls */}
          <div className="flex gap-3 lg:col-span-3 lg:flex-col lg:items-end lg:justify-end">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show quote from ${t.clientName}`}
                aria-current={i === active ? "true" : undefined}
                className="group flex items-center gap-3"
              >
                <span
                  className={`font-mono text-[10px] tabular-nums transition-colors ${
                    i === active ? "text-signal" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`h-px transition-all duration-300 ${
                    i === active
                      ? "w-10 bg-signal"
                      : "w-5 bg-border group-hover:w-8 group-hover:bg-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
