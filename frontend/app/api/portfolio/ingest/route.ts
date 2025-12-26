import { NextResponse } from "next/server";
import { fetchAppStoreMetadata } from "@/lib/ingestion/app-store";
import { fetchScreenshot } from "@/lib/ingestion/browserless";
import { uploadToPublicBucket } from "@/lib/ingestion/media";
import { logError, logInfo, withCorrelationId } from "@/lib/observability/logging";
import { writeAuditLog } from "@/lib/observability/audit";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { requireAdminSession } from "@/lib/supabase/admin-session";

const BUCKET = "public-media";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  const correlationId = withCorrelationId(req.headers.get("x-correlation-id") ?? undefined);
  try {
    const admin = await requireAdminSession(req);
    const body = await req.json();
    const sourceUrl: string | undefined = body?.sourceUrl;
    const type: "web" | "app" | undefined = body?.type;
    const featured: boolean = Boolean(body?.featured ?? false);
    const orderRank: number | undefined = body?.orderRank;
    const overrides = body?.overrides ?? {};

    if (!sourceUrl || !type) {
      await writeAuditLog({
        actorId: admin.userId,
        actorType: "user",
        action: "portfolio.ingest.rejected",
        entityType: "portfolio_item",
        outcome: "failure",
        correlationId,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ip: req.headers.get("x-forwarded-for") ?? undefined
      });
      return badRequest("sourceUrl and type are required");
    }

    const supabase = getServiceRoleClient();
    let needsAttention = false;
    let metadataSnapshot: Record<string, unknown> = {};

    if (type === "app") {
      try {
        const appMeta = await fetchAppStoreMetadata({ url: sourceUrl });
        metadataSnapshot.appStore = appMeta;
        if (!overrides.title) overrides.title = appMeta.title;
        if (!overrides.summary) overrides.summary = appMeta.summary;
      } catch (error) {
        needsAttention = true;
        logError("App Store lookup failed", { error, sourceUrl }, correlationId);
      }
    }

    let screenshotPath: string | undefined;
    let screenshotChecksum: string | undefined;
    try {
      const shot = await fetchScreenshot(sourceUrl);
      const upload = await uploadToPublicBucket({
        buffer: shot.buffer,
        contentType: shot.mimeType,
        pathPrefix: `portfolio/${Date.now()}`
      });
      screenshotPath = upload.path;
      screenshotChecksum = upload.checksum;
    } catch (error) {
      needsAttention = true;
      logError("Screenshot capture failed", { error, sourceUrl }, correlationId);
    }

    const { data: upserted, error: upsertError } = await supabase
      .from("portfolio_items")
      .upsert({
        source_url: sourceUrl,
        type,
        title: overrides.title ?? "",
        summary: overrides.summary ?? "",
        tags: overrides.tags ?? [],
        featured_flag: featured,
        order_rank: orderRank ?? 0,
        hero_link: sourceUrl,
        metadata_snapshot: metadataSnapshot,
        status: needsAttention ? "needs_attention" : "published"
      }, { onConflict: "source_url" })
      .select()
      .single();

    if (upsertError || !upserted) {
      throw upsertError ?? new Error("Failed to upsert portfolio item");
    }

    if (screenshotPath) {
      await supabase.from("media_assets").upsert({
        portfolio_item_id: upserted.id,
        storage_path: screenshotPath,
        alt_text: overrides.title ?? upserted.title ?? "Screenshot",
        source: "capture",
        mime_type: "image/png",
        checksum: screenshotChecksum
      });
    }

    await writeAuditLog({
      actorId: admin.userId,
      actorType: "user",
      action: "portfolio.ingest.success",
      entityType: "portfolio_item",
      entityId: upserted.id,
      outcome: "success",
      correlationId,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined
    });

    logInfo("Portfolio ingest completed", { portfolioId: upserted.id }, correlationId);

    return NextResponse.json({
      id: upserted.id,
      status: upserted.status,
      needsAttention,
      screenshotPath,
      bucket: BUCKET
    });
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    logError("Portfolio ingest error", { error }, correlationId);
    return NextResponse.json({ error: (error as Error).message, correlationId }, { status });
  }
}
