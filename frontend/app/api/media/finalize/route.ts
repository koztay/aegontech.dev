import { NextResponse } from "next/server";
import { statObject, getPublicUrl } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_session=");
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { objectKey, altText, caption, associatedType, associatedId } = body || {};

    if (!objectKey || !altText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify object exists and get size/etag
    let stat;
    try {
      stat = await statObject(objectKey);
    } catch (e) {
      return NextResponse.json({ error: "Object not found in storage" }, { status: 404 });
    }

    const mime = stat.metaData?.["content-type"] || (stat as any).mimeType || null;
    const size = stat.size || null;
    const checksum = stat.etag || null;
    const storagePath = objectKey;
    const url = getPublicUrl(objectKey);

    // Insert into media_assets
    const rows = await query(
      `INSERT INTO media_assets (storage_path, url, alt_text, caption, source, mime_type, size_bytes, checksum, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [storagePath, url, altText, caption || null, "upload", mime, size, checksum, null]
    );

    const record = rows[0];

    try {
      const actor = (request.headers.get("cookie") || "").includes("admin_session=") ? "admin" : null;
      await logAudit({ action: "media.finalize", actor, entity_type: "media_assets", entity_id: String(record.id), details: { storagePath, mime, size } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    // Optionally associate with portfolio/blog
    if (associatedType && associatedId) {
      const field = associatedType === "portfolio" ? "portfolio_item_id" : "blog_post_id";
      await query(`UPDATE media_assets SET ${field} = $1 WHERE id = $2`, [associatedId, record.id]);
    }

    return NextResponse.json({ media: record });
  } catch (err) {
    console.error("finalize error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
