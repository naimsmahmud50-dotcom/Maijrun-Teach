# MAIJRUN Tech Constitution & Engineering Principles

## 1. Project Overview & Identity
- **Brand Name**: MAIJRUN Tech (MAIJRUN Store)
- **Tagline**: Next-Gen Tech Destination (Laptops, Desktops, Components, Accessories)
- **Aesthetic**: Premium high-tech, minimalist luxury (Slate Black with Neon Cyan / Electric Blue accents)
- **Ownership**: 100% white-labeled, self-hosted, zero third-party template branding.

## 2. Core Architecture Standards
- **Backend & Admin**: MedusaJS v2 (Node.js/TypeScript, PostgreSQL). Modular e-commerce engine with dedicated admin dashboard.
- **Storefront**: Next.js 14/15 App Router, React Server Components (RSC), Tailwind CSS.
- **Database**: PostgreSQL (local or managed cloud DB).
- **Payment & Shipping**: Cash on Delivery (COD) + local gateways (bKash/Nagad/Cards) with Bangladesh 64-district delivery matrix.

## 3. White-Labeling & Scrubbing Mandates (Non-Negotiable)
1. **Zero Upstream Artifacts**: No mentions of template authors, default demo logos, powered-by tags, or upstream GitHub links in customer-facing UI or production metadata.
2. **Fresh Git History**: Upstream `.git` histories must be completely scrubbed and re-initialized with an initial MAIJRUN commit.
3. **Clean Metadata**: `package.json`, site headers, OpenGraph meta-tags, and favicons must strictly reflect MAIJRUN.
4. **Security & Secrets**: Never commit `.env` or payment credentials to Git. Use `.env.local` with `.gitignore`.

## 4. Spec-Driven Development (SDD) Workflow
- Every enhancement or feature must be formally defined in `specs/<feature>/spec.md`.
- Technical implementation plan must be documented in `specs/<feature>/plan.md`.
- Tasks must follow checklist formatting in `specs/<feature>/tasks.md`.
- No code merges or production claims without automated verification.
