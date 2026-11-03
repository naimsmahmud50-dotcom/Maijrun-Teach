"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid, Cpu, Scale, ShoppingBag, User } from "lucide-react"

export default function MobileBottomNav({
  countryCode = "bd",
  cartCount = 0,
}: {
  countryCode?: string
  cartCount?: number
}) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Home",
      href: `/${countryCode}`,
      icon: Home,
      isActive: pathname === `/${countryCode}` || pathname === "/",
    },
    {
      label: "Store",
      href: `/${countryCode}/store`,
      icon: Grid,
      isActive: pathname.includes("/store") || pathname.includes("/categories"),
    },
    {
      label: "PC Builder",
      href: `/${countryCode}/pc-builder`,
      icon: Cpu,
      highlight: true,
      isActive: pathname.includes("/pc-builder"),
    },
    {
      label: "Compare",
      href: `/${countryCode}/compare`,
      icon: Scale,
      isActive: pathname.includes("/compare"),
    },
    {
      label: "Cart",
      href: `/${countryCode}/cart`,
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: pathname.includes("/cart"),
    },
    {
      label: "Account",
      href: `/${countryCode}/account`,
      icon: User,
      isActive: pathname.includes("/account"),
    },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 medium:hidden backdrop-blur-xl bg-slate-950/90 border-t border-slate-800/90 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                item.isActive
                  ? "text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                {item.highlight ? (
                  <div
                    className={`p-1.5 rounded-full ${
                      item.isActive
                        ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900 text-cyan-400 border border-cyan-800/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}

                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
