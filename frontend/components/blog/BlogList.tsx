"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import { BlogCard } from "./BlogCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedBlogResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function BlogHeader() {
  return (
    <header className="border-b border-border pb-12">
      <div className="eyebrow">
        <span className="signal-tick rotate-45" aria-hidden />
        Field Notes
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display font-semibold text-foreground">Blog</h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Notes on building software — engineering, design, and the decisions
          behind the products we ship.
        </p>
      </div>
    </header>
  );
}

export function BlogList({ posts: initialPosts }: { posts?: BlogPost[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");
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
          throw new Error("Failed to fetch blog posts");
        }

        const data = await response.json();
        setPaginatedData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching paginated blog posts:", err);
        setError("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPaginatedData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/blog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (paginatedData && currentPage < paginatedData.totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
          <BlogHeader />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-md border border-border bg-surface-2/50"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
          <BlogHeader />
          <div className="py-16 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const posts = paginatedData?.data || initialPosts || [];
  const totalPages = paginatedData?.totalPages || 1;

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const pageBtn =
    "inline-flex min-w-[120px] items-center justify-center gap-2 rounded-sm border border-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal hover:text-signal disabled:pointer-events-none disabled:opacity-40";

  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-8xl px-6 sm:px-8 lg:px-16">
        <BlogHeader />

        {sortedPosts.length > 0 ? (
          <>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
                <button onClick={handlePreviousPage} disabled={currentPage === 1} className={pageBtn}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="text-signal">{String(currentPage).padStart(2, "0")}</span> /{" "}
                  {String(totalPages).padStart(2, "0")}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={pageBtn}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No posts yet — check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
