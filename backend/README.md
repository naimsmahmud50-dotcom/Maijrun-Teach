# MAIJRUN Tech - E-Commerce Backend & Admin API

Core headless e-commerce engine and administrative portal for **MAIJRUN Tech**, powered by MedusaJS v2.

> **Note**: Built on open-source Medusa.

---

## 🛠️ Features
- **Modular Commerce Architecture**: Products, Inventory, Orders, Customers, and Cart modules.
- **Embedded Admin Dashboard**: Access full store management at `http://localhost:9000/app`.
- **Custom Tech Seed Catalog**: Seed laptops, desktops, components, and accessories with `npm run seed`.
- **Flexible PostgreSQL Storage**: Supports local PostgreSQL, Supabase, Neon, or Railway.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.template .env
```
Ensure `DATABASE_URL` is set to an active PostgreSQL database.

### 3. Seed the Store
```bash
npm run seed
```

### 4. Start the Development Server
```bash
npm run dev
```

The server will start at `http://localhost:9000` with the Admin Dashboard at `http://localhost:9000/app`.

---

## 📄 License & Attribution
- Custom business logic & branding: **Copyright (c) 2026 MAIJRUN Tech**.
- Core engine licensed under MIT (see `LICENSE`).
