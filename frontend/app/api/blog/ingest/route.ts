import { NextResponse } from "next/server";
import { uploadToPublicBucket } from "@/lib/ingestion/media";
import { writeAuditLog } from "@/lib/observability/audit";
import { checkRateLimit } from "@/lib/observability/rate-limit";
import { logError, logInfo, logWarn, withCorrelationId } from "@/lib/observability/logging";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { verifyApiKey } from "@/lib/supabase/keys";

const MAX_IMAGE_BYTES = 2_000_000;

type ImagePayload = { url: string; alt: string };

function jsonError(status: number, message: string, correlationId: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, correlationId, ...extra }, { status });
}

async function validateKey(rawKey: string | null, correlationId: string) {
  if (!rawKey) return { ok: false, status: 401, message: "Missing API key" } as const;
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.from("api_keys").select("id, hashed_key, scope, status").eq("scope", "blog_ingest").maybeSingle();
  if (error || !data || data.status !== "active") return { ok: false, status: 401, message: "Invalid key" } as const;
  const ok = verifyApiKey(rawKey, data.hashed_key as string);
  if (!ok) return { ok: false, status: 401, message: "Invalid key" } as const;
  return { ok: true, apiKeyId: data.id as string } as const;
}

async function ensureSlugAvailable(slug: string) {
  const supabase = getServiceRoleClient();
  const { data } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
  return !data;
}

async function fetchImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    const error = new Error("Image exceeds max size");
    (error as any).code = "IMAGE_TOO_LARGE";
    throw error;
  }
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  return { buffer, contentType };
}

function validatePayload(body: any) {
  const required = ["title", "slug", "summary", "body", "tags", "images"] as const;
  for (const field of required) {
    if (body?.[field] === undefined || body?.[field] === null) return `Missing ${field}`;
  }
  if (!Array.isArray(body.tags)) return "tags must be an array";
  if (!Array.isArray(body.images)) return "images must be an array";
  for (const img of body.images as ImagePayload[]) {
    if (!img?.url || !img?.alt) return "images items require url and alt";
  }
  return null;
}

