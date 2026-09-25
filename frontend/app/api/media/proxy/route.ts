import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getPublicUrl, putObject } from "@/lib/storage/supabase-storage";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {

    const form = await request.formData();
    const file = form.get("file") as File | null;
    const altText = String(form.get("altText") || "");
    const caption = form.get("caption") ? String(form.get("caption")) : null;
    const associatedType = form.get("associatedType") ? String(form.get("associatedType")) : undefined;
    const associatedId = form.get("associatedId") ? String(form.get("associatedId")) : undefined;

    if (!file || !altText) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED.includes(contentType)) return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > MAX_SIZE) return NextResponse.json({ error: "File too large" }, { status: 413 });

    const filename = (file as any).name || `upload-${Date.now()}`;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const objectKey = `${associatedType || "uploads"}/${id}-${safeName}`;

    await putObject(objectKey, buffer, contentType);

    const url = getPublicUrl(objectKey);

    // created_at is filled by the column default now(), like the old NOW().
    const record = reviveRow(
      unwrap(
        await getDb()
          .from("media_assets")
          .insert({
            storage_path: objectKey,
            url,
            alt_text: altText,
            caption: caption || null,
            source: "upload",
            mime_type: contentType,
            size_bytes: buffer.length,
            checksum: null,
            created_by: null,
          })
          .select()
          .single()
      )
    );

    if (associatedType && associatedId) {
      const field = associatedType === "portfolio" ? "portfolio_item_id" : "blog_post_id";
      unwrap(await getDb().from("media_assets").update({ [field]: associatedId }).eq("id", record.id));
    }

    try {
      await logAudit({ action: "media.upload.proxy", actor: auth.actor, entity_type: "media_assets", entity_id: String(record.id), details: { storagePath: objectKey, size: buffer.length } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ media: record });
  } catch (err: any) {
    console.error("proxy upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
