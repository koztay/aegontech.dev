import { NextResponse } from "next/server";
import { getFeaturedPortfolioItems } from "@/lib/data/landing";

export async function GET() {
    try {
        const portfolio = await getFeaturedPortfolioItems();
        return NextResponse.json(portfolio);
    } catch (error) {
        console.error("Error in portfolio API:", error);
        return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
    }
}
