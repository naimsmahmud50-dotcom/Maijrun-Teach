import { Metadata } from "next"
import PCBuilderTemplate from "@/modules/pc-builder/templates"

export const metadata: Metadata = {
  title: "Custom PC Builder | MAIJRUN Tech",
  description:
    "Build your custom desktop computer with real-time hardware compatibility checking, BDT pricing, and instant PDF quotation. Powered by MAIJRUN Tech.",
  openGraph: {
    title: "Custom PC Builder | MAIJRUN Tech",
    description:
      "Configure your dream PC with live socket matching, power headroom calculation, and official warranties.",
  },
}

export default function PCBuilderPage() {
  return <PCBuilderTemplate />
}
