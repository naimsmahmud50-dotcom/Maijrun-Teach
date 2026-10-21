import { Metadata } from "next"
import OrderTrackingTemplate from "@/modules/tracking/templates"

export const metadata: Metadata = {
  title: "Track Your Order | MAIJRUN Tech",
  description:
    "Live delivery tracking for laptops, desktops, and custom PC orders in Bangladesh. Real-time updates with Steadfast & Pathao courier dispatch.",
  openGraph: {
    title: "Track Your Order | MAIJRUN Tech",
    description: "Monitor live logistics progress and courier consignment status.",
  },
}

export default function TrackPage() {
  return <OrderTrackingTemplate />
}
