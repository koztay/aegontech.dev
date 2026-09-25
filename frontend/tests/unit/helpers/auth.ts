/** Test-only auth values. Never real secrets. */
export const TEST_SESSION_SECRET = "0123456789abcdef".repeat(4); // 64 chars, test only
export const TEST_ADMIN_PASSWORD = "test-admin-password";
export const TEST_INTERNAL_SECRET = "test-internal-secret";

export function setAuthEnv() {
  process.env.SESSION_SECRET = TEST_SESSION_SECRET;
  process.env.ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;
  process.env.INTERNAL_SERVICE_SECRET = TEST_INTERNAL_SECRET;
}

/** Cookie header carrying a validly signed session. */
export async function validCookie(): Promise<string> {
  setAuthEnv();
  const { signSession } = await import("@/lib/auth/session");
  return `admin_session=${await signSession()}`;
}

export const FAKE_COOKIE = "admin_session=x";
