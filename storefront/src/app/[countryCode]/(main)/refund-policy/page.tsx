import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Return & Refund Policy | MAIJRUN Tech",
  description:
    "7-day replacement warranty and refund terms at MAIJRUN Tech. Full compliance with Bangladesh Consumer Rights Protection Act.",
}

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
            Customer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4">
            Return & Refund Policy
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            7-Day Replacement Guarantee • Fair & Transparent Returns
          </p>
        </div>

        {/* 1. 7-Day Replacement Guarantee */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">1. 7-Day Replacement Guarantee (DOA)</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            If any hardware component received is Dead on Arrival (DOA) or exhibits a manufacturing defect within <strong className="text-white">7 days</strong> of delivery, MAIJRUN Tech will replace the product immediately with an identical brand-new unit upon technical verification.
          </p>
        </section>

        {/* 2. Eligibility for Returns */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">2. Eligibility Conditions for Return</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
            <li>The original product packaging, box, warranty stickers, manuals, and accessories must be intact.</li>
            <li>Original purchase invoice / order receipt must be provided.</li>
            <li>No signs of physical damage, broken ports, burned ICs, or customer mishandling.</li>
            <li>For custom PC builds, our technical team will bench-test the specific malfunctioning component.</li>
          </ul>
        </section>

        {/* 3. Refund Timeline & Processing */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">3. Refund Processing & Timelines</h2>
          <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            <p>
              • If an identical replacement unit is unavailable, the customer is entitled to an immediate 100% full refund.
            </p>
            <p>
              • <strong className="text-white">bKash / Nagad:</strong> Refunds are processed directly back to the originating mobile wallet within 24 to 48 hours of verification.
            </p>
            <p>
              • <strong className="text-white">SSLCommerz (Credit / Debit Card):</strong> Card refunds are initiated within 3 business days; bank posting takes 5–10 business days depending on the issuing bank.
            </p>
            <p>
              • <strong className="text-white">Cash on Delivery (COD):</strong> For returned COD orders, refunds are dispatched via bKash or bank transfer upon warehouse product receipt.
            </p>
          </div>
        </section>

        {/* 4. RMA Process */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-base">How to Initiate a Return or RMA Claim</h3>
          <p className="text-sm text-slate-400">
            1. Call our RMA Helpdesk: <strong className="text-slate-200">+880 9612-MAIJRUN</strong> (10 AM - 8 PM)<br />
            2. Email pictures/video of the issue along with your Order ID to <strong className="text-cyan-400">rma@maijrun.com</strong><br />
            3. Our courier will arrange doorstep pickup or you may drop off at any authorized service hub.
          </p>
        </section>
      </div>
    </div>
  )
}
