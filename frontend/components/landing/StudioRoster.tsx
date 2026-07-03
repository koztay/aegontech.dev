import type { TeamMember } from "@/lib/types";
import { Reveal } from "./Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StudioRoster({ members }: { members: TeamMember[] }) {
  if (!members.length) return null;

  return (
    <section
      id="studio"
      className="relative scroll-mt-16 border-t border-border bg-surface-2/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal className="eyebrow">
              <span className="text-signal">05</span>
              <span className="h-px w-6 bg-border" />
              The Studio
            </Reveal>
            <Reveal variant="clip" delay={80}>
              <h2 className="mt-5 max-w-xs text-section font-semibold text-foreground">
                Small team. Senior hands.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-xs text-base leading-relaxed text-muted-foreground">
                No account managers, no juniors learning on your budget. You
                work directly with the people building your product.
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {members.map((m, i) => (
                <Reveal
                  key={m.id}
                  delay={i * 70}
                  className="group bg-background p-8 transition-colors hover:bg-surface"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-sm text-muted-foreground transition-colors group-hover:border-signal group-hover:text-signal">
                      {initials(m.name)}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {m.name}
                      </h3>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal/80">
                        {m.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {m.bio}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
