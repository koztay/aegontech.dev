import { NextResponse } from "next/server";

const cachePage = "public, s-maxage=300, stale-while-revalidate=60";
const cacheApi = "no-store";
const cacheStatic = "public, max-age=31536000, immutable";

const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : undefined;
const imgSrc = ["'self'", "data:", "blob:", "https:"].concat(supabaseHost ? [`https://${supabaseHost}`] : []);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`,
  `style-src 'self' 'unsafe-inline' https:`,
  `img-src ${imgSrc.join(" ")}`,
  "font-src 'self' https:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'none'"
].join("; ");

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
}

export function middleware(request: Request) {
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith("/api/");
  const isStatic = url.pathname.startsWith("/_next/") || url.pathname.startsWith("/favicon.ico");

  const response = NextResponse.next();
  applySecurityHeaders(response);

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
  matcher: ["/(.*)"]
};
