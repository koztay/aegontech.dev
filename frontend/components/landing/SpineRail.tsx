"use client";

import { useEffect, useState } from "react";

export interface SpineSection {
  id: string;
  index: string;
  label: string;
}

/**
 * The signature element: a fixed left "spine" — like the margin of an
 * engineering notebook. It indexes every section and a gold tick tracks
 * whichever section owns the viewport. Desktop-only, quiet, and it encodes
 * real structure (section order + count), not decoration.
 */
export function SpineRail({ sections }: { sections: SpineSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most-visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  const handleJump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Section index"
      className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      {/* vertical progress hairline */}
      <div className="pointer-events-none absolute left-[3px] top-0 h-full w-px bg-border" aria-hidden>
        <div
          className="w-px bg-signal/70 transition-[height] duration-150 ease-out"
          style={{ height: `${progress * 100}%`, boxShadow: "0 0 8px hsl(var(--signal) / 0.6)" }}
        />
      </div>

      <ul className="relative flex flex-col gap-6 pl-[14px]">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleJump(s.id)}
                className="group flex items-center gap-2.5 text-left"
                aria-current={isActive ? "true" : undefined}
                aria-label={`${s.index} ${s.label}`}
              >
                <span
                  className={`-ml-[15px] h-[7px] w-[7px] shrink-0 rotate-45 border transition-all duration-300 ${
                    isActive
                      ? "border-signal bg-signal shadow-[0_0_10px_hsl(var(--signal)/0.8)]"
                      : "border-border bg-background group-hover:border-muted-foreground"
                  }`}
                  aria-hidden
                />
                {/* always-on index; label expands on hover only */}
                <span
                  className={`font-mono text-[10px] tabular-nums transition-colors duration-300 ${
                    isActive ? "text-signal" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                  }`}
                >
                  {s.index}
                </span>
                <span
                  className={`max-w-0 overflow-hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
