import React from "react"
import { parseProductSpecs, getVisibleSpecRows } from "@lib/specs"

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
  const rows = getVisibleSpecRows(specs)

  if (!specs || rows.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="tech-specs-heading"
      className={`w-full rounded-2xl border border-ui-border-base bg-white dark:bg-slate-900/60 shadow-sm p-6 sm:p-8 my-8 ${className}`}
      data-testid="tech-specs-section"
    >
      <div className="flex items-center gap-3 border-b border-ui-border-base pb-4 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <div>
          <h3
            id="tech-specs-heading"
            className="text-lg sm:text-xl font-bold text-ui-fg-base tracking-tight"
          >
            {title}
          </h3>
          <p className="text-xs text-ui-fg-subtle">
            Hardware architecture, memory & system capabilities
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-col sm:flex-row sm:items-baseline justify-between py-3 border-b border-ui-border-base/40 text-left"
            data-testid={`spec-row-${row.key}`}
          >
            <dt className="text-xs uppercase font-semibold tracking-wider text-ui-fg-muted sm:w-2/5 pr-2">
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-ui-fg-base sm:w-3/5 mt-0.5 sm:mt-0 break-words">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
