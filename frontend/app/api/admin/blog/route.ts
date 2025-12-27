import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pool = getDbPool();

    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.featured_image,
        data.status,
        data.status === "published" ? new Date() : null,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
