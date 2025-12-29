import { NextResponse } from "next/server";

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

export function middleware(request: Request) {
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith("/api/");
  const isStatic =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/favicon.ico");
  const isAdminLogin = url.pathname.startsWith("/admin-login");
  const isAdmin = url.pathname.startsWith("/admin");

  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Protect admin routes (except login page)
  if (isAdmin && !isAdminLogin) {
    const cookies = request.headers.get("cookie");
    const hasSession = cookies?.includes("admin_session=");

    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
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
