import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isAuthorized } from "@/lib/auth/api-auth";
import { getPublicUrl } from "@/lib/storage/minio";

export async function GET(request: Request) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const q = url.searchParams.get("q") || null;
    const limit = Number(url.searchParams.get("limit") || 50);

    let rows;
    if (q) {
      rows = await query(`SELECT id, url, alt_text, storage_path, mime_type, created_at FROM media_assets WHERE alt_text ILIKE $1 OR storage_path ILIKE $1 ORDER BY created_at DESC LIMIT $2`, [`%${q}%`, limit]);
    } else {
      rows = await query(`SELECT id, url, alt_text, storage_path, mime_type, created_at FROM media_assets ORDER BY created_at DESC LIMIT $1`, [limit]);
    }

    // We can just return the rows directly since we configured public access
    const normalized = rows.map((r: any) => ({
      ...r,
      url: r.url && !r.url.startsWith("http") ? getPublicUrl(r.url) : r.url,
    }));
    return NextResponse.json({ media: normalized });
  } catch (err: any) {
    console.error("media list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
