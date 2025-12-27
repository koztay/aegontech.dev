import { NextResponse } from "next/server";
import { getBlogIndex } from "@/lib/data/blog";

export async function GET() {
    try {
        const posts = await getBlogIndex();
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error in blog API:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        );
    }
}
