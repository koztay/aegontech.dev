import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

interface HeroProps {
  shippedCount: number;
}

export function HeroSection({ shippedCount }: HeroProps) {
  const count = String(shippedCount).padStart(2, "0");

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] scroll-mt-16 flex-col justify-center overflow-hidden bg-background"
    >
      {/* Generated hero visual — abstract software-studio background (gold node network,
          glass panels, light streaks), muted autoplay loop */}
      <div className="absolute inset-0">
        {/* Static poster: the LCP paint + the reduced-motion fallback */}
        <Image
          src="/assets/hero-loop-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
          className="scale-105 object-cover object-center"
        />
        {/* Motion layer: muted autoplay loop, hidden for reduced-motion via .hero-video */}
        <video
          className="hero-video absolute inset-0 h-full w-full scale-105 object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/hero-loop-poster.webp"
          aria-hidden="true"
        >
          <source src="/assets/hero-loop.webm" type="video/webm" />
          <source src="/assets/hero-loop.mp4" type="video/mp4" />
        </video>
        {/* Legibility scrims: darken the text side (left) and the bottom seam */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
      </div>

      {/* Corner registration marks — instrument framing */}
      <div className="pointer-events-none absolute right-6 top-24 hidden font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground/70 sm:block md:right-12">
        <div className="text-right">39.1559&deg; N</div>
        <div className="text-right">75.5272&deg; W</div>
        <div className="mt-2 text-right text-signal">Index 00</div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-8xl px-6 pt-28 sm:px-8 lg:px-16">
        <div className="max-w-4xl">
          <div className="animate-fade-up eyebrow" style={{ animationDelay: "40ms" }}>
            <span className="signal-tick rotate-45" aria-hidden />
            Software Product Studio
            <span className="text-muted-foreground/50">— Dover, DE</span>
          </div>

          <h1
            className="animate-fade-up mt-8 text-mega font-semibold text-foreground"
            style={{ animationDelay: "140ms" }}
          >
            We build software products,
            <br />
            and <span className="text-signal">ship them.</span>
          </h1>

          <p
            className="animate-fade-up mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            style={{ animationDelay: "260ms" }}
          >
            Aegontech is a product studio. We design, engineer, and launch SaaS
            platforms and mobile apps end to end — from the first sketch to the
            App Store.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
            style={{ animationDelay: "380ms" }}
          >
            <Link
              href="#work"
              className="group inline-flex items-center gap-2 rounded-sm bg-signal px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-signal-bright hover:shadow-[0_10px_40px_-8px_hsl(var(--signal)/0.6)]"
            >
              See what we&apos;ve shipped
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#contact"
              className="link-under text-sm font-medium text-foreground/90 hover:text-foreground"
            >
              Start a project
            </Link>
          </div>
        </div>
      </div>

      {/* Instrument readout — real, verifiable metadata (not vanity stats) */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-8xl px-6 pb-10 sm:px-8 lg:px-16">
        <dl className="flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-border/60 pt-6 font-mono text-xs">
          <div className="flex items-baseline gap-2">
            <dt className="text-signal">{count}</dt>
            <dd className="uppercase tracking-[0.18em] text-muted-foreground">
              Products shipped
            </dd>
          </div>
          <div className="hidden h-3 w-px bg-border sm:block" />
          <div className="uppercase tracking-[0.18em] text-muted-foreground">
            SaaS · Mobile · AI
          </div>
          <div className="hidden h-3 w-px bg-border sm:block" />
          <div className="uppercase tracking-[0.18em] text-muted-foreground">
            Design → Build → Ship
          </div>
        </dl>
      </div>

      {/* Scroll cue */}
      <a
        href="#work"
        aria-label="Scroll to selected work"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground lg:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
