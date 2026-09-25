import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/api-auth";
import { getDb, unwrap, reviveRow } from "@/lib/db/supabase";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return unauthorizedResponse();

  try {
    const data = await request.json();

    const row = unwrap(
      await getDb()
        .from("portfolio_items")
        .insert({
          title: data.title ?? null,
          description: data.description ?? null,
          type: data.type ?? null,
          screenshot: data.screenshot ?? null,
          website_url: data.website_url ?? null,
          app_store_url: data.app_store_url ?? null,
          play_store_url: data.play_store_url ?? null,
        })
        .select()
        .single()
    );

    return NextResponse.json(reviveRow(row));
  } catch (error) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}
