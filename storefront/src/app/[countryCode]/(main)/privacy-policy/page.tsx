import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | MAIJRUN Tech",
  description:
    "Privacy Policy for MAIJRUN Tech. Learn how we handle your personal information, phone OTP authentication, and data protection in Bangladesh.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last Updated: October 2026 • Compliant with Digital Commerce Guidelines 2021 (Bangladesh)
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong className="text-white">MAIJRUN Tech</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
            We respect your privacy and are committed to protecting your personal data when you visit our storefront,
            use our Custom PC Builder tool, purchase genuine IT hardware, or authenticate with your mobile number.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">1. Information We Collect</h2>
          <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            <p>
              • <strong className="text-white">Account Information:</strong> Bangladesh mobile number (+8801XXXXXXXXX) used for passwordless OTP authentication, customer name, and optional email address.
            </p>
            <p>
              • <strong className="text-white">Shipping & Delivery Details:</strong> Recipient name, full delivery address, division, district, and contact telephone number for order dispatch via authorized couriers (Steadfast / Pathao).
            </p>
            <p>
              • <strong className="text-white">Order & Hardware Preferences:</strong> Saved PC builds from our PC Builder tool, comparison lists, items placed in cart, and purchase receipts.
            </p>
            <p>
              • <strong className="text-white">Payment Data:</strong> All online payments (bKash, Nagad, SSLCommerz) are processed securely through certified gateway redirections. We never store credit card numbers or PINs on our servers.
            </p>
          </div>
        </section>

        {/* 2. How We Use Your Data */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
            <li>To process, fulfill, and ship your hardware orders across all 64 districts in Bangladesh.</li>
            <li>To send one-time authentication codes (OTP) and real-time live SMS/email parcel tracking links.</li>
            <li>To provide hardware warranty claim records and official tax invoices.</li>
            <li>To prevent fraud, automated abuse, and credential stuffing using Cloudflare security protections.</li>
          </ul>
        </section>

        {/* 3. Data Sharing & Third Parties */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300">3. Third-Party Service Providers</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We share necessary operational data only with trusted partners strictly required for order fulfillment:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
            <li><strong className="text-white">Couriers:</strong> Steadfast Courier and Pathao Courier for parcel delivery and cash collection.</li>
            <li><strong className="text-white">Payment Gateways:</strong> bKash Limited, Nagad (Postal Department), and SSLCommerz.</li>
            <li><strong className="text-white">SMS Gateways:</strong> Certified Bangladesh SMS gateways for transactional OTPs only.</li>
          </ul>
        </section>

        {/* 4. Contact Us */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="font-bold text-white text-base">Questions Regarding Privacy?</h3>
          <p className="text-sm text-slate-400">
            Reach our data protection officer at: <strong className="text-cyan-400">privacy@maijrun.com</strong> or call our hotline at <strong className="text-slate-200">+880 9612-MAIJRUN</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
