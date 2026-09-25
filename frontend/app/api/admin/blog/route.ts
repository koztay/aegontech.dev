import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const data = await request.json();

    const row = unwrap(
      await getDb()
        .from("blog_posts")
        .insert({
          title: data.title ?? null,
          slug: data.slug ?? null,
          excerpt: data.excerpt ?? null,
          content: data.content ?? null,
          featured_image: data.featured_image ?? null,
          status: data.status ?? null,
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single()
    );

    return NextResponse.json(reviveRow(row));
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
