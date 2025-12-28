import { NextResponse } from "next/server";
import { removeObject } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes("admin_session=")) return true;
  // Allow server-internal deletion with secret
  const secret = request.headers.get("x-internal-secret");
  if (secret && secret === process.env.INTERNAL_SERVICE_SECRET) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { objectKey } = await request.json();
    if (!objectKey) {
      return NextResponse.json({ error: "Missing objectKey" }, { status: 400 });
    }

    try {
      await removeObject(objectKey);
    } catch (e) {
      console.error("remove object error:", e);
      // continue to attempt DB cleanup
    }

    await query(`DELETE FROM media_assets WHERE storage_path = $1`, [objectKey]);

    try {
      const actor = (request.headers.get("cookie") || "").includes("admin_session=") ? "admin" : null;
      await logAudit({ action: "media.delete", actor, entity_type: "object", entity_id: objectKey, details: {} });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
