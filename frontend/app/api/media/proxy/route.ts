import { NextResponse } from "next/server";
import client, { getPublicUrl } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function isAuthorized(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes("admin_session=")) return { ok: true, actor: "admin" };
  return { ok: false };
}

export async function POST(request: Request) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    await new Promise<void>((resolve, reject) => {
      client.putObject(process.env.MINIO_S3_BUCKET_NAME || "public-media", objectKey, buffer, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const url = getPublicUrl(objectKey);

    const rows = await query(
      `INSERT INTO media_assets (storage_path, url, alt_text, caption, source, mime_type, size_bytes, checksum, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [objectKey, url, altText, caption || null, "upload", contentType, buffer.length, null, null]
    );

    const record = rows[0];

    if (associatedType && associatedId) {
      const field = associatedType === "portfolio" ? "portfolio_item_id" : "blog_post_id";
      await query(`UPDATE media_assets SET ${field} = $1 WHERE id = $2`, [associatedId, record.id]);
    }

    try {
      await logAudit({ action: "media.upload.proxy", actor: auth.actor || null, entity_type: "media_assets", entity_id: String(record.id), details: { storagePath: objectKey, size: buffer.length } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ media: record });
  } catch (err: any) {
    console.error("proxy upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
