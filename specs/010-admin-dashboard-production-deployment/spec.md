# Feature Specification: Phase 10 — Branded Admin Dashboard and Production Deployment (Cloudflare / VPS)

## 1. Overview & Objectives
Phase 10 is the productionization and management milestone for MAIJRUN Tech:
- **Branded Admin Dashboard**: Tailored management console with MAIJRUN Tech identity (Slate/Neon Cyan luxury dark theme, logo, favicon), Role-Based Access Control (Owner, Manager, Staff), product and PC Builder compatibility management, real-time inventory alerts, order fulfillment, and printable invoices/packing slips.
- **Admin Security Hardening**: Mandatory 2FA (TOTP), strong password enforcement, short session timeouts, rate limiting/lockouts, IP allow-listing, and immutable audit logs.
- **Production Containerization & Orchestration**: Production multi-stage Dockerfiles for Storefront and Backend, orchestrated with PostgreSQL 16 and Redis via Docker Compose.
- **Nginx Hardening & Security Headers**: Strict CSP, HSTS, Brotli/gzip compression, rate-limiting zones, and SSL termination.
- **Production VPS & Cloudflare Security**: UFW firewall, Fail2ban, SSH key-only access, Cloudflare WAF, Turnstile, automated encrypted daily DB backups, and GitHub Actions CI/CD with automated rollback.
- **Go-Live Checklist**: Complete environment checklist, DNS/SSL setup, robots.txt, sitemap.xml, and legal compliance pages (Privacy Policy, Terms of Service, Refund Policy).

---

## 2. User Stories & Acceptance Criteria

### US1: Branded Admin Dashboard & Role-Based Access Control (P1)
- **As a** store owner or operations staff,
- **I want to** access a secure, customized admin panel matching MAIJRUN Tech branding,
- **So that** I can efficiently operate the business with role-appropriate permissions.
- **Acceptance Criteria**:
  1. Branded UI with MAIJRUN Tech logo, typography, and dark-mode luxury theme.
  2. RBAC roles enforced: Owner (full access), Manager (orders, catalog, inventory, discounts), Staff (read-only orders, print labels).
  3. Every administrative modification is recorded in an immutable audit log with admin ID, action, target entity, and timestamp.

### US2: Product & Technical Specs Catalog Management (P1)
- **As an** inventory manager,
- **I want to** create, update, and categorize tech products with technical compatibility attributes,
- **So that** products immediately appear in the Store, Comparison tool, and Custom PC Builder.
- **Acceptance Criteria**:
  1. Product editor supports CPU socket, RAM type (DDR4/DDR5), form factor, TDP, GPU length, PSU wattage, and display specs.
  2. Drag-and-drop image upload with WebP conversion.
  3. Bulk CSV import and export for product listings.

### US3: Inventory Levels & Low-Stock Alerts (P1)
- **As an** operations manager,
- **I want to** monitor live stock levels and receive warnings when stock runs low,
- **So that** we prevent out-of-stock scenarios on popular hardware.
- **Acceptance Criteria**:
  1. Live stock view per variant with status badges (In Stock, Low Stock < 3, Out of Stock).
  2. Inventory adjustment logs recording quantity changes with reason (restock, order fulfilled, damage).

### US4: Order Fulfillment, Invoicing & Courier Dispatch (P1)
- **As a** fulfillment specialist,
- **I want to** view orders, print branded invoices/packing slips, and dispatch parcels to Steadfast/Pathao with a single click,
- **So that** orders are packed and shipped within 24 hours.
- **Acceptance Criteria**:
  1. Order list filterable by status, date, and payment gateway.
  2. Printable HTML Invoice and Packing Slip with QR code and barcode representation.
  3. One-click "Dispatch to Steadfast" / "Dispatch to Pathao" generating consignment ID and tracking code.
  4. Refund and cancellation workflow with automated inventory restocking.

### US5: Admin Security Hardening (2FA TOTP, Lockout, Short Sessions) (P1)
- **As a** security officer,
- **I want to** ensure only authorized administrative personnel can access backend operations,
- **So that** customer data, order details, and shop configurations remain secure.
- **Acceptance Criteria**:
  1. Mandatory 2FA via Time-based One-Time Password (TOTP, Google Authenticator / Authy).
  2. Max 5 failed login attempts triggers 30-minute lockout.
  3. Session expires after 30 minutes of inactivity.
  4. Admin authentication routes protected against public registration.

### US6: Production Containerization & Nginx Hardening (P1)
- **As a** DevOps engineer,
- **I want to** run the storefront and backend in isolated production Docker containers behind a hardened Nginx reverse proxy,
- **So that** deployments are reproducible, fast, and protected against web application threats.
- **Acceptance Criteria**:
  1. Multi-stage Dockerfiles generating minimal, secure production images.
  2. `docker-compose.yml` linking Next.js storefront, Medusa backend, PostgreSQL 16 Alpine, Redis, and Nginx.
  3. `nginx.conf` enforcing HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Brotli/Gzip, and rate limiting.

### US7: VPS Hardening, Automated Encrypted Backups & CI/CD (P1)
- **As a** sysadmin,
- **I want to** harden the Linux VPS, automate daily encrypted PostgreSQL backups, and deploy via GitHub Actions,
- **So that** the infrastructure is robust, self-healing, and disaster-proof.
- **Acceptance Criteria**:
  1. VPS hardening script: non-root sudo user, SSH key authentication only, UFW firewall (22/custom, 80, 443), and Fail2ban.
  2. Daily backup cron script generating AES-256 encrypted `pg_dump` with 14-day retention and tested restore runbook.
  3. GitHub Actions CI/CD workflow testing, linting, auditing dependencies, building images, and deploying with zero downtime.

### US8: Go-Live Readiness, SEO & Legal Compliance (P2)
- **As a** store operator,
- **I want to** launch with complete legal compliance, robots.txt, sitemaps, and live credentials,
- **So that** MAIJRUN Tech is legally sound and discoverable on Google.
- **Acceptance Criteria**:
  1. Dynamic `robots.txt` and `sitemap.xml` for all product and catalog URLs.
  2. Comprehensive Privacy Policy (GDPR / BD Cyber Security Act compliant), Terms of Service, and Return & Refund Policy pages.
  3. Go-live verification checklist covering DNS, SSL Full (Strict), WAF, payment sandbox-to-live migration, and monitoring.
