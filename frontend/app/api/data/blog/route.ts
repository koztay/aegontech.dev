import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

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
        const countResult = await query<any>(
            "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'"
        );
        const total = parseInt(countResult[0].total, 10);
        
        // Get paginated posts
        const rows = await query<any>(
            "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT $1 OFFSET $2",
            [validLimit, skip]
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
