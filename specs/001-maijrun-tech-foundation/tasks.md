# Tasks: 001 - MAIJRUN Tech Foundation & White-Labeling

## Phase 1: Setup & Project Initialization
- [ ] T001 Clone official Medusa starter into `backend/` using shallow clone (`--depth 1`)
- [ ] T002 Clone official Next.js storefront starter into `storefront/` using shallow clone (`--depth 1`)
- [ ] T003 Scrub all upstream `.git` directories and initialize fresh unified Git repository in repo root
- [ ] T004 Create root `.gitignore` to protect all `.env`, `.env.local`, and `node_modules`

## Phase 2: Complete White-Labeling & Scrubbing (User Story 1)
- [ ] T005 [P] [US1] Update `backend/package.json` with MAIJRUN metadata and project name
- [ ] T006 [P] [US1] Update `storefront/package.json` with MAIJRUN metadata and project name
- [ ] T007 [US1] Replace storefront title, meta descriptions, and OpenGraph tags in `storefront/src/app/layout.tsx`
- [ ] T008 [P] [US1] Replace default logo and brand texts in `storefront/src/modules/layout/templates/nav/index.tsx`
- [ ] T009 [P] [US1] Replace footer copyright and remove third-party links in `storefront/src/modules/layout/templates/footer/index.tsx`
- [ ] T010 [US1] Create SVG logo and favicon suite for MAIJRUN Tech in `storefront/public/`

## Phase 3: Tech Theme & Laptop/Desktop UI (User Story 2)
- [ ] T011 [US2] Configure Tailwind colors (slate black `#0b0f19`, dark card `#111827`, electric cyan `#06b6d4`) in `storefront/tailwind.config.js`
- [ ] T012 [US2] Create reusable Technical Specification Table component in `storefront/src/modules/products/components/technical-specs/index.tsx`
- [ ] T013 [US2] Integrate Tech Spec Table into Product Detail Page in `storefront/src/modules/products/templates/index.tsx`
- [ ] T014 [US2] Add Warranty Badge and In-Stock indicators to product card in `storefront/src/modules/products/components/product-preview/index.tsx`

## Phase 4: Faceted Tech Filtering (User Story 3)
- [ ] T015 [US3] Create Brand and Processor filter buttons in `storefront/src/modules/store/components/refinement-list/sort-products/index.tsx`
- [ ] T016 [US3] Add price range filter slider for budget/gaming laptops

## Phase 5: Cart, Shipping & Local Payment (User Story 4)
- [ ] T017 [US4] Configure Cash on Delivery (COD) payment option in `storefront/src/modules/checkout/components/payment-wrapper/index.tsx`
- [ ] T018 [US4] Configure Bangladesh shipping matrix (Inside Dhaka vs. Outside Dhaka) in checkout steps

## Phase 6: Verification & Quality Audit
- [ ] T019 Run `/speckit-analyze` to verify artifact consistency and cross-coverage
- [ ] T020 Run TypeScript compilation check on storefront (`npm run build`)
- [ ] T021 Execute initial clean Git commit: `feat: Initial MAIJRUN Tech E-Commerce Platform`
