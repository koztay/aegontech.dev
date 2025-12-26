export type SyntheticStatus = "ok" | "warn" | "fail";

export type SyntheticResult = {
  name: string;
  status: SyntheticStatus;
  message: string;
  details?: Record<string, unknown>;
};

type PortfolioSyntheticItem = {
  updatedAt?: string | null;
  featured?: boolean | null;
};

type PortfolioFreshnessInput = {
  items: PortfolioSyntheticItem[];
  maxStaleMinutes?: number;
  minItems?: number;
  minFeatured?: number;
};

type IngestionFailureInput = {
  total: number;
  failed: number;
  windowMinutes?: number;
  thresholdPercent?: number;
};

function toMs(minutes: number) {
  return minutes * 60_000;
}

function withinFreshnessBoundary(item: PortfolioSyntheticItem, thresholdMs: number): boolean {
  if (!item.updatedAt) return false;
  const updated = new Date(item.updatedAt).getTime();
  if (Number.isNaN(updated)) return false;
  return Date.now() - updated <= thresholdMs;
}

export function checkPortfolioFreshness(input: PortfolioFreshnessInput): SyntheticResult {
  const maxStaleMinutes = input.maxStaleMinutes ?? 180; // default: 3 hours
  const minItems = input.minItems ?? 3;
  const minFeatured = input.minFeatured ?? 3;
  const thresholdMs = toMs(maxStaleMinutes);

  const total = input.items.length;
  const featured = input.items.filter((item) => Boolean(item.featured)).length;
  const fresh = input.items.filter((item) => withinFreshnessBoundary(item, thresholdMs)).length;
  const stale = total - fresh;

  if (total < minItems) {
    return {
      name: "portfolio-freshness",
      status: "fail",
      message: `Only ${total} items available; need at least ${minItems} for strip confidence`,
      details: { total, featured, minItems, stale }
    };
  }

  if (featured < minFeatured) {
    return {
      name: "portfolio-freshness",
      status: "warn",
      message: `Featured set is thin (${featured}/${minFeatured}); add more pinned items to avoid repeats`,
      details: { total, featured, minFeatured, stale }
    };
  }

  if (stale > 0) {
    return {
      name: "portfolio-freshness",
      status: "warn",
      message: `${stale}/${total} items exceed freshness budget of ${maxStaleMinutes}m`,
      details: { total, featured, stale, maxStaleMinutes }
    };
  }

  return {
    name: "portfolio-freshness",
    status: "ok",
    message: `Strip is healthy: ${total} items, ${featured} featured, 0 stale`
  };
}

export function checkIngestionFailureRate(input: IngestionFailureInput): SyntheticResult {
  const windowMinutes = input.windowMinutes ?? 15;
  const thresholdPercent = input.thresholdPercent ?? 2;
  const total = Math.max(0, input.total);
  const failed = Math.max(0, input.failed);

  if (total === 0) {
    return {
      name: "ingestion-failure-rate",
      status: "warn",
      message: `No ingestion attempts in the last ${windowMinutes}m; check schedulers`,
      details: { windowMinutes }
    };
  }

  const failureRate = (failed / total) * 100;
  const ratePct = Math.round(failureRate * 100) / 100; // keep two decimals

  if (failureRate > thresholdPercent) {
    return {
      name: "ingestion-failure-rate",
      status: "fail",
      message: `Failure rate ${ratePct}% exceeds ${thresholdPercent}% over ${windowMinutes}m`,
      details: { total, failed, windowMinutes }
    };
  }

  return {
    name: "ingestion-failure-rate",
    status: "ok",
    message: `Failure rate ${ratePct}% within ${windowMinutes}m window`,
    details: { total, failed, windowMinutes }
  };
}

export function summarizeSynthetic(results: SyntheticResult[]): SyntheticResult {
  const failing = results.find((r) => r.status === "fail");
  if (failing) return failing;
  const warn = results.find((r) => r.status === "warn");
  if (warn) return warn;
  return {
    name: "synthetic-suite",
    status: "ok",
    message: `${results.length} checks passed`
  };
}
