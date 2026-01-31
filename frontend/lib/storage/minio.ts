import { Client as MinioClient } from "minio";

// Support multiple env var names used in this repo/setup
const s3Endpoint = process.env.MINIO_S3_ENDPOINT || process.env.MINIO_ENDPOINT;
const accessKey = process.env.MINIO_ADMIN_USER || process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_ADMIN_PASSWORD || process.env.MINIO_SECRET_KEY;
const bucket = process.env.MINIO_S3_BUCKET_NAME || process.env.MINIO_BUCKET || "public-media";

let endpointHost = "127.0.0.1";
let endpointPort = 9000;
let useSSL = false;

if (s3Endpoint) {
  try {
    const url = new URL(s3Endpoint);
    endpointHost = url.hostname;
    endpointPort = url.port ? Number(url.port) : (url.protocol === "https:" ? 443 : 80);
    useSSL = url.protocol === "https:";
  } catch (e) {
    // fallback if parsing fails
    endpointHost = s3Endpoint;
  }
}

if (!s3Endpoint || !accessKey || !secretKey) {
  console.warn("MinIO environment variables not fully set; MinIO client may fail.");
}

const client = new MinioClient({
  endPoint: endpointHost,
  port: endpointPort,
  useSSL,
  accessKey: accessKey || "",
  secretKey: secretKey || "",
});

export async function presignPut(objectName: string, expiresSeconds = 300): Promise<string> {
  return await client.presignedPutObject(bucket, objectName, expiresSeconds);
}

export async function presignGet(objectName: string, expiresSeconds = 300): Promise<string> {
  return await client.presignedGetObject(bucket, objectName, expiresSeconds);
}

export async function statObject(objectName: string) {
  return await client.statObject(bucket, objectName);
}

export async function removeObject(objectName: string) {
  await client.removeObject(bucket, objectName);
}

export function getPublicUrl(objectName: string) {
  // Prefer explicit public URL if provided
  const publicUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_S3_ENDPOINT;
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${bucket}/${objectName}`;
  }

  const scheme = useSSL ? "https" : "http";
  return `${scheme}://${endpointHost}:${endpointPort}/${bucket}/${objectName}`;
}

export async function setPublicPolicy() {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };

  try {
    await client.setBucketPolicy(bucket, JSON.stringify(policy));
  } catch (err) {
    console.warn("Failed to set public bucket policy:", err);
    // Don't reject, just warn
  }
}

export async function ensureBucketExists() {
  try {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket, "us-east-1");
    }
    await setPublicPolicy();
  } catch (err) {
    throw err;
  }
}

export default client;
