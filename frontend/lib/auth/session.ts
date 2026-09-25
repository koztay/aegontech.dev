/**
 * Stateless signed admin session (HMAC-SHA256, Web Crypto only, so it works in the
 * proxy and in route handlers alike).
 *
 * Token = base64url(JSON {v, iat, exp}) + "." + base64url(HMAC-SHA256(secret, payloadPart))
 * Secret: env SESSION_SECRET, at least 32 characters. Missing/short secret fails closed.
 */

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const SESSION_VERSION = 1;
const MIN_SECRET_LENGTH = 32;
const MAX_TOKEN_LENGTH = 1024;

const encoder = new TextEncoder();

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(input)) return null;
  try {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function importKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

/** Create a signed session token valid for 24 hours. Throws if SESSION_SECRET is unusable. */
export async function signSession(): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      `SESSION_SECRET environment variable is missing or shorter than ${MIN_SECRET_LENGTH} characters`
    );
  }
  const iat = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ v: SESSION_VERSION, iat, exp: iat + SESSION_MAX_AGE_SECONDS }))
  );
  const key = await importKey(secret, "sign");
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return `${payload}.${toBase64Url(sig)}`;
}

/** True only for an untampered, unexpired token of a known version. Never throws. */
export async function verifySession(token: string | undefined | null): Promise<boolean> {
  try {
    if (!token || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return false;
    const secret = getSecret();
    if (!secret) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadPart, sigPart] = parts;
    const sig = fromBase64Url(sigPart);
    const payloadBytes = fromBase64Url(payloadPart);
    if (!sig || !payloadBytes || sig.length === 0) return false;

    // crypto.subtle.verify compares the MAC in constant time.
    const key = await importKey(secret, "verify");
    const valid = await crypto.subtle.verify("HMAC", key, sig as BufferSource, encoder.encode(payloadPart));
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (!payload || payload.v !== SESSION_VERSION) return false;
    if (typeof payload.iat !== "number" || typeof payload.exp !== "number") return false;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now || payload.iat > now + 60) return false;
    return true;
  } catch {
    return false;
  }
}

/** Value of the admin_session cookie from the Cookie header (exact name match), if any. */
export function getSessionCookie(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== SESSION_COOKIE) continue;
    let value = part.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    return value || undefined;
  }
  return undefined;
}
