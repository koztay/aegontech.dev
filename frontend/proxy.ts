import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-auth";
import { getSessionCookie, verifySession } from "@/lib/auth/session";

const cachePage = "public, s-maxage=300, stale-while-revalidate=60";
const cacheApi = "no-store";
const cacheStatic = "public, max-age=31536000, immutable";

const imgSrc = ["'self'", "data:", "blob:", "https:"];

const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`,
    `style-src 'self' 'unsafe-inline' https:`,
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
].join("; ");

function applySecurityHeaders(response: NextResponse) {
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set("Content-Security-Policy", contentSecurityPolicy);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
}

export async function proxy(request: Request) {
    const url = new URL(request.url);

    // Redirect non-www to www for SEO canonicalization
    const hostname = url.hostname;
    if (hostname === 'aegontech.dev') {
        url.hostname = 'www.aegontech.dev';
        return NextResponse.redirect(url, 301);
    }

    const isApi = url.pathname.startsWith("/api/");
    const isStatic =
        url.pathname.startsWith("/_next/") ||
        url.pathname.startsWith("/favicon.ico");
    const isAdminLogin = url.pathname.startsWith("/admin-login");
    const isAdmin = url.pathname.startsWith("/admin");

    const response = NextResponse.next();
    applySecurityHeaders(response);

    // Protect admin pages (except login page): the signed session cookie must verify.
    if (isAdmin && !isAdminLogin) {
        if (!(await verifySession(getSessionCookie(request)))) {
            return NextResponse.redirect(new URL("/admin-login", request.url));
        }
    }

    // Defence in depth for the admin API (route handlers stay the primary control):
    // session, x-api-key or x-internal-secret required, except login/logout.
    const isAdminApi =
        url.pathname.startsWith("/api/admin/") &&
        url.pathname !== "/api/admin/login" &&
        url.pathname !== "/api/admin/logout";
    if (isAdminApi) {
        const auth = await requireAdmin(request);
        if (!auth.ok) {
            const denied = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            applySecurityHeaders(denied);
            denied.headers.set("Cache-Control", cacheApi);
            return denied;
        }
    }

    if (isStatic) {
        response.headers.set("Cache-Control", cacheStatic);
    } else if (isApi) {
        response.headers.set("Cache-Control", cacheApi);
    } else {
        response.headers.set("Cache-Control", cachePage);
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
