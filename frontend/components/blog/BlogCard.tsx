import type { BlogCardProps } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="panel flex h-full flex-col overflow-hidden rounded-md transition-colors group-hover:border-signal/40">
        {/* Featured image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <time
            dateTime={post.publishedAt}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            {formattedDate}
          </time>
          <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-signal">
            {post.title}
          </h2>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 border-t border-border pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/80 transition-colors group-hover:text-signal">
            Read <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
