# Tasks: Phase 11 — Luxury UI/UX Revamp, Advanced PDP & Hyperlocal Checkout

## Phase 1: Typography, Global Styles & Luxury Design System
- [x] T001: Configure Montserrat and Heebo fonts in `storefront/src/app/layout.tsx` and map them in `tailwind.config.js`.
- [x] T002: Add luxury glassmorphic, glow-border, and sleek tech card utility classes to `storefront/src/styles/globals.css`.

## Phase 2: Navigation, Live Search Drawer & Mobile Bottom App Bar
- [x] T003: Implement `LiveSearchModal.tsx` in `storefront/src/modules/layout/components/` with instant search autocomplete, trending queries, product thumbnails, and BDT prices.
- [x] T004: Enhance `Nav` template with modern sticky header, instant search trigger, mega-menu, and cart drawer badge.
- [x] T005: Create `MobileBottomNav.tsx` with fixed bottom navigation for mobile viewports (Home, Categories, PC Builder, Compare, Cart, Account).

## Phase 3: Advanced Product Detail Page (PDP) Experience
- [x] T006: Create `ColorSwatchSelector.tsx` for interactive circular color chips with hex values and live variant selection.
- [x] T007: Implement `WarrantyBadgeBox.tsx` displaying official brand warranty, authentic product guarantee, and box preservation requirement.
- [x] T008: Implement `EmiCalculatorModal.tsx` with interactive tabbed EMI calculations (3, 6, 9, 12, 18, 24, 36 months) across Bangladeshi partner banks.
- [x] T009: Implement `RequestOrderModal.tsx` allowing customers to submit backorder/pre-order requests with mobile number and notes.
- [x] T010: Create `CategorizedSpecs.tsx` for grouped, collapsible hardware specifications (Processor, Display, Memory, Ports, Battery, Warranty).
- [x] T011: Integrate all PDP enhancements into `storefront/src/modules/products/templates/index.tsx`.

## Phase 4: Hyperlocal Bangladesh Delivery Hierarchy
- [x] T012: Create `storefront/src/lib/data/bd-geo.ts` containing all 64 Bangladesh districts mapped to their respective Thanas/Upazilas.
- [x] T013: Enhance checkout shipping address form with cascading District -> Thana dropdowns and dynamic delivery charge computation.

## Phase 5: Professional Tech Catalog Expansion & Realistic Hardware Seeding
- [x] T014: Expand `backend/src/scripts/seed.ts` with 20+ realistic flagship hardware products across Laptops, Phones, Desktops, Audio, and Monitors with real specs, warranty terms, and color swatches.
- [x] T015: Ensure fallback / static catalog data in storefront renders the expanded luxury collection with high-res hardware images and zero demo tags.

## Phase 6: Verification & Brand Scrubbing
- [x] T016: Run automated brand verification script to guarantee 0 instances of external retailer names.
- [x] T017: Run `npm run build` in storefront to verify type safety, zero layout shifts, and clean production build.
