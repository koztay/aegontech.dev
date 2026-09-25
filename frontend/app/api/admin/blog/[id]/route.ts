import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
import { removeObject } from "@/lib/storage/supabase-storage";
import { logAudit } from "@/lib/observability/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const { id } = await params;
    const row = unwrap(
      await getDb().from("blog_posts").select("*").eq("id", id).maybeSingle()
    );

    if (!row) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reviveRow(row));
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
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const { id } = await params;
    const data = await request.json();

    const row = unwrap(
      await getDb()
        .from("blog_posts")
        .update({
          title: data.title ?? null,
          slug: data.slug ?? null,
          excerpt: data.excerpt ?? null,
          content: data.content ?? null,
          featured_image: data.featured_image ?? null,
          status: data.status ?? null,
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .maybeSingle()
    );

    if (!row) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reviveRow(row));
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
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = getDb();
    // find associated media assets
    const mediaRows: { storage_path: string }[] =
      unwrap(await db.from("media_assets").select("storage_path").eq("blog_post_id", id)) ?? [];

    // attempt to remove objects from storage
    for (const row of mediaRows) {
      try {
        await removeObject(row.storage_path);
      } catch (e) {
        console.error("Failed to remove media object:", row.storage_path, e);
      }
    }

    // remove media rows
    unwrap(await db.from("media_assets").delete().eq("blog_post_id", id));

    const deleted = unwrap(
      await db.from("blog_posts").delete().eq("id", id).select().maybeSingle()
    );

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    try {
      await logAudit({ action: "blog.delete", actor: auth.actor, entity_type: "blog_post", entity_id: id, details: { deleted_media_count: mediaRows.length } });
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
