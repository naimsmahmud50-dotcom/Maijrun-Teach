# Feature Specification: Phase 11 — Luxury UI/UX Revamp, Advanced PDP & Hyperlocal Checkout

## 1. Overview & Objectives
Phase 11 transforms MAIJRUN Tech into an elite, world-class enterprise tech e-commerce platform inspired by the clean, luxury app-like design patterns of premier tech retailers, while maintaining 100% authentic MAIJRUN Tech branding:
- **Luxury Frontend UI/UX Revamp**: Modern typography (Heebo/Montserrat styling), sticky header with instant search autocomplete modal/drawer, category mega-menu, touch-optimized mobile bottom app bar, and polished product card grids.
- **Advanced Product Detail Page (PDP)**:
  - Interactive Color Swatch selector with real color hex chips (e.g. Titanium Gray, Midnight Cyan, Phantom Black) that update images and SKU state dynamically.
  - Official Bangladesh Brand Warranty & Trust Card with box retention guidelines and warranty duration badge.
  - Bank EMI Calculator Widget showing 3, 6, 9, 12, 18, 24, 36 months installment breakdowns across major Bangladeshi banks (City Bank, BRAC, Eastern Bank, Standard Chartered, DBBL).
  - Pre-Order / "Request Order" workflow modal for high-demand or upcoming tech items.
  - Structured Technical Specifications Accordion with grouped categories (Basic Info, Display, Performance, Ports, Warranty).
- **Hyperlocal Checkout Hierarchy**: Full Bangladesh geographic hierarchy (Districts -> Thanas/Upazilas) with dynamic courier shipping charge calculation (Inside Dhaka ৳80, Dhaka Suburbs ৳100, Outside Dhaka ৳150) and estimated delivery windows.
- **Expanded Professional Tech Catalog**: Expand the catalog beyond simple demo items into a realistic collection of flagship tech products (MacBooks, ROG Zephyrus, ThinkPad, Galaxy Ultra, Custom RTX Desktops, High-End Audio & Displays) with real tech specs, multiple color swatches, high-res hardware images, and zero placeholder tags.
- **Strict Brand Integrity & Scrubbing**: 100% white-labeled MAIJRUN Tech aesthetic; no third-party vendor names or external shop trademarks in metadata or UI.

---

## 2. User Stories & Acceptance Criteria

### US1: Elite Header, Navigation & Instant Live Search (P1)
- **As a** customer visiting MAIJRUN Tech,
- **I want to** navigate smoothly with a sticky header, interactive search drawer with live results, and mobile bottom navigation,
- **So that** I enjoy a fast, app-like, luxury shopping experience.
- **Acceptance Criteria**:
  1. Sticky navigation header with brand logo, category mega-menu dropdowns, live search bar, comparison counter, and mini-cart drawer.
  2. Live Search opens an autocomplete popover/drawer showing recent searches, trending hardware tags, and instant matching products with thumbnails and prices.
  3. Mobile view includes a fixed bottom navigation bar (Home, Categories, PC Builder, Compare, Cart, Account).
  4. Luxury tech typography using refined Google Fonts (Montserrat & Heebo/Inter styling) with dark slate and neon cyan accents.

### US2: Advanced Product Detail Page (PDP) Experience (P1)
- **As a** tech buyer inspecting a laptop, phone, or component,
- **I want to** choose color variants, calculate monthly EMI, view official warranty terms, and request backorders,
- **So that** I have complete confidence and flexibility before purchasing.
- **Acceptance Criteria**:
  1. Color Swatch Selector: Displays rounded color chips with exact hex codes (e.g. `#1A1A1A`, `#E5725B`, `#2A4365`), updating the active variant, price, and gallery photos.
  2. Official Brand Warranty Box: Displays official duration (e.g., 2 Years Brand Warranty), box retention requirement notice, and verified authenticity badge.
  3. Bank EMI Calculator Modal/Widget: Shows monthly breakdown table for 0% and low-interest EMI across BD credit cards (3 to 36 months).
  4. "Request Order / Pre-Order": Allows customers to submit their phone number and notes when an item is marked as upcoming or out of stock.
  5. Categorized Specifications Table: Clean tabular layout categorized into sections (General, Processor/Chipset, Memory/Storage, Display, Battery/Power, Warranty).

### US3: Hyperlocal Bangladesh Delivery Hierarchy (P1)
- **As a** customer checking out an order,
- **I want to** select my District and specific Thana/Upazila from a cascading dropdown,
- **So that** the exact courier fee and delivery timeline are automatically and transparently applied.
- **Acceptance Criteria**:
  1. District dropdown covering 64 districts of Bangladesh.
  2. Dynamic Thana/Upazila dropdown populated based on the selected District.
  3. Automatic shipping charge updates: Inside Dhaka (৳80, 24-48 hrs), Dhaka Suburbs / Narayanganj / Gazipur (৳100, 24-72 hrs), Outside Dhaka (৳150, 2-4 days).
  4. Real-time subtotal, shipping fee, and grand total updates on the checkout overview.

### US4: Professional Tech Catalog Expansion (P1)
- **As a** client or user evaluating the store,
- **I want to** see a wide, realistic, high-end tech inventory across Laptops, Smartphones, Desktops, Audio, and Accessories,
- **So that** the store feels established, full, and ready for commercial use.
- **Acceptance Criteria**:
  1. At least 18-24 realistic tech products across all major categories.
  2. High-quality hardware imagery (transparent PNGs / clean WebP product shots).
  3. No "[Demo]" strings, placeholder t-shirts, or incomplete specs in the catalog.
  4. Full metadata including warranty duration, color variants with hex codes, and compatibility parameters for the PC Builder.

### US5: 100% MAIJRUN Tech Branding & Zero Upstream Traces (P1)
- **As the** project owner,
- **I want to** ensure all copy, metadata, footer links, and legal disclaimers belong exclusively to MAIJRUN Tech,
- **So that** no external retailer names or trademarks appear anywhere on the site.
- **Acceptance Criteria**:
  1. All pages feature MAIJRUN Tech logo, copyright, and brand identity.
  2. Zero instances of third-party retailer names or trademarks.
