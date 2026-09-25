import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
import { removeObject, getPublicUrl } from "@/lib/storage/supabase-storage";
import { logAudit } from "@/lib/observability/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const { id } = await params;
    const item = reviveRow(
      unwrap(await getDb().from("portfolio_items").select("*").eq("id", id).maybeSingle())
    );

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const screenshotUrl = item.screenshot && !item.screenshot.startsWith("http")
      ? getPublicUrl(item.screenshot)
      : item.screenshot;

    return NextResponse.json({
      ...item,
      screenshot_url: screenshotUrl,
    });
  } catch (error) {
    console.error("Error fetching portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio item" },
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
        .from("portfolio_items")
        .update({
          title: data.title ?? null,
          description: data.description ?? null,
          type: data.type ?? null,
          screenshot: data.screenshot ?? null,
          website_url: data.website_url ?? null,
          app_store_url: data.app_store_url ?? null,
          play_store_url: data.play_store_url ?? null,
        })
        .eq("id", id)
        .select()
        .maybeSingle()
    );

    if (!row) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reviveRow(row));
  } catch (error) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const { id } = await params;
    const data = await request.json();

    if (typeof data.published !== "boolean") {
      return NextResponse.json(
        { error: "Expected a boolean `published` field" },
        { status: 400 }
      );
    }

    const row = unwrap(
      await getDb()
        .from("portfolio_items")
        .update({ published: data.published })
        .eq("id", id)
        .select("id, published")
        .maybeSingle()
    );

    if (!row) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    try {
      await logAudit({
        action: data.published ? "portfolio.publish" : "portfolio.unpublish",
        actor: auth.actor,
        entity_type: "portfolio_item",
        entity_id: id,
      });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating publish state:", error);
    return NextResponse.json(
      { error: "Failed to update publish state" },
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
      unwrap(await db.from("media_assets").select("storage_path").eq("portfolio_item_id", id)) ?? [];

    // attempt to remove objects from storage
    for (const row of mediaRows) {
      try {
        await removeObject(row.storage_path);
      } catch (e) {
        console.error("Failed to remove media object:", row.storage_path, e);
      }
    }

    // remove media rows
    unwrap(await db.from("media_assets").delete().eq("portfolio_item_id", id));

    const deleted = unwrap(
      await db.from("portfolio_items").delete().eq("id", id).select().maybeSingle()
    );

    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    try {
      await logAudit({ action: "portfolio.delete", actor: auth.actor, entity_type: "portfolio_item", entity_id: id, details: { deleted_media_count: mediaRows.length } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
