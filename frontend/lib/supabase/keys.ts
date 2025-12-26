import crypto from "crypto";

const HASH_ALGO = "sha256";

export function hashApiKey(rawKey: string): string {
  return crypto.createHash(HASH_ALGO).update(rawKey).digest("hex");
}

export function verifyApiKey(rawKey: string, hashedKey: string): boolean {
  const hashedInput = hashApiKey(rawKey);
  if (hashedInput.length !== hashedKey.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hashedInput, "hex"), Buffer.from(hashedKey, "hex"));
}

export function generateApiKey(): { apiKey: string; hashedKey: string } {
  const apiKey = `atk_${crypto.randomBytes(24).toString("hex")}`;
  return { apiKey, hashedKey: hashApiKey(apiKey) };
}
