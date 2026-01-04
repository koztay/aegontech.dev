import type { BlogCardProps } from "@/lib/types";
import { Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Link href={`/blog/${post.slug}`}>
            <article
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
            >
            {/* Featured Image */}
            <div
                className="relative overflow-hidden bg-slate-100 dark:bg-slate-800"
                style={{ height: "200px" }}
            >
                <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Date */}
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt}>{formattedDate}</time>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Read More */}
                <div className="mt-4">
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:underline">
                        Read More →
                    </span>
                </div>
            </div>
            </article>
        </Link>
    );
}
