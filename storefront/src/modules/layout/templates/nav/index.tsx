import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCart } from "@lib/data/cart"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchTrigger from "@modules/layout/components/search-trigger/SearchTrigger"
import MobileBottomNav from "@modules/layout/components/mobile-nav/MobileBottomNav"
import { brandConfig } from "@config/brand"

export default async function Nav() {
  const [regions, locales, currentLocale, cart] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCart().catch(() => null),
  ])

  const totalItems =
    cart?.items?.reduce((acc: number, item: any) => {
      return acc + (item.quantity || 1)
    }, 0) || 0

  return (
    <>
      <div className="sticky top-0 inset-x-0 z-40 group">
        <header className="relative h-16 mx-auto border-b duration-200 backdrop-blur-xl bg-slate-950/90 border-slate-800 text-slate-100 shadow-lg">
          <nav className="content-container flex items-center justify-between w-full h-full text-sm">
            {/* Left: Side Menu & Brand */}
            <div className="flex items-center gap-4">
              <div className="h-full">
                <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
              </div>

              <LocalizedClientLink
                href="/"
                className="flex items-center gap-2 hover:opacity-95 transition-opacity"
                data-testid="nav-store-link"
              >
                <img
                  src={brandConfig.logo.src}
                  alt={brandConfig.name}
                  className="h-8 w-auto object-contain brightness-110"
                />
              </LocalizedClientLink>
            </div>

            {/* Center: Live Search Bar */}
            <div className="flex-1 max-w-xl mx-4 flex justify-center">
              <SearchTrigger countryCode={currentLocale || "bd"} />
            </div>

            {/* Right: Quick Links, PC Builder & Cart */}
            <div className="flex items-center gap-x-4 sm:gap-x-6 h-full justify-end">
              <div className="hidden medium:flex items-center gap-x-5 h-full text-xs font-medium">
                <LocalizedClientLink
                  className="hover:text-cyan-400 transition-colors"
                  href="/store"
                  data-testid="nav-store-catalog-link"
                >
                  All Products
                </LocalizedClientLink>
                <LocalizedClientLink
                  className="hover:text-cyan-400 transition-colors"
                  href="/compare"
                  data-testid="nav-compare-link"
                >
                  Compare
                </LocalizedClientLink>
                <LocalizedClientLink
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 text-cyan-400 font-semibold border border-cyan-800/80 hover:bg-cyan-900/90 hover:border-cyan-500/50 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  href="/pc-builder"
                  data-testid="nav-pc-builder-link"
                >
                  <span>⚡</span> PC Builder
                </LocalizedClientLink>
                <LocalizedClientLink
                  className="hover:text-cyan-400 transition-colors"
                  href="/track"
                  data-testid="nav-track-link"
                >
                  Track
                </LocalizedClientLink>
                <LocalizedClientLink
                  className="hover:text-cyan-400 transition-colors"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  Account
                </LocalizedClientLink>
              </div>

              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="hover:text-cyan-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Cart (0)
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </nav>
        </header>
      </div>

      {/* Fixed Mobile Bottom App-Like Navigation */}
      <MobileBottomNav countryCode={currentLocale || "bd"} cartCount={totalItems} />
    </>
  )
}
