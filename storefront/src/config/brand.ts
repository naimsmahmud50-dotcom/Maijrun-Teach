/**
 * Central Brand Configuration for MAIJRUN Tech Storefront
 * Edit brand properties, contact details, social links, and theme colors in one place.
 */

export const brandConfig = {
  name: "MAIJRUN Tech",
  shortName: "MAIJRUN",
  legalName: "MAIJRUN Tech Ltd.",
  tagline: "Your Next-Gen Tech Destination",
  description: "Official online store for high-performance laptops, custom desktops, hardware components, and tech accessories.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://maijrun.com",
  supportEmail: "support@maijrun.com",
  phone: "+880 1700-000000",
  location: "Dhaka, Bangladesh",
  socials: {
    facebook: "https://facebook.com/maijruntech",
    twitter: "https://twitter.com/maijruntech",
    instagram: "https://instagram.com/maijruntech",
    github: "https://github.com/maijruntech",
  },
  colors: {
    primary: "#06b6d4", // Electric Cyan
    primaryHover: "#0891b2",
    background: "#0b0f19", // Deep Slate
    card: "#111827", // Navy Dark
  },
  logo: {
    name: "MAIJRUN",
    subtitle: "TECH",
    src: "/logo.svg",
    favicon: "/favicon.ico",
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} MAIJRUN Tech. All rights reserved.`,
    note: "Official MAIJRUN Tech E-Commerce Store",
  },
}

export default brandConfig
