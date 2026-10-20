# MAIJRUN Tech - E-Commerce Platform

Official e-commerce platform for **MAIJRUN Tech**, a premier online store specializing in high-performance Laptops, Custom Desktops, Computer Hardware, and Tech Accessories.

> **Note**: Built on open-source Medusa and Next.js.

---

## 🏗️ Architecture Overview

The platform uses a modern headless e-commerce architecture:

```text
Maijrun Store/
├── backend/       # MedusaJS v2 Headless Commerce Engine & Admin Dashboard (Port 9000)
├── storefront/    # Next.js 15 App Router Customer-Facing Storefront (Port 8000)
├── .specify/      # Spec-Driven Development (SDD) Governance & Constitution
└── specs/         # Engineering Feature Specifications & Actionable Tasks
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 or higher (`v24.x` recommended)
- **Package Manager**: `npm` or `yarn`
- **Database**: PostgreSQL (local or cloud instance like Supabase / Neon)

---

### 1. Backend Setup & Startup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.template .env
# Edit .env with your PostgreSQL DATABASE_URL

# 3. Run database migrations and seed MAIJRUN demo catalog
npm run seed

# 4. Start the backend development server
npm run dev
```

* **Backend API**: `http://localhost:9000`
* **Admin Dashboard**: `http://localhost:9000/app`

---

### 2. Storefront Setup & Startup

```bash
cd storefront

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.template .env.local

# 3. Start the Next.js development server
npm run dev
```

* **Storefront URL**: `http://localhost:8000`

---

## 🎨 Central Brand Customization

The storefront branding, contact details, social links, and theme colors are managed from a single central configuration file:

📁 **`storefront/src/config/brand.ts`**

```typescript
export const brandConfig = {
  name: "MAIJRUN Tech",
  tagline: "Your Next-Gen Tech Destination",
  description: "Official store for premium laptops, custom desktops, and accessories.",
  supportEmail: "support@maijrun.com",
  // Edit colors, socials, and phone in one place!
}
```

### Replacing Logo & Favicon Assets
To swap in your final visual identity:
1. **Main Logo**: Replace `storefront/public/logo.svg`
2. **Browser Favicon**: Replace `storefront/public/favicon.svg` and `storefront/public/favicon.ico`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...` |
| `JWT_SECRET` | Secret key for customer authentication | `supersecret-...` |
| `COOKIE_SECRET` | Secret key for session cookies | `supersecret-...` |
| `STORE_CORS` | Allowed CORS origins for storefront | `http://localhost:8000` |
| `ADMIN_CORS` | Allowed CORS origins for admin portal | `http://localhost:9000,http://localhost:5173` |

### Storefront (`storefront/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `MEDUSA_BACKEND_URL` | URL of the running Medusa backend | `http://localhost:9000` |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the storefront | `http://localhost:8000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default store region (ISO-2) | `us` or `bd` |

---

## 📦 Production Deployment

* **Frontend (Storefront)**: Deploy to [Vercel](https://vercel.com) with root directory set to `storefront`.
* **Backend & Admin**: Deploy to [Railway](https://railway.app), [Render](https://render.com), or any Linux VPS with PostgreSQL.

---

## 📄 License & Attribution
- Custom code & branding: **Copyright (c) 2026 MAIJRUN Tech**. All rights reserved.
- Third-party open-source components are licensed under the MIT License (see `NOTICE.md`).
