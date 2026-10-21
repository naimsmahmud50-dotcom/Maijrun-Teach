# ⚡ MAIJRUN Tech — Enterprise Tech E-Commerce Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Medusa Engine](https://img.shields.io/badge/Medusa-v1.20-purple?style=for-the-badge)](https://medusajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Production_Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Security Baseline](https://img.shields.io/badge/Security-OWASP_ASVS_L2-green?style=for-the-badge)](https://owasp.org/)
[![Tests](https://img.shields.io/badge/Tests-112%20Passing%20(100%25)-brightgreen?style=for-the-badge)](https://github.com/)

A production-grade, full-stack headless e-commerce ecosystem built specifically for Bangladesh's tech and hardware market (Laptops, Custom Desktops, PC Components). All prices are formatted in **BDT (৳)**, fully integrated with local payment gateways (**bKash, Nagad, SSLCommerz**), courier networks (**Steadfast, Pathao**), and protected by strict **OWASP ASVS Level 2** security.

---

## 🌟 Key Feature Highlights (Phases 1–10)

### 🛒 1. Customer Storefront & Filtering (Phases 1–5)
- **Luxury Dark/Cyan Tech Branding**: Fast, accessible, responsive UI with zero horizontal layout shifts.
- **Detailed Hardware Specs Table**: Dedicated specs parser for Processor, RAM, GPU, Storage, Display, Battery, Ports, and Warranty.
- **Live Inventory & Warranty Badges**: Real-time stock status (In Stock, Low Stock `<3` units with pulse effect, Out of Stock).
- **Faceted Tech Filters**: Dynamic brand, processor family, budget slider with BDT presets, and mobile bottom sheet drawer.
- **Bangladesh Shipping Matrix**: 64-district delivery matrix (Inside Dhaka ৳80 / 24-48h; Outside Dhaka ৳150 / 2-4 days) with local phone validation.

### ⚙️ 2. Custom PC Builder Tool (Phase 6)
- **Live Hardware Compatibility Engine**:
  - CPU Socket vs Motherboard Socket matching (`AM5`, `LGA1700`).
  - RAM generation compatibility (`DDR4` vs `DDR5`).
  - Motherboard form factor vs Case clearance (`ATX`, `Micro-ATX`, `Mini-ITX`).
  - GPU physical length (mm) vs Case max clearance.
  - Estimated power draw calculation + **20% PSU safety headroom**.
- **Server-Side PDF Quotation**: Download branded official quotation valid for 7 days.
- **Shareable Build URLs**: Permanent unguessable links (UUID/nanoid) for sharing builds on social media and forums.

### 💳 3. Bangladesh Payment Gateways (Phase 7)
- **bKash Tokenized Checkout API**: Seamless pop-up/redirect flow with server-side execution & query verification.
- **Nagad Merchant API**: RSA/AES cryptographic payload encryption and SHA-256 signatures.
- **SSLCommerz Hosted Gateway**: Visa, Mastercard, AMEX, DBBL Nexus, and Internet banking with IPN validation.
- **Cash on Delivery (COD)**: Zero advance payment flow.
- **Anti-Fraud & ASVS Defenses**: Server-computed amounts (no client price tampering), idempotent callbacks, and automatic stale payment reconciliation (releases reserved inventory after 15 minutes).

### ⚖️ 4. Laptop & Desktop Comparison Tool (Phase 8)
- **Side-by-Side Matrix**: Compare 2–3 products simultaneously across all hardware specifications.
- **Smart Diff Highlighting**: Instant visual marker on differences with a "Hide Identical Rows" toggle.
- **Best Value Badges**: Automated badges highlighting superior specifications (e.g., higher RAM, lower price, lighter weight).
- **Shareable URL**: Accessible via `/compare?ids=prod_1,prod_2,prod_3`.

### 📱 5. Passwordless BD Phone OTP & Live Courier Tracking (Phase 9)
- **Phone OTP Authentication**:
  - E.164 normalization for Bangladesh mobile numbers (`+8801XXXXXXXXX`).
  - Cryptographically secure 6-digit random code, salted hash at rest, 5-minute expiry, single-use enforcement, 60s cooldown, max 5 sends/hour.
  - Constant-time verification (`crypto.timingSafeEqual`) preventing timing attacks.
  - Multi-device session management with "Log out all devices" token revocation.
- **Live Courier Tracking Engine**:
  - Direct API integration with **Steadfast Courier** and **Pathao Courier**.
  - One-click consignment booking from admin and tracking code generation.
  - Webhook handlers with HMAC signature verification.
  - Non-sequential unguessable order IDs with IDOR-protected guest tracking.

### 🛡️ 6. Branded Admin Dashboard & Security (Phase 10)
- **Control Center Hub**:
  - **Live Sales Analytics**: Today's revenue, weekly/monthly cashflow, and top-selling products.
  - **Catalog & PC Builder Specs**: Add/edit components, set compatibility flags, and bulk CSV import/export.
  - **Live Inventory & Low Stock Alerts**: Instant alerts for stock `< 3` units with audit-logged stock adjustments.
  - **One-Click Courier Dispatch & Tax Invoices**: Book parcels directly into Steadfast/Pathao, print barcode-ready tax invoices and packing slips.
  - **Coupons & Discounts**: Percentage and fixed BDT discounts with min order values and usage limits.
  - **Immutable Audit Trail**: Append-only log recording every admin action, IP address, and role.
- **Admin Security Suite**:
  - **RFC 6238 TOTP 2FA**: Mandatory two-factor authentication (Google Authenticator / Authy compatible).
  - **Brute-Force Lockout**: 5 failed login attempts trigger 30-minute lockout with audit alerts.
  - **Session Inactivity**: Short-lived 30-minute session TTL with auto-refresh on activity.
  - **Role-Based Access Control (RBAC)**: Owner, Manager, and Staff permission matrices.

---

## 🏗️ System Architecture

```text
MAIJRUN Store/
├── storefront/             # Next.js 15 App Router (TypeScript, Tailwind, Radix UI)
│   ├── src/app/            # App router pages, SSR templates, and API routes
│   │   ├── (main)/admin/   # Admin Control Center portal
│   │   ├── (main)/pc-builder/ # Custom PC Builder tool
│   │   ├── (main)/compare/ # Comparison tool
│   │   ├── (main)/track/   # Live order tracking page
│   │   └── api/            # API endpoints (Auth, Payments, Admin, Tracking)
│   ├── src/lib/            # Core business logic & security engines
│   │   ├── admin/          # Admin auth, TOTP 2FA, store, and audit logging
│   │   ├── auth/           # BD Phone OTP service, session tokens, audit logger
│   │   ├── payments/       # Gateway adapters (bKash, Nagad, SSLCommerz, COD)
│   │   ├── pc-builder/     # Hardware compatibility verification engine
│   │   └── tracking/       # Courier adapters (Steadfast, Pathao, Mock)
│   └── src/modules/        # Modular UI components & templates
├── backend/                # Medusa v1.20 Headless E-Commerce Core & Admin API
│   ├── src/scripts/        # Database seeders (demo laptops, desktops, components)
│   └── medusa-config.js    # PostgreSQL, Redis, and plugin configuration
├── deploy/                 # Production containerization & server hardening suite
│   ├── docker/             # Multi-stage Dockerfiles & docker-compose.production.yml
│   ├── nginx/              # Hardened Nginx configuration, SSL, and rate limit zones
│   └── scripts/            # VPS hardening script, AES-256 GPG backup & restore runbooks
├── specs/                  # GitHub Spec Kit: Full SDD specifications (001 to 010)
└── .github/workflows/      # Automated CI/CD deployment pipeline
```

---

## 🧪 Automated Testing & Verification

The platform features an automated test suite executed with Node's native test runner (`tsx --test`):

```bash
npm test --prefix storefront
```

```text
ℹ tests 112
ℹ suites 40
ℹ pass 112
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 343.72ms
```

- **Type Safety**: Full strict TypeScript compilation (`npx tsc --noEmit`) passes with **0 errors**.
- **Production Build**: Multi-stage standalone Next.js 15 build passes with **0 errors** across 42 static & dynamic routes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: v15 or higher
- **Redis**: v7 or higher

### 2. Local Setup
```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd "Maijrun Store"

# 1. Setup and start Storefront
cd storefront
npm install --legacy-peer-deps
npm run build
npm run dev

# 2. Visit storefront in your browser:
# http://localhost:8000 (or http://localhost:8001)
```

---

## 🚢 Production Deployment (VPS & Docker)

Deploy directly to an Ubuntu 22.04 / 24.04 VPS:

```bash
# 1. Run VPS hardening script (Hardens SSH on port 2222, UFW firewall, Fail2ban)
sudo ./deploy/scripts/vps-harden.sh

# 2. Configure production .env file
cp .env.example .env

# 3. Launch Docker Compose orchestration (Storefront + Backend + Postgres + Redis + Nginx)
docker compose -f deploy/docker/docker-compose.production.yml up -d --build

# 4. Schedule daily encrypted GPG database backup
crontab -e
# Add: 0 3 * * * /opt/maijrun-store/deploy/scripts/backup-db.sh
```

---

## 📄 License & Attribution
- Custom code, architecture, and branding: **Copyright (c) 2026 MAIJRUN Tech**. All rights reserved.
- Third-party open-source components are licensed under the MIT License.
