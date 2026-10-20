# MAIJRUN Tech - Next.js Storefront

High-performance, modern tech e-commerce storefront for **MAIJRUN Tech**, built with Next.js 15, React Server Components (RSC), and Tailwind CSS.

> **Note**: Built on open-source Next.js Storefront for Medusa.

---

## ⚡ Features
- **Ultra-Fast Performance**: Sub-second page loads powered by Next.js 15 App Router & Turbopack.
- **Laptop & Desktop Tech Specs**: Structured technical specifications display.
- **Central Brand Control**: Manage colors, name, logo, and contacts in `src/config/brand.ts`.
- **Faceted Product Filtering**: Filter hardware by Brand, Price, and Specifications.
- **Responsive Mobile First**: Flawless experience across smartphones, tablets, and desktops.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.template .env.local
```

Ensure `MEDUSA_BACKEND_URL` points to your active backend (default: `http://localhost:9000`).

### 3. Start Development Server
```bash
npm run dev
```

Open `http://localhost:8000` to view the MAIJRUN Tech storefront.

---

## 🎨 Brand Configuration
All brand assets and text can be modified in:
`src/config/brand.ts`

Replace logo assets:
- Logo: `public/logo.svg`
- Favicon: `public/favicon.svg` and `public/favicon.ico`

---

## 📄 License & Attribution
- Custom storefront UI & branding: **Copyright (c) 2026 MAIJRUN Tech**.
- Core starter template licensed under MIT (see `LICENSE`).
