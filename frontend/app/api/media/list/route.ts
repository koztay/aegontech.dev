import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { presignGet } from "@/lib/storage/minio";

function isAuthorized(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes("admin_session=")) return { ok: true, actor: "admin" };
  const apiKey = request.headers.get("x-api-key");
  if (apiKey && process.env.ADMIN_PASSWORD && apiKey === process.env.ADMIN_PASSWORD) return { ok: true, actor: "admin" };
  return { ok: false };
}

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

    // Attach short-lived presigned GET URLs so UI can display images from private buckets
    const itemsWithUrls = await Promise.all((rows || []).map(async (r: any) => {
      try {
        const presigned = await presignGet(r.storage_path, 300);
        return { ...r, presigned_url: presigned };
      } catch (e) {
        return { ...r, presigned_url: r.url };
      }
    }));

    return NextResponse.json({ items: itemsWithUrls });
  } catch (err: any) {
    console.error("media list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
