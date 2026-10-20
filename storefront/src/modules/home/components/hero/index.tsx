import { Button, Heading } from "@medusajs/ui"
import { brandConfig } from "@config/brand"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative min-h-[75vh] w-full border-b border-ui-border-base bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center overflow-hidden">
      {/* Background Tech Glow & Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 py-20 small:p-32 gap-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {brandConfig.name} • Official Tech Store
        </div>

        <Heading
          level="h1"
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight"
        >
          Next-Gen Laptops &amp; <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Custom Desktops
          </span>
        </Heading>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {brandConfig.description} Featuring the latest Intel, AMD, and NVIDIA hardware with guaranteed official warranty.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <LocalizedClientLink href="/store">
            <Button
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-lg shadow-cyan-500/25 transition-all text-base"
            >
              Browse Laptops &amp; PCs
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/categories/components">
            <Button
              variant="secondary"
              className="border-slate-700 hover:border-slate-500 text-slate-200 px-6 py-3 rounded-lg text-base"
            >
              Hardware &amp; Accessories
            </Button>
          </LocalizedClientLink>
        </div>

        {/* Value Props Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 w-full max-w-lg mt-4 text-xs font-medium text-slate-400">
          <div>⚡ 100% Genuine Products</div>
          <div>🛡️ Official Brand Warranty</div>
          <div className="col-span-2 sm:col-span-1">🚚 Express Delivery Across BD</div>
        </div>
      </div>
    </div>
  )
}

export default Hero
