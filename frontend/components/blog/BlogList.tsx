"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import { BlogCard } from "./BlogCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedBlogResponse {
    data: BlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function BlogList({ posts: initialPosts }: { posts?: BlogPost[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pageParam = searchParams.get('page');
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [paginatedData, setPaginatedData] = useState<PaginatedBlogResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const limit = 6;

    useEffect(() => {
        async function fetchPaginatedData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/data/blog?page=${currentPage}&limit=${limit}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch blog posts');
                }
                
                const data = await response.json();
                setPaginatedData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching paginated blog posts:', err);
                setError('Failed to load blog posts');
            } finally {
                setLoading(false);
            }
        }

        fetchPaginatedData();
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/blog?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (paginatedData && currentPage < paginatedData.totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    if (loading) {
        return (
            <section className="py-16 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Blog
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Blog
                        </h1>
                    </div>
                    <div className="text-center py-12">
                        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    const posts = paginatedData?.data || initialPosts || [];
    const totalPages = paginatedData?.totalPages || 1;

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return (
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full mb-4">
                        Insights
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Blog
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Thoughts, tutorials, and insights on software development, design,
                        and technology.
                    </p>
                </div>

                {/* Grid */}
                {sortedPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedPosts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="min-w-[120px]"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="min-w-[120px]"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            No blog posts found.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
