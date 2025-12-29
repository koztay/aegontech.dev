
/**
 * Unified API Authorization Helper
 */
export function isAuthorized(request: Request) {
    const secret = request.headers.get("x-internal-secret");
    if (secret && process.env.INTERNAL_SERVICE_SECRET && secret === process.env.INTERNAL_SERVICE_SECRET) {
        return { ok: true, actor: "internal" };
    }

    const apiKey = request.headers.get("x-api-key");
    if (apiKey && process.env.ADMIN_PASSWORD && apiKey === process.env.ADMIN_PASSWORD) {
        return { ok: true, actor: "admin" };
    }

    const cookie = request.headers.get("cookie") || "";
    if (cookie.includes("admin_session=")) {
        return { ok: true, actor: "admin" };
    }

    return { ok: false };
}
