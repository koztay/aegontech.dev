import { NextResponse } from "next/server";
import { getAllPortfolioItems } from "@/lib/data/portfolio";

export async function GET() {
    try {
        const portfolio = await getAllPortfolioItems();
        return NextResponse.json(portfolio);
    } catch (error) {
        console.error("Error in portfolio API:", error);
        return NextResponse.json(
            { error: "Failed to fetch portfolio items" },
            { status: 500 }
        );
    }
}
