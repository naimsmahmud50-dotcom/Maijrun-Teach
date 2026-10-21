import { Metadata } from "next"
import AdminDashboardTemplate from "@/modules/admin/templates"

export const metadata: Metadata = {
  title: "Admin Control Center | MAIJRUN Tech",
  description:
    "Enterprise branded administration dashboard for MAIJRUN Tech. Manage catalog, inventory, order fulfillment, and analytics.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminPage() {
  return <AdminDashboardTemplate />
}
