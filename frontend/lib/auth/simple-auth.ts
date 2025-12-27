/**
 * Simple password-based authentication for admin panel
 * Uses environment variable for admin password
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable not set");
  }
  return password === ADMIN_PASSWORD;
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
