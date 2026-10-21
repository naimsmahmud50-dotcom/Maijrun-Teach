# Tasks: Phase 10 — Branded Admin Dashboard and Production Deployment (Cloudflare / VPS)

## Phase 1: Setup & Admin Security Engine (User Story 1 & 5)
- [x] T001 [P] [US1] Create Admin, RBAC and Analytics types in `storefront/src/lib/admin/types.ts`
- [x] T002 [P] [US5] Implement RFC 6238 TOTP 2FA Service in `storefront/src/lib/admin/totp-service.ts`
- [x] T003 [P] [US5] Implement Admin Authentication Service with lockout and password rules in `storefront/src/lib/admin/admin-auth.ts`
- [x] T004 [P] [US1] Implement Immutable Admin Audit Logging in `storefront/src/lib/admin/audit.ts`

## Phase 2: Operations & Catalog Management (User Story 2, 3, 4)
- [x] T005 [P] [US2] Implement Admin Operations Store (Products, Inventory, Orders, Coupons) in `storefront/src/lib/admin/store.ts`
- [x] T006 [US4] Implement Printable Invoice & Packing Slip Generator in `storefront/src/modules/admin/components/printable-invoice/index.tsx`
- [x] T007 [US1] Implement Admin API Routes for Auth, Products, Orders, Inventory, and Analytics in `storefront/src/app/api/admin/...`

## Phase 3: Branded Admin Dashboard UI (User Story 1)
- [x] T008 [US1] Implement Branded Admin Control Center Dashboard UI in `storefront/src/modules/admin/templates/index.tsx`
- [x] T009 [US1] Implement Admin Page route in `storefront/src/app/[countryCode]/(main)/admin/page.tsx`

## Phase 4: Production Containerization & Nginx Hardening (User Story 6)
- [x] T010 [P] [US6] Create Production Multi-Stage Dockerfile for Storefront in `deploy/docker/Dockerfile.storefront`
- [x] T011 [P] [US6] Create Production Dockerfile for Backend in `deploy/docker/Dockerfile.backend`
- [x] T012 [P] [US6] Create Production Docker Compose orchestration in `deploy/docker/docker-compose.production.yml`
- [x] T013 [P] [US6] Create Hardened Nginx Reverse Proxy Configuration in `deploy/nginx/nginx.conf` and `deploy/nginx/conf.d/maijrun.conf`

## Phase 5: VPS Hardening, Backups & CI/CD Pipeline (User Story 7)
- [x] T014 [P] [US7] Create Linux VPS Hardening Script in `deploy/scripts/vps-harden.sh`
- [x] T015 [P] [US7] Create Automated Encrypted Database Backup & Restore Runbook in `deploy/scripts/backup-db.sh` and `deploy/scripts/restore-db.sh`
- [x] T016 [P] [US7] Create GitHub Actions CI/CD Workflow in `.github/workflows/deploy.yml`

## Phase 6: Legal Compliance, SEO & Go-Live Checklist (User Story 8)
- [x] T017 [P] [US8] Create Privacy Policy Page in `storefront/src/app/[countryCode]/(main)/privacy-policy/page.tsx`
- [x] T018 [P] [US8] Create Terms of Service Page in `storefront/src/app/[countryCode]/(main)/terms-of-service/page.tsx`
- [x] T019 [P] [US8] Create Return & Refund Policy Page in `storefront/src/app/[countryCode]/(main)/refund-policy/page.tsx`
- [x] T020 [P] [US8] Create Dynamic Robots.txt and Sitemap.xml in `storefront/src/app/robots.ts` and `storefront/src/app/sitemap.ts`

## Phase 7: Automated Tests & Verification
- [x] T021 [P] Create Admin Security unit tests in `storefront/src/lib/__tests__/admin-security.test.ts`
- [x] T022 [P] Create Admin Operations unit tests in `storefront/src/lib/__tests__/admin-operations.test.ts`
- [x] T023 Execute test suite (`npm test`) and verify 100% pass rate
- [x] T024 Execute TypeScript strict check (`npx tsc --noEmit`) and production build (`npm run build`)
- [x] T025 Commit changes with message `phase-10: branded admin dashboard, 2fa security, and production deployment suite`
