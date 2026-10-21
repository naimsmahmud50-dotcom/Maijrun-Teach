import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maijrun.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/categories",
          "/pc-builder",
          "/compare",
          "/track",
          "/privacy-policy",
          "/terms-of-service",
          "/refund-policy",
        ],
        disallow: [
          "/admin",
          "/api/admin/",
          "/account/",
          "/cart",
          "/order/",
          "/api/auth/",
          "/api/payments/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