export async function POST(req: Request) {
  const correlationId = withCorrelationId(req.headers.get("x-correlation-id") ?? undefined);
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      return jsonError(400, "Invalid JSON body", correlationId);
    }

    const rawKey = req.headers.get("x-api-key");
    const keyCheck = await validateKey(rawKey, correlationId);
    if (!keyCheck.ok) {
      await writeAuditLog({
        actorId: "unknown",
        actorType: "api_key",
        action: "blog.ingest.rejected",
        entityType: "blog_post",
        outcome: "failure",
        correlationId,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ip: req.headers.get("x-forwarded-for") ?? undefined
      });
      return jsonError(keyCheck.status, keyCheck.message, correlationId);
    }

    const rate = checkRateLimit({ key: keyCheck.apiKeyId, correlationId });
    if (!rate.ok) {
      logWarn("Rate limit hit", { key: keyCheck.apiKeyId }, correlationId);
      return NextResponse.json({ error: "Rate limit exceeded", correlationId }, {
        status: 429,
        headers: rate.retryAfter ? { "retry-after": String(rate.retryAfter) } : undefined
      });
    }

    const validationError = validatePayload(body);
    if (validationError) {
      return jsonError(400, validationError, correlationId);
    }

    const slugAvailable = await ensureSlugAvailable(body.slug);
    if (!slugAvailable) {
      return jsonError(409, "Slug already exists", correlationId);
    }

    const status = body.publish === false ? "draft" : "published";
    const publishedAt = status === "published" ? new Date().toISOString() : null;

    const supabase = getServiceRoleClient();

    let featuredUpload: { buffer: Buffer; contentType: string } | null = null;
    if (body.featuredImage) {
      try {
        featuredUpload = await fetchImage(body.featuredImage as string);
      } catch (error) {
        const code = (error as any)?.code;
        if (code === "IMAGE_TOO_LARGE") return jsonError(400, "Featured image exceeds limit", correlationId);
        return jsonError(400, "Failed to fetch featured image", correlationId);
      }
    }

    const inlineUploads: Array<{ payload: ImagePayload; buffer: Buffer; contentType: string }> = [];
    for (const img of body.images as ImagePayload[]) {
      try {
        const fetched = await fetchImage(img.url);
        inlineUploads.push({ payload: img, buffer: fetched.buffer, contentType: fetched.contentType });
      } catch (error) {
        const code = (error as any)?.code;
        if (code === "IMAGE_TOO_LARGE") return jsonError(400, "Inline image exceeds limit", correlationId);
        logError("Inline image fetch failed", { error, url: img.url }, correlationId);
        return jsonError(400, "Failed to fetch inline image", correlationId);
      }
    }

    const { data: blog, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        body: body.body,
        tags: body.tags,
        featured_image_id: null,
        inline_media_ids: [],
        status,
        published_at: publishedAt,
        source: "api",
        api_key_id: keyCheck.apiKeyId
      })
      .select()
      .single();

    if (insertError || !blog) {
      const code = (insertError as any)?.code;
      if (code === "23505") return jsonError(409, "Slug already exists", correlationId);
      throw insertError ?? new Error("Insert failed");
    }

    let featuredImagePath: string | undefined;
    let featuredImageId: string | undefined;
    if (featuredUpload) {
      const uploaded = await uploadToPublicBucket({
        buffer: featuredUpload.buffer,
        contentType: featuredUpload.contentType,
        pathPrefix: `blog/${body.slug}`,
        fileName: "featured"
      });
      featuredImagePath = uploaded.path;
      const { data: featuredRecord, error: featuredError } = await supabase
        .from("media_assets")
        .insert({
          blog_post_id: blog.id,
          storage_path: uploaded.path,
          alt_text: body.title,
          source: "upload",
          mime_type: featuredUpload.contentType,
          checksum: uploaded.checksum
        })
        .select("id")
        .single();
      if (!featuredError && featuredRecord) {
        featuredImageId = featuredRecord.id as string;
      }
    }

    const inlinePaths: string[] = [];
    const inlineMediaIds: string[] = [];
    for (const [idx, img] of inlineUploads.entries()) {
      try {
        const uploaded = await uploadToPublicBucket({
          buffer: img.buffer,
          contentType: img.contentType,
          pathPrefix: `blog/${body.slug}`,
          fileName: `inline-${idx + 1}`
        });
        inlinePaths.push(uploaded.path);
        const { data: inlineRecord, error: inlineError } = await supabase
          .from("media_assets")
          .insert({
            blog_post_id: blog.id,
            storage_path: uploaded.path,
            alt_text: img.payload.alt,
            source: "upload",
            mime_type: img.contentType,
            checksum: uploaded.checksum
          })
          .select("id")
          .single();
        if (!inlineError && inlineRecord) {
          inlineMediaIds.push(inlineRecord.id as string);
        }
      } catch (error) {
        logError("Inline image upload failed", { error, url: img.payload.url }, correlationId);
      }
    }

    if (featuredImageId || inlineMediaIds.length > 0) {
      await supabase
        .from("blog_posts")
        .update({
          featured_image_id: featuredImageId ?? null,
          inline_media_ids: inlineMediaIds
        })
        .eq("id", blog.id);
    }

    await writeAuditLog({
      actorId: keyCheck.apiKeyId,
      actorType: "api_key",
      action: "blog.ingest.success",
      entityType: "blog_post",
      entityId: blog.id,
      outcome: "success",
      correlationId,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined
    });

    logInfo("Blog ingest success", { blogId: blog.id }, correlationId);

    return NextResponse.json({ id: blog.id, status: blog.status, featuredImagePath, inlinePaths, correlationId });
  } catch (error) {
    logError("Blog ingest error", { error }, correlationId);
    return NextResponse.json({ error: (error as Error).message, correlationId }, { status: 500 });
  }
}
