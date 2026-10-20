# Technical Implementation Plan: 001 - MAIJRUN Tech Foundation

## 1. Architecture Overview

```text
/home/mahmud-hasan/Naims Project/Maijrun Store/
├── .specify/
│   ├── memory/constitution.md
│   └── feature.json
├── specs/001-maijrun-tech-foundation/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── backend/                       # MedusaJS v2 Core E-Commerce & Admin API
│   ├── medusa-config.js
│   ├── src/
│   └── package.json (Name: "maijrun-backend")
└── storefront/                    # Next.js 14/15 High-Performance Storefront
    ├── app/                       # App Router Pages & Layouts
    ├── components/                # Tech Components (SpecTable, TechFilter, Header)
    ├── public/                    # MAIJRUN Brand Assets & Favicons
    └── package.json (Name: "maijrun-storefront")
```

---

## 2. White-Labeling & Scrubbing Protocol
1. **Clone & Detach**:
   - Clone official starters without preserving remote history (`--depth 1`).
   - Remove existing `.git` folders in both sub-projects.
   - Initialize unified Git root at `/home/mahmud-hasan/Naims Project/Maijrun Store`.
2. **Global String Replacement & Metadata Update**:
   - Replace title strings, descriptions, and URLs with `MAIJRUN Tech`.
   - Update `package.json` names to `maijrun-backend` and `maijrun-storefront`.
   - Clear upstream demo README files with MAIJRUN project documentation.
3. **Visual Brand Injection**:
   - Generate sleek SVG logo for `MAIJRUN Tech` (circuit/hexagonal tech motif with electric cyan accent).
   - Inject favicon set (`favicon.ico`, `apple-touch-icon.png`).
   - Update Tailwind color tokens (`brand-slate: #0b0f19`, `brand-cyan: #06b6d4`).

---

## 3. Tech Specs & Data Modeling
Laptop and Desktop products require structured metadata:
```json
{
  "brand": "Asus",
  "category": "Gaming Laptop",
  "specs": {
    "processor": "Intel Core i7-14700HX (14th Gen)",
    "ram": "16GB DDR5 5600MHz",
    "storage": "1TB PCIe Gen4 NVMe M.2 SSD",
    "gpu": "NVIDIA GeForce RTX 4060 8GB GDDR6",
    "display": "16\" QHD+ (2560 x 1600) 165Hz IPS",
    "battery": "90WHr 4-cell Li-ion",
    "os": "Windows 11 Home Genuine",
    "warranty": "2 Years Official Warranty"
  }
}
```

---

## 4. Payment & Checkout Strategy
- **Payment Providers**:
  - Cash on Delivery (COD) enabled as standard payment provider.
  - Manual bKash/Nagad checkout instructions (Send Money / Merchant Payment number with Transaction ID field).
- **Shipping**:
  - Inside Dhaka: 80 BDT / 24-48 Hours.
  - Outside Dhaka: 150 BDT / 48-72 Hours.

---

## 5. Verification & Security Strategy
- Run `npm run build` on storefront to verify zero TypeScript errors.
- Run Strix audit to confirm zero exposed credentials or dangerous endpoints.
