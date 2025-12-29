import { NextResponse } from "next/server";
import { removeObject } from "@/lib/storage/minio";
import { query } from "@/lib/db/client";
import { logAudit } from "@/lib/observability/audit";

import { isAuthorized } from "@/lib/auth/api-auth";

export async function POST(request: Request) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
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
      await logAudit({ action: "media.delete", actor: auth.actor || null, entity_type: "object", entity_id: objectKey, details: {} });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
