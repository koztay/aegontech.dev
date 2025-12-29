import { NextResponse } from "next/server";
import client, { getPublicUrl, ensureBucketExists } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024); // 5MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

import { isAuthorized } from "@/lib/auth/api-auth";

export async function POST(request: Request) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let filename, contentType, buffer, altText, caption, associatedType, associatedId;

    // Try parsing as FormData first (Multipart)
    let isMultipart = false;
    try {
      // Cloning the request is necessary because reading the body consumes the stream.
      // However, cloning large file requests is memory intensive.
      // But given we don't know the type for sure, we rely on the header first.

      // Let's stick to header check but make it lower case and more robust
      const cType = (request.headers.get("content-type") || "").toLowerCase();

      if (cType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (file && typeof file.arrayBuffer === "function") {
          filename = file.name;
          contentType = file.type;
          buffer = Buffer.from(await file.arrayBuffer());
          altText = formData.get("altText") as string;
          caption = formData.get("caption") as string;
          associatedType = formData.get("associatedType") as string;
          associatedId = formData.get("associatedId") as string;
          isMultipart = true;
        }
      }
    } catch (e) {
      console.warn("Multipard parsing failed, trying JSON fallback", e);
    }

    if (!isMultipart) {
      // JSON Fallback
      let body: any = {};
      try {
        const text = await request.text();
        if (text) body = JSON.parse(text);
      } catch (e: any) {
        // Provide more context in error for debugging
        const cType = request.headers.get("content-type");
        return NextResponse.json({
          error: "Invalid JSON",
          message: String(e.message),
          debug: { receivedContentType: cType }
        }, { status: 400 });
      }

      const { dataBase64 } = body;
      filename = body.filename;
      contentType = body.contentType;
      altText = body.altText;
      caption = body.caption;
      associatedType = body.associatedType;
      associatedId = body.associatedId;

      if (dataBase64) buffer = Buffer.from(dataBase64, "base64");
    }

    if (!filename || !contentType || !buffer || !altText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
    }

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const objectKey = `${associatedType || "uploads"}/${id}-${safeName}`;

    // upload to MinIO
    await ensureBucketExists();

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
