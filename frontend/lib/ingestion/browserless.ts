import crypto from "crypto";

export type ScreenshotResult = {
  buffer: Buffer;
  mimeType: string;
  checksum: string;
};

type ScreenshotOptions = {
  viewport?: { width: number; height: number };
  timeoutMs?: number;
};

const DEFAULT_BROWSERLESS_ENDPOINT = process.env.BROWSERLESS_URL ?? "https://chrome.browserless.io";
const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY;
const DEFAULT_TIMEOUT = 10000;
const RETRIES = 1;

function assertBrowserlessConfig() {
  if (!BROWSERLESS_API_KEY) {
    throw new Error("BROWSERLESS_API_KEY is required for screenshot ingestion");
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchScreenshot(sourceUrl: string, opts: ScreenshotOptions = {}): Promise<ScreenshotResult> {
  assertBrowserlessConfig();

  const endpoint = `${DEFAULT_BROWSERLESS_ENDPOINT.replace(/\/$/, "")}/screenshot?token=${BROWSERLESS_API_KEY}`;
  const payload = {
    url: sourceUrl,
    options: {
      fullPage: true,
      waitUntil: "networkidle0",
      viewport: opts.viewport ?? { width: 1280, height: 720 }
    }
  };

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }, timeoutMs);

      if (!res.ok) {
        throw new Error(`Browserless responded with ${res.status}`);
      }

      const mimeType = res.headers.get("content-type") ?? "image/png";
      const buffer = Buffer.from(await res.arrayBuffer());
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      return { buffer, mimeType, checksum };
    } catch (error) {
      lastError = error as Error;
      if (attempt === RETRIES) break;
    }
  }

  throw lastError ?? new Error("Unknown screenshot failure");
}
