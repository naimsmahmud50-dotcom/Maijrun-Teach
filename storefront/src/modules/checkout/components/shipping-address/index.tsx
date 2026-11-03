import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import {
  validateBDPhoneNumber,
  BANGLADESH_DISTRICTS,
  isInsideDhaka,
} from "@lib/bangladesh"
import {
  BD_DISTRICTS_DATA,
  getThanasByDistrict,
  getShippingInfo,
  getAllDistricts,
} from "@lib/data/bd-geo"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "bd",
    "shipping_address.province": cart?.shipping_address?.province || "Dhaka",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "bd",
        "shipping_address.province": address?.province || "Dhaka",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const phoneValue = formData["shipping_address.phone"] || ""
  const phoneValidation = phoneValue.trim()
    ? validateBDPhoneNumber(phoneValue)
    : null

  const selectedProvinceOrCity =
    formData["shipping_address.province"] ||
    formData["shipping_address.city"] ||
    ""
  const insideDhakaDelivery = isInsideDhaka(selectedProvinceOrCity)

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      {/* Bangladesh Delivery Matrix Notification Banner */}
      <div className="mb-6 p-4 rounded-lg border border-blue-100 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-900 flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <p className="font-semibold text-sm mb-0.5">MAIJRUN Tech Nationwide Delivery &amp; COD</p>
          <p>
            {insideDhakaDelivery ? (
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Inside Dhaka Delivery selected: ৳80 flat rate (24–48 hours express delivery)
              </span>
            ) : (
              <span className="font-medium text-blue-700 dark:text-blue-300">
                ✓ Outside Dhaka Courier selected: ৳150 flat rate (2–4 days nationwide delivery)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Address (House, Road, Area)"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Company / Landmark (Optional)"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          label="Postal code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />

        {/* District Selector (64 Bangladesh Districts) */}
        <div className="flex flex-col">
          <label className="text-xs text-ui-fg-subtle mb-1 font-medium">
            District (জেলা)
          </label>
          <div className="relative">
            <select
              name="shipping_address.province"
              value={formData["shipping_address.province"]}
              onChange={(e) => {
                const newDistrict = e.target.value
                const thanas = getThanasByDistrict(newDistrict)
                setFormData((prev: any) => ({
                  ...prev,
                  "shipping_address.province": newDistrict,
                  "shipping_address.city": thanas[0] || "",
                }))
              }}
              className="w-full min-h-[44px] px-4 py-2 bg-ui-bg-field border border-ui-border-base rounded-md text-sm text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:bg-ui-bg-field-hover transition-colors"
              data-testid="shipping-province-input"
              required
            >
              <option value="">Select District</option>
              {BANGLADESH_DISTRICTS.map((d) => {
                const info = getShippingInfo(d.name)
                return (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.division}) — ৳{info.fee} ({info.timeframe})
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Hyperlocal Thana / Upazila Cascade */}
        <div className="flex flex-col">
          <label className="text-xs text-ui-fg-subtle mb-1 font-medium">
            Thana / Upazila (থানা)
          </label>
          <div className="relative">
            <select
              name="shipping_address.city"
              value={formData["shipping_address.city"]}
              onChange={handleChange}
              className="w-full min-h-[44px] px-4 py-2 bg-ui-bg-field border border-ui-border-base rounded-md text-sm text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:bg-ui-bg-field-hover transition-colors"
              data-testid="shipping-city-input"
              required
            >
              <option value="">Select Thana / Area</option>
              {getThanasByDistrict(formData["shipping_address.province"] || "Dhaka").map((thana) => (
                <option key={thana} value={thana}>
                  {thana}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />

        {/* Bangladesh Mobile Phone with Validation */}
        <div className="flex flex-col">
          <Input
            label="Phone (01XXXXXXXXX)"
            name="shipping_address.phone"
            autoComplete="tel"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            required
            data-testid="shipping-phone-input"
          />
          {phoneValidation && (
            <div className="mt-1 text-xs">
              {phoneValidation.isValid ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  ✓ Valid {phoneValidation.operator} ({phoneValidation.formatted})
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  {phoneValidation.error}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ShippingAddress
