import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { removeObject } from "@/lib/storage/supabase-storage";
import { getDb, unwrap } from "@/lib/db/supabase";
import { logAudit } from "@/lib/observability/audit";


export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {

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

    unwrap(await getDb().from("media_assets").delete().eq("storage_path", objectKey));

    try {
      await logAudit({ action: "media.delete", actor: auth.actor, entity_type: "object", entity_id: objectKey, details: {} });
    } catch (e) {
      console.warn("audit warn:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
