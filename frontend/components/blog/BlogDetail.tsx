import type { BlogDetailProps } from "@/lib/types";
import { ArrowLeft, Calendar } from "lucide-react";

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
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </button>

                {/* Featured Image */}
                <div
                    className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-8"
                    style={{ height: "400px" }}
                >
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
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
                    {post.content.split("\n\n").map((paragraph, index) => {
                        if (paragraph.startsWith("## ")) {
                            return (
                                <h2
                                    key={index}
                                    className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4"
                                >
                                    {paragraph.replace("## ", "")}
                                </h2>
                            );
                        }
                        if (paragraph.startsWith("- ")) {
                            const items = paragraph
                                .split("\n")
                                .filter((line) => line.startsWith("- "));
                            return (
                                <ul key={index} className="list-disc list-inside space-y-2 my-4">
                                    {items.map((item, i) => (
                                        <li key={i} className="text-slate-600 dark:text-slate-400">
                                            {item.replace("- ", "")}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }
                        if (paragraph.match(/^\d\. /)) {
                            const items = paragraph
                                .split("\n")
                                .filter((line) => line.match(/^\d\. /));
                            return (
                                <ol
                                    key={index}
                                    className="list-decimal list-inside space-y-2 my-4"
                                >
                                    {items.map((item, i) => (
                                        <li key={i} className="text-slate-600 dark:text-slate-400">
                                            {item.replace(/^\d\. /, "")}
                                        </li>
                                    ))}
                                </ol>
                            );
                        }
                        return (
                            <p
                                key={index}
                                className="text-slate-600 dark:text-slate-400 leading-relaxed my-4"
                            >
                                {paragraph}
                            </p>
                        );
                    })}
                </div>
            </div>
        </article>
    );
}
