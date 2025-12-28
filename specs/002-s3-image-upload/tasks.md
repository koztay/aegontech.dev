# Tasks: S3 / MinIO Image Upload (002-s3-image-upload)

**Input**: specs/002-s3-image-upload/spec.md

## Phase 1: Setup
- [ ] T001 Add MinIO env samples to `frontend/.env.example` and `frontend/.env.local.sample`
- [ ] T002 [P] Add `docker-compose.yml` for local Postgres + MinIO under `dev/` (dev/docker-compose.minio.yml)

## Phase 2: Foundational
- [ ] T003 [P] Add Postgres migration for `media_assets` table in `frontend/supabase/migrations/` or `migrations/` (SQL file)
- [ ] T004 [P] Implement Postgres client helper in `frontend/lib/db/client.ts`

## Phase 3: [US1] MinIO storage & API (P1)
- [ ] T005 [US1] Implement MinIO helper in `frontend/lib/storage/minio.ts` (init client, presignPut, exists, delete)
- [ ] T006 [US1] Implement presign API route in `frontend/app/api/media/presign/route.ts`
- [ ] T007 [US1] Implement finalize API route in `frontend/app/api/media/finalize/route.ts` (verify object, compute checksum, insert `media_assets`)
- [ ] T008 [US1] Implement delete API route in `frontend/app/api/media/delete/route.ts` (delete object, remove DB row or mark deleted, audit)

## Phase 4: [US1] Admin UI integration
- [ ] T009 [US1] Update admin portfolio upload UI to call presign, upload file to `uploadUrl`, then finalize in `frontend/app/(marketing)/admin/portfolio/page.tsx`
- [ ] T010 [US1] Update admin blog upload UI (if present) in `frontend/app/(marketing)/admin/blog/page.tsx` to use same flow
- [ ] T011 [US1] Add client helper `frontend/lib/storage/upload.ts` for multipart flow (presign->put->finalize)

## Phase 5: Tests & CI
- [ ] T012 [P] Add contract tests for media APIs in `frontend/tests/contract/media.spec.ts`
- [ ] T013 [P] Add integration tests using local docker-compose MinIO+Postgres in `frontend/tests/integration/media-integration.spec.ts`

## Phase 6: Polish & Docs
- [ ] T014 [P] Add audit logging calls for presign/finalize/delete in `frontend/lib/observability/audit.ts`
- [ ] T015 Update `specs/002-s3-image-upload/spec.md` with implementation notes and task mapping
- [ ] T016 Update `specs/001-portfolio-site/quickstart.md` with local MinIO instructions and env var examples

## Dependencies
- T003 and T004 must be completed before T007 and T008.
- T005 and T006 must be in place before admin UI tasks T009–T011.

## Parallel Opportunities
- T002 can run in parallel with T003/T004.
- T006, T007, T008 can be developed in parallel once `minio.ts` exists.

End of checklist for S3/MinIO image upload.
