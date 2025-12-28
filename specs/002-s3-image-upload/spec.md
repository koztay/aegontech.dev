% S3 / MinIO Image Upload Specification

# Feature Specification: S3 / MinIO Image Upload

**Feature Branch**: `002-s3-image-upload`
**Created**: 2025-12-28
**Status**: In Progress (core helper, API routes, admin UI and migration implemented; tests/docs pending)

## Overview

Add secure, server-mediated uploads of image media to an S3-compatible storage (MinIO). The admin UI will upload images via presigned URLs returned by server endpoints, then notify the server to finalize and register the media in Postgres. Support deletion of media when associated Portfolio or Blog items are deleted.

## Goals

- Secure direct-to-storage uploads without exposing MinIO credentials to clients
- Enforce MIME/size limits and required `alt_text` metadata
- Store canonical `storage_path` and metadata in `media_assets` Postgres table
- Support presign, finalize, and delete flows; audit all actions

## Actors

- Admin user (authenticated via site auth)
- Server (Next.js API routes)
- MinIO (S3-compatible storage)

## API Endpoints

POST /api/media/presign
- Auth: Admin (session/JWT)
- Body: { filename, contentType, sizeBytes, purpose: "portfolio" | "blog" }
- Response: { uploadUrl, objectKey, expiresAt }
- Validations: allowed MIME types (image/png, image/jpeg, image/webp), size <= configurable max (e.g., 5MB)

POST /api/media/finalize
- Auth: Admin
- Body: { objectKey, altText, caption?, associatedType?: "portfolio" | "blog", associatedId?: uuid }
- Action: verify object exists in MinIO, compute checksum/size/mime, insert `media_assets` row, return media record

DELETE /api/media/delete
- Auth: Admin or server-side deletion (on item delete)
- Body: { objectKey }
- Action: delete object from MinIO, remove `media_assets` DB row (or mark deleted), write audit log

## DB Contract (media_assets)

- id (uuid, pk)
- storage_path (text) -- MinIO object key
- url (text) -- public or proxied URL
- alt_text (text, not null)
- caption (text, nullable)
- source (enum: upload, capture, app_store)
- mime_type (text)
- size_bytes (int)
- checksum (text)
- created_by (uuid)
- created_at (timestamptz)

If `media_assets` already exists in project DB, map to existing fields and ensure `storage_path` and `checksum` present.

## Security & Policies

- MinIO credentials stored only on server (`.env`) (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET, MINIO_USE_SSL)
- Presigned URLs expire short (e.g., 5 minutes)
- Server enforces MIME and size; client-side checks are optional but recommended
- Audit logs for presign/finalize/delete actions with actor, IP, correlation_id

## Acceptance Criteria

- Admin can upload an image from the admin UI; image appears in media list and can be attached to Portfolio/Blog entries
- Uploaded images obey MIME/size restrictions; invalid uploads are rejected with a clear message
- Deleting a Portfolio/Blog item deletes associated images from MinIO and DB (or marks them deleted) when confirmed
- All media records contain `alt_text` before publish; server rejects finalize requests without `alt_text`
- Presigned upload + finalize round-trip completes within 5s on local network

## Tests

- Contract tests for `/api/media/presign`, `/api/media/finalize`, `/api/media/delete` including auth, validations, and happy/failure paths
- Integration test using local MinIO instance (docker-compose) and test Postgres: upload -> finalize -> serve URL -> delete

## Tasks (implementation scope)

1. Add MinIO helper `frontend/lib/storage/minio.ts` (init client, presignPut, exists, delete)
2. Create API routes: presign, finalize, delete under `frontend/app/api/media/*`
3. Add/verify DB migration for `media_assets` table and index on `storage_path`
4. Wire admin UI to call presign, upload file to `uploadUrl`, then call finalize with `altText` and association
5. Add audit logging and correlation IDs for media actions
6. Add contract/integration tests and local docker-compose for MinIO+Postgres testing

---

Notes: core implementation (MinIO helper, presign/finalize/delete routes, admin uploader, and DB migration) has been implemented and applied to the project. Remaining high-priority work: contract/integration tests, audit log verification, quickstart documentation.
