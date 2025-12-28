/**
 * Client helper for presign->put->finalize flow (server-side usage)
 */
export async function uploadToPresignedUrl(uploadUrl: string, file: Buffer | Blob, contentType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file as any,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return true;
}
