import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isAuthorized } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = isAuthorized(request);
        if (!auth.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get("limit") || "15"), 50);

        const result = await query<{ title: string; slug: string }>(
            `SELECT title, slug FROM blog_posts
             WHERE status = 'published'
             ORDER BY published_at DESC
             LIMIT $1`,
            [limit]
        );

        return NextResponse.json({ titles: result });
    } catch (error) {
        console.error("Error fetching blog titles:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog titles" },
            { status: 500 }
        );
    }
}
