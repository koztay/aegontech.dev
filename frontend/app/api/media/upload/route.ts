import { NextResponse } from "next/server";
import { getPublicUrl, ensureBucketExists, putObject } from "@/lib/storage/supabase-storage";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";
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

    // upload to Supabase Storage
    await ensureBucketExists();

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
