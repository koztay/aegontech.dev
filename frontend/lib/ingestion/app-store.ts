import crypto from "crypto";

export type AppStoreMetadata = {
  id: string;
  title: string;
  summary: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
  artworkUrl?: string;
};

type FetchOptions = {
  url?: string;
  appId?: string;
  country?: string;
  timeoutMs?: number;
};

const DEFAULT_LOOKUP_BASE = process.env.APP_STORE_LOOKUP_BASE ?? "https://itunes.apple.com/lookup";
const DEFAULT_TIMEOUT = 8000;
const RETRIES = 1;

function extractAppIdFromUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/id(\d+)/);
  return match ? match[1] : null;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeArtwork(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/[0-9]+x[0-9]+bb\.jpg/, "/512x512bb.jpg");
}

export async function fetchAppStoreMetadata(options: FetchOptions): Promise<AppStoreMetadata> {
  const id = options.appId ?? extractAppIdFromUrl(options.url ?? undefined);
  if (!id) {
    throw new Error("App Store id is required");
  }

  const searchParams = new URLSearchParams({ id, country: options.country ?? "us" });
  const lookupUrl = `${DEFAULT_LOOKUP_BASE}?${searchParams.toString()}`;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetchWithTimeout(lookupUrl, timeoutMs);
      if (!res.ok) {
        throw new Error(`App Store lookup failed with ${res.status}`);
      }

      const data = (await res.json()) as { results?: Record<string, unknown>[] };
      const record = data.results?.[0];
      if (!record || typeof record.trackId !== "number") {
        throw new Error("App Store record not found");
      }

      const summary =
        (record.description as string | undefined) ??
        (record.trackCensoredName as string | undefined) ??
        "";

      const artwork = normalizeArtwork(record.artworkUrl512 as string | undefined ?? record.artworkUrl100 as string | undefined);

      return {
        id: String(record.trackId),
        title: (record.trackName as string | undefined) ?? "",
        summary,
        category: record.primaryGenreName as string | undefined,
        rating: record.averageUserRating as number | undefined,
        ratingCount: record.userRatingCount as number | undefined,
        artworkUrl: artwork,
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt === RETRIES) break;
    }
  }

  throw lastError ?? new Error("Unknown App Store lookup failure");
}

export function checksumFromBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
