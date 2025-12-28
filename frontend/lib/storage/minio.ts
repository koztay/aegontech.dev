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
  return new Promise((resolve, reject) => {
    client.presignedPutObject(bucket, objectName, expiresSeconds, (err: any, url: string) => {
      if (err) return reject(err);
      resolve(url);
    });
  });
}

export async function presignGet(objectName: string, expiresSeconds = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    client.presignedGetObject(bucket, objectName, expiresSeconds, (err: any, url: string) => {
      if (err) return reject(err);
      resolve(url);
    });
  });
}

export async function statObject(objectName: string) {
  return new Promise<any>((resolve, reject) => {
    (client as any).statObject(bucket, objectName, (err: any, stat: any) => {
      if (err) return reject(err);
      resolve(stat);
    });
  });
}

export async function removeObject(objectName: string) {
  return new Promise<void>((resolve, reject) => {
    client.removeObject(bucket, objectName, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
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

export async function ensureBucketExists() {
  return new Promise<void>((resolve, reject) => {
    (client as any).bucketExists(bucket, (err: any, exists: boolean) => {
      if (err) return reject(err);
      if (exists) return resolve();
      (client as any).makeBucket(bucket, "us-east-1", (err2: any) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
}

export default client;
