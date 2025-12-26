"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PortfolioCard } from "@/components/blocks/portfolio-card";
import { getFeaturedPortfolioItems, PortfolioItem } from "@/lib/data/portfolio";

const SCROLL_STEP = 0.9;
const POINTER_SWIPE_THRESHOLD = 36;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function PortfolioStrip() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStart = useRef<number | null>(null);

  useEffect(() => {
    getFeaturedPortfolioItems().then((data) => setItems(data.slice(0, 3)));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsAutoEnabled(false);
      setIsPaused(true);
    }
  }, [prefersReducedMotion]);

  const loopItems = useMemo(() => {
    if (items.length === 0) return [] as PortfolioItem[];
    return [...items, ...items];
  }, [items]);

  useEffect(() => {
    if (!containerRef.current || isPaused || !isAutoEnabled || loopItems.length === 0) return;
    const el = containerRef.current;
    let raf: number;
    const tick = () => {
      const widthHalf = el.scrollWidth / 2;
      el.scrollLeft = (el.scrollLeft + SCROLL_STEP) % widthHalf;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopItems, isPaused, isAutoEnabled]);

  const scrollByCard = useCallback(
    (direction: "next" | "prev") => {
      const el = containerRef.current;
      if (!el || !loopItems.length) return;
      const firstCard = el.querySelector<HTMLElement>("[data-card]");
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 320;
      const gap = 16;
      const delta = direction === "next" ? cardWidth + gap : -(cardWidth + gap);
      el.scrollBy({ left: delta, behavior: "smooth" });
    },
    [loopItems.length]
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    setIsPaused(true);
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerStart.current === null) return;
      const delta = event.clientX - pointerStart.current;
      if (Math.abs(delta) > POINTER_SWIPE_THRESHOLD) {
        scrollByCard(delta < 0 ? "next" : "prev");
      }
      pointerStart.current = null;
      setIsPaused(prefersReducedMotion);
    },
    [prefersReducedMotion, scrollByCard]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByCard("next");
        setIsPaused(true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByCard("prev");
        setIsPaused(true);
      }
    },
    [scrollByCard]
  );

  return (
    <section id="portfolio" className="bg-mist px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">
              Featured Work
            </p>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Three recent launches</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600" aria-label="Strip controls">
            <button
              className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setIsPaused((p) => !p)}
              aria-pressed={isPaused}
              data-testid="strip-pause"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => scrollByCard("prev")}
              data-testid="strip-prev"
            >
              Prev
            </button>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => scrollByCard("next")}
              data-testid="strip-next"
            >
              Next
            </button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative flex snap-x snap-mandatory overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 outline-none"
          role="region"
          aria-label="Featured portfolio items"
          tabIndex={0}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(prefersReducedMotion)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <div className="flex min-w-full gap-4">
            {loopItems.map((item, idx) => (
              <PortfolioCard key={`${item.id}-${idx}`} item={item} priority={idx === 0} />
            ))}
          </div>
        </div>
        {items.length < 3 && (
          <p className="text-sm text-slate-500">
            Fewer than 3 featured items available. Add more in admin to fill the strip.
          </p>
        )}
        {prefersReducedMotion && (
          <p className="text-xs text-slate-500">Animation paused to respect reduced motion preference.</p>
        )}
      </div>
    </section>
  );
}
