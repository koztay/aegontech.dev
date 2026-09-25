import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { presignPut } from "@/lib/storage/supabase-storage";
import { logAudit } from "@/lib/observability/audit";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024); // 5MB default
/** Fixed lifetime of a Supabase Storage signed upload URL (2 hours). */
const SIGNED_UPLOAD_URL_TTL_SECONDS = 7200;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {

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

    const uploadUrl = await presignPut(objectKey);

    try {
      await logAudit({ action: "media.presign", actor: auth.actor, entity_type: "object", entity_id: objectKey, details: { contentType, sizeBytes, purpose } });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    // Supabase signed upload URLs have a fixed 2 hour lifetime that cannot be configured
    // (MinIO honoured the 300 s we used to request), so report the real value.
    return NextResponse.json({ uploadUrl, objectKey, expiresIn: SIGNED_UPLOAD_URL_TTL_SECONDS });
  } catch (err) {
    console.error("presign error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
