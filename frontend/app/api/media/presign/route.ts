import { NextResponse } from "next/server";
import { presignPut } from "@/lib/storage/minio";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024); // 5MB default
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

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
    const { filename, contentType, sizeBytes, purpose } = body || {};

    if (!filename || !contentType || !sizeBytes) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
    }

    if (sizeBytes > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const objectKey = `${purpose || "uploads"}/${id}-${safeName}`;

    const uploadUrl = await presignPut(objectKey, 300);

    try {
      const actor = (request.headers.get("cookie") || "").includes("admin_session=") ? "admin" : null;
      await logAudit({ action: "media.presign", actor, entity_type: "object", entity_id: objectKey, details: { contentType, sizeBytes, purpose } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ uploadUrl, objectKey, expiresIn: 300 });
  } catch (err) {
    console.error("presign error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
