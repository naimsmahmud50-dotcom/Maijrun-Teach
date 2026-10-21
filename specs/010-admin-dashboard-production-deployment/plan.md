# Implementation Plan: Phase 10 — Branded Admin Dashboard and Production Deployment (Cloudflare / VPS)

## 1. Architecture & Deliverable Structure

```
Maijrun Store/
├── deploy/
│   ├── docker/
│   │   ├── Dockerfile.storefront
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.production.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/maijrun.conf
│   └── scripts/
│       ├── vps-harden.sh
│       ├── backup-db.sh
│       └── restore-db.sh
├── .github/
│   └── workflows/
│       └── deploy.yml
└── storefront/
    ├── src/
    │   ├── lib/
    │   │   ├── admin/
    │   │   │   ├── types.ts
    │   │   │   ├── totp-service.ts
    │   │   │   ├── admin-auth.ts
    │   │   │   ├── rbac.ts
    │   │   │   ├── audit.ts
    │   │   │   └── store.ts
    │   │   └── __tests__/
    │   │       ├── admin-security.test.ts
    │   │       └── admin-operations.test.ts
    │   ├── app/
    │   │   ├── api/
    │   │   │   └── admin/
    │   │   │       ├── auth/login/route.ts
    │   │   │       ├── auth/2fa/route.ts
    │   │   │       ├── products/route.ts
    │   │   │       ├── inventory/route.ts
    │   │   │       ├── orders/route.ts
    │   │   │       ├── coupons/route.ts
    │   │   │       └── analytics/route.ts
    │   │   ├── [countryCode]/(main)/
    │   │   │   ├── privacy-policy/page.tsx
    │   │   │   ├── terms-of-service/page.tsx
    │   │   │   ├── refund-policy/page.tsx
    │   │   │   └── admin/page.tsx
    │   │   ├── robots.ts
    │   │   └── sitemap.ts
    │   └── modules/
    │       └── admin/
    │           ├── components/
    │           │   ├── analytics-summary/
    │           │   ├── product-manager/
    │           │   ├── order-fulfillment/
    │           │   ├── inventory-alerts/
    │           │   └── printable-invoice/
    │           └── templates/
    │               └── index.tsx
```

---

## 2. Security & Verification Milestones
1. **Admin 2FA & RBAC**:
   - RFC 6238 TOTP verification with window drift protection.
   - Brute-force lockout: 5 failed attempts locks admin IP/account for 30 minutes.
   - Least privilege roles: Owner, Manager, Staff with route and action guards.
2. **Production Containerization**:
   - Non-root user inside containers (`USER nextjs:nodejs`).
   - Standalone Next.js output minimization.
   - Secure inter-container networking (PostgreSQL and Redis never exposed to host/public).
3. **Hardened Nginx**:
   - OWASP ASVS L2 HTTP security headers.
   - IP rate-limiting zones (`limit_req_zone`).
4. **CI/CD & Infrastructure**:
   - GitHub Actions automated testing, vulnerability scanning, and zero-downtime deployment.
   - Automated AES-256 encrypted database backups with retention policy.
