"use client"

import React from "react"
import {
  Package,
  Zap,
  ShieldCheck,
  FileText,
  Cable,
  CheckCircle,
  Sparkles,
} from "lucide-react"

interface InTheBoxProps {
  productTitle?: string
  categoryName?: string
  className?: string
}

interface BoxItem {
  name: string
  detail: string
  icon: React.ElementType
}

export default function InTheBox({
  productTitle = "",
  categoryName = "",
  className = "",
}: InTheBoxProps) {
  const titleLower = productTitle.toLowerCase()
  const catLower = categoryName.toLowerCase()

  let items: BoxItem[] = []

  if (
    titleLower.includes("macbook") ||
    titleLower.includes("laptop") ||
    titleLower.includes("zephyrus") ||
    titleLower.includes("legion") ||
    titleLower.includes("thinkpad") ||
    catLower.includes("laptop")
  ) {
    items = [
      {
        name: "Main Laptop Chassis",
        detail: "Factory sealed with original protective film",
        icon: Package,
      },
      {
        name: "High-Wattage GaN Fast Charger",
        detail: "Official 70W / 140W / 240W Power Adapter",
        icon: Zap,
      },
      {
        name: "Braided Power Cable",
        detail: "USB-C to MagSafe 3 / Dual USB-C 2M Cable",
        icon: Cable,
      },
      {
        name: "Official Brand Warranty Card",
        detail: "Authorized Bangladesh Service Center serial pass",
        icon: ShieldCheck,
      },
      {
        name: "Documentation & Polish Cloth",
        detail: "Quick start guide, safety compliance & microfiber cloth",
        icon: FileText,
      },
    ]
  } else if (
    titleLower.includes("iphone") ||
    titleLower.includes("pixel") ||
    titleLower.includes("galaxy") ||
    titleLower.includes("fold") ||
    titleLower.includes("oneplus") ||
    titleLower.includes("xiaomi") ||
    catLower.includes("phone")
  ) {
    items = [
      {
        name: "Flagship Smartphone",
        detail: "Brand-new factory sealed handset with IMEI sticker",
        icon: Package,
      },
      {
        name: "Fast Charging Cable",
        detail: "Braided USB-C to USB-C 100W PD Cable",
        icon: Cable,
      },
      {
        name: "SIM Ejector Tool & Case",
        detail: "Precision pin tool & protective bumper (where applicable)",
        icon: Zap,
      },
      {
        name: "Official Brand Warranty Slip",
        detail: "Global 1-year authorized warranty document",
        icon: ShieldCheck,
      },
    ]
  } else if (
    titleLower.includes("headphone") ||
    titleLower.includes("airpods") ||
    titleLower.includes("sony") ||
    titleLower.includes("bose") ||
    titleLower.includes("earbuds") ||
    catLower.includes("audio")
  ) {
    items = [
      {
        name: "Audio Hardware Unit",
        detail: "Precision-tuned drivers with active noise cancelation",
        icon: Package,
      },
      {
        name: "Smart Hard Travel Case",
        detail: "Magnetic battery/standby protective carrying case",
        icon: Sparkles,
      },
      {
        name: "Braided Audio & Charge Cables",
        detail: "USB-C fast charging cable & gold-plated 3.5mm jack",
        icon: Cable,
      },
      {
        name: "Official Brand Warranty & Pass",
        detail: "Authenticity certificate & warranty card",
        icon: ShieldCheck,
      },
    ]
  } else if (
    titleLower.includes("watch") ||
    catLower.includes("wearable") ||
    catLower.includes("accessories")
  ) {
    items = [
      {
        name: "Main Device / Smartwatch",
        detail: "Grade 5 Titanium / Stainless casing with sapphire glass",
        icon: Package,
      },
      {
        name: "Official Strap / Band",
        detail: "Trail Loop / Ocean Band / Precision tactile strap",
        icon: Sparkles,
      },
      {
        name: "Fast Magnetic Charger",
        detail: "Braided USB-C magnetic fast charging puck",
        icon: Cable,
      },
      {
        name: "Official Warranty & Compliance Pass",
        detail: "1 Year Official Brand Warranty certificate",
        icon: ShieldCheck,
      },
    ]
  } else if (
    titleLower.includes("monitor") ||
    titleLower.includes("ultragear") ||
    titleLower.includes("swift") ||
    catLower.includes("display")
  ) {
    items = [
      {
        name: "OLED Display Panel",
        detail: "Anti-glare low-reflection 240Hz OLED screen",
        icon: Package,
      },
      {
        name: "Heavy-Duty Ergonomic Stand",
        detail: "Height, tilt, swivel & pivot adjustable metal base",
        icon: Sparkles,
      },
      {
        name: "DisplayPort 2.1 & HDMI 2.1 Cables",
        detail: "Ultra High Speed 48Gbps certified cables included",
        icon: Cable,
      },
      {
        name: "Factory Calibration Report",
        detail: "Delta E < 2 color accuracy audit sheet & 3Y warranty",
        icon: ShieldCheck,
      },
    ]
  } else {
    // Desktop / Custom PC / Default
    items = [
      {
        name: "Fully Assembled Battlestation",
        detail: "Custom built, thermal-pasted & stress-tested hardware",
        icon: Package,
      },
      {
        name: "High-Gain Wi-Fi 7 Magnetic Antenna",
        detail: "Dual-band directional desktop antenna included",
        icon: Zap,
      },
      {
        name: "Heavy-Duty Modular Power Cables",
        detail: "Full modular PSU bag & 16A grounded power cord",
        icon: Cable,
      },
      {
        name: "Official 3-Year Warranty & Stress Test Pass",
        detail: "3DMark & Cinebench 24-hour thermal stability certificate",
        icon: ShieldCheck,
      },
    ]
  }

  return (
    <section
      aria-labelledby="in-the-box-heading"
      className={`w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl p-6 sm:p-8 my-8 ${className}`}
      data-testid="in-the-box-section"
    >
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3
            id="in-the-box-heading"
            className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2"
          >
            <span>What&apos;s in the Box</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              100% Sealed
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified original manufacturer packaging and bundled accessories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const IconComponent = item.icon
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-cyan-500/40 hover:bg-slate-950/80 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.detail}
              </p>
            </div>
          )
        })}
      </div>

      {/* Tamper Seal & Authenticity Guarantee Note */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Factory Sealed Authenticity:</strong> All items include intact tamper-evident manufacturer tape and matching IMEI/Serial numbers.
          </span>
        </div>
        <div className="text-[11px] text-cyan-400 font-medium">
          64-District Safe Delivery Insured
        </div>
      </div>
    </section>
  )
}
