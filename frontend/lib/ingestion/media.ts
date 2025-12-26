import crypto from "crypto";
import { getServiceRoleClient } from "@/lib/supabase/client";

const BUCKET = "public-media";

export type UploadInput = {
  buffer: Buffer;
  contentType: string;
  pathPrefix: string;
  fileName?: string;
};

export type UploadResult = {
  path: string;
  checksum: string;
};

export async function uploadToPublicBucket(input: UploadInput): Promise<UploadResult> {
  const client = getServiceRoleClient();
  const checksum = crypto.createHash("sha256").update(input.buffer).digest("hex");
  const fileName = input.fileName ?? `${checksum}.bin`;
  const path = `${input.pathPrefix}/${fileName}`.replace(/\/+/, "/");

  const { error } = await client.storage.from(BUCKET).upload(path, input.buffer, {
    contentType: input.contentType,
    upsert: true
  });
  if (error) {
    throw error;
  }
  return { path, checksum };
}
