import Image from "next/image";
import { PortfolioItem } from "@/lib/data/portfolio";

type Props = {
  item: PortfolioItem;
  priority?: boolean;
};

export function PortfolioCard({ item, priority }: Props) {
  const itemUrl = item.links.website || item.links.appStore || item.links.playStore || `/portfolio/${item.id}`;
  
  return (
    <a
      href={itemUrl}
      className="group relative flex min-w-[240px] max-w-[320px] snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <Image
          src={item.screenshot}
          alt={item.title}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
          <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">{item.type}</span>
          <span className="text-slate-500">Featured</span>
        </div>
        <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
        <p className="text-sm text-slate-600">{item.description}</p>
      </div>
    </a>
  );
}
