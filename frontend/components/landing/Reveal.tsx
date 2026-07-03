"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** ms delay before the reveal animation kicks in */
  delay?: number;
  /** "rise" = fade + translate up, "clip" = wipe reveal for headlines */
  variant?: "rise" | "clip";
  as?: ElementType;
  once?: boolean;
}

/**
 * Lightweight scroll-reveal. Uses IntersectionObserver; the visual is driven
 * entirely by the `.reveal` / `.reveal-clip` CSS (which respects reduced-motion).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
  as,
  once = true,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  // Both variants use the same reliable rise mechanism. "clip" is kept as an
  // API hint (headlines) but renders via `.reveal` — the clip-path variant was
  // intermittently failing to trigger under fast scroll, and a blank headline
  // is never an acceptable failure mode.
  void variant;
  const base = "reveal";

  return (
    <Tag
      ref={ref as never}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
