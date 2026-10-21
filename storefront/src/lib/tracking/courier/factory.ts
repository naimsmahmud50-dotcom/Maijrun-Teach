import { CourierProvider } from "./types"
import { MockCourierProvider } from "./providers/mock"
import { SteadfastCourierProvider } from "./providers/steadfast"
import { PathaoCourierProvider } from "./providers/pathao"

export function getCourierProvider(providerName?: string): CourierProvider {
  const selected = (providerName || process.env.COURIER_GATEWAY_PROVIDER || "mock").toLowerCase()

  switch (selected) {
    case "steadfast":
      return new SteadfastCourierProvider()
    case "pathao":
      return new PathaoCourierProvider()
    case "mock":
    default:
      return new MockCourierProvider()
  }
}
