# Tasks: 001 - MAIJRUN Tech Foundation & White-Labeling

## Phase 1: Setup & Project Initialization
- [x] T001 Clone official Medusa starter into `backend/` using shallow clone (`--depth 1`)
- [x] T002 Clone official Next.js storefront starter into `storefront/` using shallow clone (`--depth 1`)
- [x] T003 Scrub all upstream `.git` directories and initialize fresh unified Git repository in repo root
- [x] T004 Create root `.gitignore` to protect all `.env`, `.env.local`, and `node_modules`

## Phase 2: Complete White-Labeling & Scrubbing (User Story 1)
- [x] T005 [P] [US1] Update `backend/package.json` with MAIJRUN metadata and project name
- [x] T006 [P] [US1] Update `storefront/package.json` with MAIJRUN metadata and project name
- [x] T007 [US1] Replace storefront title, meta descriptions, and OpenGraph tags in `storefront/src/app/layout.tsx`
- [x] T008 [P] [US1] Replace default logo and brand texts in `storefront/src/modules/layout/templates/nav/index.tsx`
- [x] T009 [P] [US1] Replace footer copyright and remove third-party links in `storefront/src/modules/layout/templates/footer/index.tsx`
- [x] T010 [US1] Create SVG logo and favicon suite for MAIJRUN Tech in `storefront/public/`

## Phase 3: Tech Theme & Laptop/Desktop UI (User Story 2)
- [x] T011 [US2] Configure Tailwind colors and theme support in `storefront/tailwind.config.js`
- [x] T012 [US2] Create reusable Technical Specification Table component in `storefront/src/modules/products/components/technical-specs/index.tsx`
- [x] T013 [US2] Integrate Tech Spec Table into Product Detail Page in `storefront/src/modules/products/templates/index.tsx`
- [x] T014 [US2] Add Warranty Badge and In-Stock indicators to product card in `storefront/src/modules/products/components/product-preview/index.tsx`

## Phase 4: Faceted Tech Filtering (User Story 3)
- [x] T015 [US3] Create Brand and Processor filter components with dynamic real-time facets and URL params
- [x] T016 [US3] Add price range filter slider and BDT numerical inputs for budget/gaming laptops with mobile drawer and active chips

## Phase 5: Cart, Shipping & Local Payment (User Story 4)
- [x] T017 [US4] Configure Cash on Delivery (COD) payment option with pending status and order confirmation
- [x] T018 [US4] Configure Bangladesh shipping matrix (Inside Dhaka ৳80 vs. Outside Dhaka ৳150) and 64-district selector with phone validation

## Phase 6: Verification & Quality Audit
- [x] T019 Run `/speckit-analyze` to verify artifact consistency and cross-coverage
- [x] T020 Run TypeScript compilation check on storefront (`npm run build`)
- [x] T021 Execute clean Git checkpoint and phase commits across all phases
