/**
 * Supabase Storage adapter. Exports the same names as the former MinIO module (minio.ts).
 *
 * Behaviour differences vs MinIO that callers must know about:
 * - presignPut(objectName, expiresSeconds?): Supabase signed upload URLs have a FIXED expiry
 *   (2 hours = 7200 s); the expiresSeconds argument is accepted for compatibility but ignored;
 *   the presign route reports the real lifetime (`expiresIn: 7200`). The URL accepts a
 *   plain `PUT` with body + Content-Type (no signature headers). createSignedUploadUrl REJECTS
 *   ("The resource already exists") if the key already exists (MinIO would have overwritten).
 * - presignGet(objectName, expiresSeconds?): expiry is honoured (seconds), like MinIO. The bucket
 *   is public, so getPublicUrl() is normally what callers want.
 * - statObject returns { size, etag, mimeType, metaData: { "content-type" } } (etag without quotes),
 *   so finalize keeps working; it rejects if the object is missing (as MinIO did).
 * - getPublicUrl: built by supabase-js as {SUPABASE_URL}/storage/v1/object/public/{bucket}/{key}
 *   with the key percent-encoded (MinIO's version did not encode; sanitized keys are unaffected).
 * - The bucket name comes from SUPABASE_STORAGE_BUCKET and there is no default: functions throw
 *   "Missing SUPABASE_STORAGE_BUCKET environment variable" when it is unset (MinIO fell back to "public-media").
 * - The MinIO default client export is replaced by explicit functions (putObject).
 */
import { getSupabase } from "@/lib/supabase/server";

/** Bucket name from SUPABASE_STORAGE_BUCKET; there is deliberately no default (fail loudly). */
const bucketName = () => {
  const name = process.env.SUPABASE_STORAGE_BUCKET?.trim();
  if (!name) throw new Error("Missing SUPABASE_STORAGE_BUCKET environment variable");
  return name;
};
const bucket = () => getSupabase().storage.from(bucketName());

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function presignPut(objectName: string, _expiresSeconds = 300): Promise<string> {
  return check(await bucket().createSignedUploadUrl(objectName)).signedUrl;
}

export async function presignGet(objectName: string, expiresSeconds = 300): Promise<string> {
  return check(await bucket().createSignedUrl(objectName, expiresSeconds)).signedUrl;
}

export async function statObject(objectName: string) {
  const info = check(await bucket().info(objectName));
  const contentType = info.contentType || null;
  return {
    size: Number(info.size),
    etag: info.etag ? String(info.etag).replace(/"/g, "") : null,
    mimeType: contentType,
    metaData: { "content-type": contentType } as Record<string, string | null>,
  };
}

export async function removeObject(objectName: string): Promise<void> {
  check(await bucket().remove([objectName]));
}

export function getPublicUrl(objectName: string): string {
  return bucket().getPublicUrl(objectName).data.publicUrl;
}

export async function putObject(objectName: string, body: Buffer, contentType: string): Promise<void> {
  check(await bucket().upload(objectName, body, { contentType, upsert: false }));
}

export async function ensureBucketExists(): Promise<void> {
  const storage = getSupabase().storage;
  const { data } = await storage.getBucket(bucketName());
  if (!data) check(await storage.createBucket(bucketName(), { public: true }));
}
