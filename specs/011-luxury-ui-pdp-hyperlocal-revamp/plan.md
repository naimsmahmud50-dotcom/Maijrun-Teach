# Implementation Plan: Phase 11 — Luxury UI/UX Revamp, Advanced PDP & Hyperlocal Checkout

## 1. Technical Architecture & File Roadmap

### Frontend Components to Enhance & Create:
1. **Typography & Styling (`storefront/src/app/layout.tsx`, `tailwind.config.js`, `storefront/src/styles/globals.css`)**:
   - Inject Montserrat and Heebo font variables via `next/font/google`.
   - Configure luxury glassmorphic card utilities, glow borders, and clean tech accents.
2. **Elite Sticky Header & Navigation (`storefront/src/modules/layout/templates/nav/`)**:
   - Live Search Drawer/Modal (`LiveSearchModal.tsx`): Instant auto-suggest with product thumbnails, BDT prices, and quick category pills.
   - Tech Mega Menu (`MegaMenu.tsx`): Multi-level drop-down with featured hardware showcases.
   - Mobile Bottom App Bar (`MobileBottomNav.tsx`): Fixed bottom bar with icons for Home, Categories, PC Builder, Compare, Cart (with badge), and Account.
3. **Advanced Product Detail Page (PDP) (`storefront/src/modules/products/components/`)**:
   - `ColorSwatchSelector.tsx`: Interactive circular color swatches with hex colors, variant label, and image sync.
   - `WarrantyBadgeBox.tsx`: Official Brand Warranty card with box preservation reminder & trust badges.
   - `EmiCalculatorModal.tsx`: Tabbed EMI breakdown (3, 6, 9, 12, 18, 24, 36 months) with monthly payment calculations.
   - `RequestOrderModal.tsx`: Pre-order / backorder submission popup with customer phone and notes.
   - `CategorizedSpecs.tsx`: Grouped technical specifications accordion/table (`Basic Info`, `Performance`, `Display`, `Battery & Ports`, `Warranty`).
4. **Hyperlocal Bangladesh Delivery Matrix (`storefront/src/modules/checkout/components/shipping-address/`)**:
   - Comprehensive Bangladesh Geo Data (`bd-geo.ts`): All 64 Districts and their respective Thanas/Upazilas.
   - Cascading dropdowns: Selecting District automatically filters Thanas.
   - Dynamic Shipping Logic: Automatically sets delivery fee (৳80 Inside Dhaka, ৳100 Dhaka Suburbs, ৳150 Outside Dhaka) and delivery timeframe.
5. **Rich Product Catalog Expansion (`backend/src/scripts/seed.ts` & Seed Runner)**:
   - Expand catalog with 20+ realistic flagship hardware products across Laptops, Smartphones, Desktops, Audio, and Monitors.
   - High-quality transparent PNG / WebP hardware images (MacBook M3 Max, ROG Strix Scar 18, Galaxy S25 Ultra, iPhone 16 Pro Max, Sony WH-1000XM5, Keychron Mechanical Keyboard, LG UltraGear OLED, etc.).
   - Full technical specs, warranty parameters, and real color swatches for each product.

---

## 2. Dependencies & Packages
- Fonts: `next/font/google` (Montserrat, Heebo) — already built into Next.js.
- Icons: `@medusajs/icons` and `lucide-react` — already installed.
- UI: Tailwind CSS with custom utility classes.

---

## 3. Brand & Anti-Plagiarism Guardrails
- **100% MAIJRUN Tech Branding**: Title, logo, copyright, terms, and metadata must strictly bear MAIJRUN Tech.
- **Scrubbing**: Zero occurrences of external retailer names or trademarks.
- **Originality**: All promotional banners, feature copy, warranty policies, and UI elements will be custom-tailored for MAIJRUN Tech.
