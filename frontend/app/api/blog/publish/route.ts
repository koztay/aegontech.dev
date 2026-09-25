import { NextResponse } from "next/server";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
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
        const createdPost = reviveRow(
            unwrap(
                await getDb()
                    .from("blog_posts")
                    .insert({
                        title,
                        slug,
                        excerpt,
                        content,
                        featured_image: featuredImage || "https://picsum.photos/800/400",
                        status: "published",
                        published_at: new Date().toISOString(),
                    })
                    .select("id, title, slug, excerpt, content, featured_image, published_at, status")
                    .single()
            )
        );

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
