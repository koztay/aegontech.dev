import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeEqual } from "@/lib/auth/api-auth";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

function loginFailed() {
  return NextResponse.json({ error: "Login failed" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("Login error: ADMIN_PASSWORD environment variable is not set");
      return loginFailed();
    }

    if (!safeEqual(password, adminPassword)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    let sessionToken: string;
    try {
      sessionToken = await signSession();
    } catch {
      // Never log the value, only which variable is unusable.
      console.error("Login error: SESSION_SECRET environment variable is missing or shorter than 32 characters");
      return loginFailed();
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_SECONDS, // 24 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return loginFailed();
  }
}
