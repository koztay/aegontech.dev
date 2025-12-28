import { NextResponse } from "next/server";
import { submitContactForm } from "@/lib/data/landing";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, from } = body;

        const userAgent = request.headers.get("user-agent") || undefined;
        const ip =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            undefined;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await submitContactForm({ name, email, message, userAgent, ip, from });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json(
            { error: "Failed to submit contact form" },
            { status: 500 }
        );
    }
}
