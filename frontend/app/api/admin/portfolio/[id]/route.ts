import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db/client";
import { removeObject, getPublicUrl } from "@/lib/storage/minio";
import { logAudit } from "@/lib/observability/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    const result = await pool.query(
      "SELECT * FROM portfolio_items WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item = result.rows[0];
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
  try {
    const { id } = await params;
    const data = await request.json();
    const pool = getDbPool();

    const result = await pool.query(
      `UPDATE portfolio_items 
       SET title = $1, description = $2, type = $3, screenshot = $4, 
           website_url = $5, app_store_url = $6, play_store_url = $7
       WHERE id = $8
       RETURNING *`,
      [
        data.title,
        data.description,
        data.type,
        data.screenshot,
        data.website_url,
        data.app_store_url,
        data.play_store_url,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
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
      "SELECT storage_path FROM media_assets WHERE portfolio_item_id = $1",
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
    await pool.query("DELETE FROM media_assets WHERE portfolio_item_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM portfolio_items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    try {
      const actor = (request.headers.get("cookie") || "").includes("admin_session=") ? "admin" : null;
      await logAudit({ action: "portfolio.delete", actor, entity_type: "portfolio_item", entity_id: id, details: { deleted_media_count: mediaRes.rows.length } });
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
