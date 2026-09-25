import { NextRequest, NextResponse } from "next/server";
import { getDb, unwrap } from "@/lib/db/supabase";
import { isAuthorized } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = isAuthorized(request);
        if (!auth.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get("limit") || "15"), 50);

        const result = unwrap(
            await getDb()
                .from("blog_posts")
                .select("title, slug")
                .eq("status", "published")
                .order("published_at", { ascending: false })
                .limit(limit)
        ) as { title: string; slug: string }[];

        return NextResponse.json({ titles: result ?? [] });
    } catch (error) {
        console.error("Error fetching blog titles:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog titles" },
            { status: 500 }
        );
    }
}
