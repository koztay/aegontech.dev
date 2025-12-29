import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isAuthorized } from "@/lib/auth/api-auth";

export async function POST(request: Request) {
    try {
        const auth = isAuthorized(request);
        if (!auth.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, excerpt, content, featuredImage } = body;

        // Validate required fields
        if (!title || !slug || !excerpt || !content) {
            return NextResponse.json(
                { error: "Missing required fields: title, slug, excerpt, content" },
                { status: 400 }
            );
        }

        // Insert blog post into database
        const result = await query(
            `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, status, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', NOW())
       RETURNING id, title, slug, excerpt, content, featured_image, published_at, status`,
            [title, slug, excerpt, content, featuredImage || "https://picsum.photos/800/400"]
        );

        const createdPost = result[0];

        return NextResponse.json({
            success: true,
            post: {
                id: createdPost.id,
                title: createdPost.title,
                slug: createdPost.slug,
                excerpt: createdPost.excerpt,
                content: createdPost.content,
                featuredImage: createdPost.featured_image,
                publishedAt: createdPost.published_at,
                status: createdPost.status,
            },
        });
    } catch (error) {
        console.error("Error publishing blog post:", error);
        return NextResponse.json(
            { error: "Failed to publish blog post" },
            { status: 500 }
        );
    }
}
