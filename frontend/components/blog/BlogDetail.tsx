import type { BlogDetailProps } from "@/lib/types";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";

export function BlogDetail({ post, onBack }: BlogDetailProps) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <article className="py-16 bg-white dark:bg-slate-950">
            <div className="max-w-3xl mx-auto px-6">
                {/* Back Button */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Featured Image */}
                <div
                    className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-8"
                    style={{ height: "400px" }}
                >
                    <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        className="object-cover"
                    />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt}>{formattedDate}</time>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
                    {post.title}
                </h1>

                {/* Content */}
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => (
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed my-4" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside space-y-2 my-4 text-slate-600 dark:text-slate-400" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside space-y-2 my-4 text-slate-600 dark:text-slate-400" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li className="text-slate-600 dark:text-slate-400" {...props} />
                            ),
                            img: ({ node, ...props }) => {
                                const src = props.src as string;
                                // Check if it's a relative path (local image) or external URL
                                const isExternal = src.startsWith('http');
                                
                                if (isExternal) {
                                    return (
                                        <img
                                            alt={props.alt || 'Blog content image'}
                                            className="rounded-lg w-full h-auto my-6 shadow-md"
                                            loading="lazy"
                                            {...props}
                                        />
                                    );
                                }
                                
                                // For local images, use Next.js Image component
                                return (
                                    <Image
                                        src={src}
                                        alt={props.alt || 'Blog content image'}
                                        width={800}
                                        height={450}
                                        className="rounded-lg my-6 shadow-md"
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
