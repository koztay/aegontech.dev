import { NextResponse } from "next/server";
import { getServices } from "@/lib/data/landing";

export async function GET() {
    try {
        const services = await getServices();
        return NextResponse.json(services);
    } catch (error) {
        console.error("Error in services API:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}
