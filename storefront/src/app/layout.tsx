import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Montserrat, Heebo } from "next/font/google"
import { brandConfig } from "@config/brand"
import "styles/globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const heebo = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: `${brandConfig.name} | ${brandConfig.tagline}`,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: `${brandConfig.name} | ${brandConfig.tagline}`,
    description: brandConfig.description,
    url: brandConfig.url,
    siteName: brandConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brandConfig.name,
    description: brandConfig.description,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${heebo.variable}`} data-mode="dark">
      <body className="font-sans bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-black">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
