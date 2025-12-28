import { NextResponse } from "next/server";
import client, { getPublicUrl } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024); // 5MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function isAuthorized(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (secret && process.env.INTERNAL_SERVICE_SECRET && secret === process.env.INTERNAL_SERVICE_SECRET) return { ok: true, actor: "internal" };
  const apiKey = request.headers.get("x-api-key");
  if (apiKey && process.env.ADMIN_PASSWORD && apiKey === process.env.ADMIN_PASSWORD) return { ok: true, actor: "admin" };
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes("admin_session=")) return { ok: true, actor: "admin" };
  return { ok: false };
}

export async function POST(request: Request) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Safely read and parse JSON body to avoid uncaught parse errors
    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (e: any) {
          return NextResponse.json({ error: "Invalid JSON", message: String(e.message) }, { status: 400 });
        }
      }
    } catch (e: any) {
      return NextResponse.json({ error: "Could not read request body", message: String(e.message) }, { status: 400 });
    }

    const { filename, contentType, dataBase64, altText, caption, associatedType, associatedId } = body || {};

    if (!filename || !contentType || !dataBase64 || !altText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
    }

    const buffer = Buffer.from(dataBase64, "base64");
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const objectKey = `${associatedType || "uploads"}/${id}-${safeName}`;

    // upload to MinIO
    await new Promise<void>((resolve, reject) => {
      client.putObject(
        process.env.MINIO_S3_BUCKET_NAME || "public-media",
        objectKey,
        buffer,
        buffer.length,
        (err: any, etag: any) => {
          if (err) return reject(err);
          resolve();
        }
      );
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
      await logAudit({ action: "media.upload", actor: auth.actor || null, entity_type: "media_assets", entity_id: String(record.id), details: { storagePath: objectKey, size: buffer.length } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ media: record });
  } catch (err: any) {
    console.error("upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
