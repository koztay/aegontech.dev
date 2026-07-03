import {
  Code2,
  Smartphone,
  Cloud,
  Palette,
  Server,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/types";
import { Reveal } from "./Reveal";

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  smartphone: Smartphone,
  cloud: Cloud,
  palette: Palette,
  server: Server,
  brain: BrainCircuit,
};

export function Practice({ services }: { services: Service[] }) {
  if (!services.length) return null;

  return (
    <section id="practice" className="relative scroll-mt-16 border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Sticky heading rail */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="md:sticky md:top-28">
              <Reveal className="eyebrow">
                <span className="text-signal">02</span>
                <span className="h-px w-6 bg-border" />
                Practice
              </Reveal>
              <Reveal variant="clip" delay={80}>
                <h2 className="mt-5 max-w-md text-section font-semibold text-foreground">
                  Everything a product needs, under one roof.
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
                  We&apos;re a small, senior team that owns the whole stack — so
                  strategy, design, and engineering stay in one conversation
                  instead of three handoffs.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Index of disciplines */}
          <div className="md:col-span-8 lg:col-span-7">
            <ul className="border-t border-border">
              {services.map((service, i) => {
                const Icon = ICONS[service.icon] ?? Code2;
                const idx = String(i + 1).padStart(2, "0");
                return (
                  <Reveal as="li" key={service.id} delay={i * 60}>
                    <div className="group relative grid grid-cols-[2.5rem_1fr] items-start gap-x-4 gap-y-2 border-b border-border py-7 pl-4 transition-colors sm:grid-cols-[3rem_1fr_1.75rem] sm:gap-x-6">
                      {/* gold marker on hover */}
                      <span className="pointer-events-none absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-signal transition-transform duration-300 group-hover:scale-y-100" />

                      <span className="pt-1 font-mono text-xs text-muted-foreground/70 transition-colors group-hover:text-signal">
                        {idx}
                      </span>

                      <div className="transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                          {service.title}
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                      </div>

                      <Icon
                        className="hidden h-5 w-5 self-center justify-self-end text-muted-foreground/40 transition-colors group-hover:text-signal sm:block"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
