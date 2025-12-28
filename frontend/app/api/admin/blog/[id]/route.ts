import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db/client";
import { removeObject } from "@/lib/storage/minio";
import { logAudit } from "@/lib/observability/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    const result = await pool.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const pool = getDbPool();

    const result = await pool.query(
      `UPDATE blog_posts 
       SET title = $1, slug = $2, excerpt = $3, content = $4, 
           featured_image = $5, status = $6, published_at = $7
       WHERE id = $8
       RETURNING *`,
      [
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.featured_image,
        data.status,
        data.status === "published" ? new Date() : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    // find associated media assets
    const mediaRes = await pool.query(
      "SELECT storage_path FROM media_assets WHERE blog_post_id = $1",
      [id]
    );

    // attempt to remove objects from MinIO
    for (const row of mediaRes.rows) {
      try {
        await removeObject(row.storage_path);
      } catch (e) {
        console.error("Failed to remove media object:", row.storage_path, e);
      }
    }

    // remove media rows
    await pool.query("DELETE FROM media_assets WHERE blog_post_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    try {
      const actor = (request.headers.get("cookie") || "").includes("admin_session=") ? "admin" : null;
      await logAudit({ action: "blog.delete", actor, entity_type: "blog_post", entity_id: id, details: { deleted_media_count: mediaRes.rows.length } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
