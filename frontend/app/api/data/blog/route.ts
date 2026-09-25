import { NextResponse } from "next/server";
import { getDb, unwrap, reviveRows } from "@/lib/db/supabase";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '6', 10);
        
        // Validate pagination parameters
        const validPage = Math.max(1, page);
        const validLimit = Math.max(1, Math.min(100, limit));
        const skip = (validPage - 1) * validLimit;

        // Get total count of published posts
        const db = getDb();
        const countRes = await db
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("status", "published");
        if (countRes.error) throw new Error(countRes.error.message);
        const total = countRes.count ?? 0;
        
        // Get paginated posts
        const rows = reviveRows<any>(
            unwrap(
                await db
                    .from("blog_posts")
                    .select("*")
                    .eq("status", "published")
                    .order("published_at", { ascending: false })
                    .range(skip, skip + validLimit - 1)
            )
        );

        const posts = rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            featuredImage: row.featured_image,
            publishedAt: row.published_at,
            status: row.status,
        }));

        const totalPages = Math.ceil(total / validLimit);

        return NextResponse.json({
            data: posts,
            total,
            page: validPage,
            limit: validLimit,
            totalPages,
        });
    } catch (error) {
        console.error("Error in blog API:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        );
    }
}
