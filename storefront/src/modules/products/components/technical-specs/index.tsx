import React from "react"
import { parseProductSpecs } from "@lib/specs"
import { Cpu, Monitor, HardDrive, BatteryCharging, Shield, Info } from "lucide-react"

export type TechnicalSpecsProps = {
  metadata?: Record<string, unknown> | null
  title?: string
  className?: string
}

export default function TechnicalSpecs({
  metadata,
  title = "Technical Specifications",
  className = "",
}: TechnicalSpecsProps) {
  const specs = parseProductSpecs(metadata)

  if (!specs) {
    return null
  }

  const specGroups = [
    {
      title: "Processor & Graphics",
      icon: Cpu,
      items: [
        { label: "Processor", value: specs.processor },
        { label: "Processor Family", value: specs.processorFamily },
        { label: "Graphics (GPU)", value: specs.gpu },
      ].filter((i) => i.value),
    },
    {
      title: "Memory & Storage",
      icon: HardDrive,
      items: [
        { label: "Installed RAM", value: specs.ram },
        { label: "Solid State Storage", value: specs.storage },
      ].filter((i) => i.value),
    },
    {
      title: "Display & Audio",
      icon: Monitor,
      items: [
        { label: "Display Specifications", value: specs.display },
      ].filter((i) => i.value),
    },
    {
      title: "Battery & Connectivity",
      icon: BatteryCharging,
      items: [
        { label: "Battery & Charger", value: specs.battery },
        { label: "Interface Ports", value: specs.ports },
      ].filter((i) => i.value),
    },
    {
      title: "General & Dimensions",
      icon: Info,
      items: [
        { label: "Manufacturer Brand", value: specs.brand },
        { label: "Operating System", value: specs.os },
        { label: "Product Weight", value: specs.weight },
      ].filter((i) => i.value),
    },
    {
      title: "Official Warranty & Support",
      icon: Shield,
      items: [
        { label: "Warranty Duration", value: specs.warranty || "2 Years Official Brand Warranty" },
        { label: "Packaging Condition", value: "Original Box Preservation Required for Warranty Claim" },
      ].filter((i) => i.value),
    },
  ].filter((group) => group.items.length > 0)

  if (specGroups.length === 0) return null

  return (
    <section
      aria-labelledby="tech-specs-heading"
      className={`w-full rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl p-6 sm:p-8 my-8 ${className}`}
      data-testid="tech-specs-section"
    >
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3
            id="tech-specs-heading"
            className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight"
          >
            {title}
          </h3>
          <p className="text-xs text-slate-400">
            Categorized hardware architecture, memory & system capabilities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specGroups.map((group) => {
          const GroupIcon = group.icon
          return (
            <div
              key={group.title}
              className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
                <GroupIcon className="w-4 h-4" />
                <span>{group.title}</span>
              </div>
              <dl className="space-y-2.5">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between py-1 text-left text-xs"
                  >
                    <dt className="text-slate-400 font-medium sm:w-2/5 pr-2">
                      {item.label}
                    </dt>
                    <dd className="font-semibold text-slate-100 sm:w-3/5 mt-0.5 sm:mt-0 break-words">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </section>
  )
}
