import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | MAIJRUN Tech",
  description:
    "Terms of Service governing hardware purchases, warranty coverage, deliveries, and pricing at MAIJRUN Tech Bangladesh.",
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
            Terms & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Effective Date: October 2026 • Governed under the laws of Bangladesh
          </p>
        </div>

        {/* 1. Agreement */}
        <section className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-xl font-bold text-cyan-300">1. Agreement to Terms</h2>
          <p className="text-sm">
            By accessing or ordering from MAIJRUN Tech, you agree to be bound by these Terms of Service.
            All products listed on our platform are 100% authentic, brand-new retail units with official manufacturer warranty.
          </p>
        </section>

        {/* 2. Pricing and Currency */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">2. Pricing, Stock & Currency</h2>
          <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            <p>
              • All prices are quoted in <strong className="text-white">Bangladeshi Taka (BDT)</strong> and include applicable local VAT unless explicitly stated otherwise.
            </p>
            <p>
              • While we strive for absolute accuracy, computer hardware market prices in Bangladesh may fluctuate due to global distributor adjustments and exchange rates. In the rare event of a pricing error or sudden out-of-stock situation, MAIJRUN Tech reserves the right to notify the customer and cancel or adjust the affected order before dispatch.
            </p>
          </div>
        </section>

        {/* 3. Delivery and Courier Terms */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">3. Delivery & Courier Handover</h2>
          <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            <p>
              • Inside Dhaka deliveries are completed within 24 to 48 hours. Outside Dhaka deliveries are fulfilled within 2 to 4 business days via Steadfast or Pathao courier networks.
            </p>
            <p>
              • Customers are advised to inspect the parcel packaging before accepting delivery and signing the courier receipt. For Cash on Delivery (COD), payment must be handed over to the courier representative before opening sealed retail boxes.
            </p>
          </div>
        </section>

        {/* 4. Official Warranty */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">4. Official Hardware Warranty Policy</h2>
          <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            <p>
              • All products carry official brand warranty (e.g., 3 Years for CPUs/Motherboards, 2 Years for GPUs, Lifetime for RAM as specified on product pages).
            </p>
            <p>
              • Physical damage, burn marks, liquid spill, or broken pins void manufacturer warranty according to Bangladesh IT market standards.
            </p>
          </div>
        </section>

        {/* 5. Contact */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="font-bold text-white text-base">Corporate Office & Customer Support</h3>
          <p className="text-sm text-slate-400">
            MAIJRUN Tech, IDB Bhaban / Multiplan Center, Dhaka, Bangladesh.<br />
            Email: <strong className="text-cyan-400">support@maijrun.com</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
