import { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "MAIJRUN Tech Store - Laptops & Desktops",
  description: "Explore premium laptops, desktops, and computing workstations at MAIJRUN Tech.",
}

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams

  return (
    <StoreTemplate
      searchParams={searchParams}
      countryCode={params.countryCode}
    />
  )
}
