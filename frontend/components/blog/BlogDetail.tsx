import type { BlogDetailProps } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";

export function BlogDetail({ post }: BlogDetailProps) {
  const publishedDate = new Date(post.publishedAt);
  const isoDate = publishedDate.toISOString();
  const formattedDate = publishedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        {/* Back */}
        <Link
          href="/blog"
          className="link-under font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
        </Link>

        {/* Meta + title */}
        <header className="mt-10">
          <time
            dateTime={isoDate}
            className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="signal-tick rotate-45" aria-hidden />
            {formattedDate}
          </time>
          <h1 className="mt-5 text-display-sm font-semibold leading-tight text-foreground">
            {post.title}
          </h1>
        </header>

        {/* Featured image */}
        <div className="panel relative mt-10 aspect-[16/9] overflow-hidden rounded-md bg-surface-2">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            quality={90}
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="mt-12 max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <h2
                  className="mb-4 mt-12 font-display text-2xl font-semibold text-foreground"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="mb-3 mt-8 font-display text-xl font-semibold text-foreground"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="my-5 text-[1.0625rem] leading-relaxed text-muted-foreground" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-foreground" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-signal underline underline-offset-4 hover:text-signal-bright" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="my-5 list-disc space-y-2 pl-5 text-muted-foreground marker:text-signal" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="my-5 list-decimal space-y-2 pl-5 text-muted-foreground marker:text-signal" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed text-muted-foreground" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="my-6 border-l-2 border-signal pl-5 font-display text-lg italic text-foreground"
                  {...props}
                />
              ),
              img: ({ node, ...props }) => {
                const src = props.src as string;
                const isExternal = src?.startsWith("http");
                if (isExternal) {
                  return (
                    <img
                      alt={props.alt || "Blog content image"}
                      className="my-8 h-auto w-full rounded-md border border-border"
                      loading="lazy"
                      {...props}
                    />
                  );
                }
                return (
                  <Image
                    src={src}
                    alt={props.alt || "Blog content image"}
                    width={800}
                    height={450}
                    className="my-8 rounded-md border border-border"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
