import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionCookie, verifySession } from "@/lib/auth/session";

export type AdminAuth = { ok: true; actor: "admin" | "internal" } | { ok: false };

/** Constant-time string equality: hash both sides first so lengths do not leak. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Unified admin authorization for API routes.
 * Order: valid signed session cookie -> x-api-key (ADMIN_PASSWORD) -> x-internal-secret.
 */
export async function requireAdmin(request: Request): Promise<AdminAuth> {
  if (await verifySession(getSessionCookie(request))) {
    return { ok: true, actor: "admin" };
  }

  const apiKey = request.headers.get("x-api-key");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (apiKey && adminPassword && safeEqual(apiKey, adminPassword)) {
    return { ok: true, actor: "admin" };
  }

  const internal = request.headers.get("x-internal-secret");
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
  if (internal && internalSecret && safeEqual(internal, internalSecret)) {
    return { ok: true, actor: "internal" };
  }

  return { ok: false };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}
