import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getDb, reviveRows, fetchAll, escapeLike, orValue } from "@/lib/db/supabase";
import { getPublicUrl } from "@/lib/storage/supabase-storage";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {

    const url = new URL(request.url);
    const q = url.searchParams.get("q") || null;
    const limit = Number(url.searchParams.get("limit") || 50);

    // A bad LIMIT was a database error (-> 500) before; keep that.
    if (!Number.isInteger(limit) || limit < 0) throw new Error("Invalid limit");

    // Literal (escaped) substring match, case-insensitive, on alt_text or storage_path.
    const pattern = q ? orValue(`%${escapeLike(q)}%`) : null;

    // fetchAll pages with .range() so limits above PostgREST's 1000-row cap still work.
    const rows = reviveRows<any>(
      await fetchAll(
        (from, to) => {
          let qb = getDb()
            .from("media_assets")
            .select("id, url, alt_text, storage_path, mime_type, created_at");
          if (pattern) qb = qb.or(`alt_text.ilike.${pattern},storage_path.ilike.${pattern}`);
          return qb.order("created_at", { ascending: false }).order("id").range(from, to);
        },
        { max: limit }
      )
    );

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
