import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { statObject, getPublicUrl } from "@/lib/storage/supabase-storage";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
import { logAudit } from "@/lib/observability/audit";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {

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
    // created_at is filled by the column default now(), like the old NOW().
    const record = reviveRow(
      unwrap(
        await getDb()
          .from("media_assets")
          .insert({
            storage_path: storagePath,
            url,
            alt_text: altText,
            caption: caption || null,
            source: "upload",
            mime_type: mime,
            size_bytes: size,
            checksum: checksum,
            created_by: null,
          })
          .select()
          .single()
      )
    );

    try {
      await logAudit({ action: "media.finalize", actor: auth.actor, entity_type: "media_assets", entity_id: String(record.id), details: { storagePath, mime, size } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    // Optionally associate with portfolio/blog
    if (associatedType && associatedId) {
      const field = associatedType === "portfolio" ? "portfolio_item_id" : "blog_post_id";
      unwrap(await getDb().from("media_assets").update({ [field]: associatedId }).eq("id", record.id));
    }

    return NextResponse.json({ media: record });
  } catch (err) {
    console.error("finalize error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
