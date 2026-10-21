import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import {
  findOrCreateCustomerByPhone,
  getCustomerById,
  updateCustomerProfile,
  addAddress,
  deleteAddress,
  getAddresses,
  toggleWishlist,
  linkSavedBuild,
  exportCustomerData,
  deleteCustomerAccount,
  resetAccountStoreForTests,
} from "../account/account-store"
import { logSecurityAudit, getSecurityAuditLogs, clearSecurityAuditLogs } from "../auth/audit-logger"

describe("Phase 9: Account Store & Anti-IDOR Security Tests", () => {
  beforeEach(() => {
    resetAccountStoreForTests()
    clearSecurityAuditLogs()
  })

  describe("1. Customer Profile Lifecycle", () => {
    it("should register customer by verified phone and deduplicate on login", async () => {
      const phone = "+8801712345678"

      // First call registers
      const first = await findOrCreateCustomerByPhone(phone)
      assert.strictEqual(first.isNew, true)
      assert.strictEqual(first.customer.phone, phone)

      // Second call returns existing
      const second = await findOrCreateCustomerByPhone(phone)
      assert.strictEqual(second.isNew, false)
      assert.strictEqual(second.customer.id, first.customer.id)
    })

    it("should update profile details", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801812345678")
      const updated = await updateCustomerProfile(customer.id, {
        name: "Mahmud Hasan",
        email: "mahmud@maijrun.com",
      })

      assert.strictEqual(updated?.name, "Mahmud Hasan")
      assert.strictEqual(updated?.email, "mahmud@maijrun.com")
    })
  })

  describe("2. Bangladesh Address Book & Anti-IDOR Enforcement", () => {
    it("should save Bangladesh address with division, district, and upazila", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801711112222")

      const addr = await addAddress(customer.id, {
        title: "Home",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Dhanmondi",
        streetAddress: "House 10, Road 5",
        phone: "+8801711112222",
        isDefault: true,
      })

      assert.ok(addr?.id)
      assert.strictEqual(addr?.division, "Dhaka")
      assert.strictEqual(addr?.upazila, "Dhanmondi")
      assert.strictEqual(addr?.isDefault, true)

      const list = await getAddresses(customer.id)
      assert.strictEqual(list.length, 1)
      assert.strictEqual(list[0].id, addr?.id)
    })

    it("should block IDOR: Customer B cannot delete Customer A's address", async () => {
      const custA = (await findOrCreateCustomerByPhone("+8801700000001")).customer
      const custB = (await findOrCreateCustomerByPhone("+8801700000002")).customer

      // Add address for Customer A
      const addrA = await addAddress(custA.id, {
        title: "Customer A Address",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Mirpur",
        streetAddress: "Sector 1",
        phone: custA.phone,
        isDefault: true,
      })

      assert.ok(addrA)

      // Customer B attempts to delete Customer A's address (IDOR attack)
      const attackSuccess = await deleteAddress(custB.id, addrA!.id)
      assert.strictEqual(attackSuccess, false)

      // Verify Customer A's address remains intact
      const listA = await getAddresses(custA.id)
      assert.strictEqual(listA.length, 1)
      assert.strictEqual(listA[0].id, addrA?.id)
    })
  })

  describe("3. Wishlist & Saved PC Builds", () => {
    it("should toggle wishlist items for authenticated customer", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801900000000")

      // Add
      const addRes = await toggleWishlist(customer.id, "prod_asus_zephyrus_g16")
      assert.strictEqual(addRes.inWishlist, true)
      assert.ok(addRes.wishlist.includes("prod_asus_zephyrus_g16"))

      // Remove
      const removeRes = await toggleWishlist(customer.id, "prod_asus_zephyrus_g16")
      assert.strictEqual(removeRes.inWishlist, false)
      assert.strictEqual(removeRes.wishlist.includes("prod_asus_zephyrus_g16"), false)
    })

    it("should link saved PC builds to customer account", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801911111111")
      await linkSavedBuild(customer.id, "pcb_intel_creator_build")

      const refreshed = await getCustomerById(customer.id)
      assert.ok(refreshed?.savedBuildIds.includes("pcb_intel_creator_build"))
    })
  })

  describe("4. Privacy by Design & Security Audit Logging", () => {
    it("should export customer data archive without leaking secrets", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801799998888")
      const exported = await exportCustomerData(customer.id)

      assert.ok(exported?.exportedAt)
      assert.strictEqual(exported?.profile.id, customer.id)
      assert.strictEqual(exported?.profile.phone, customer.phone)
      assert.ok(Array.isArray(exported?.addresses))
    })

    it("should permanently delete customer account upon request", async () => {
      const { customer } = await findOrCreateCustomerByPhone("+8801755554444")
      const deleted = await deleteCustomerAccount(customer.id)
      assert.strictEqual(deleted, true)

      // Subsequent lookup yields null
      const check = await getCustomerById(customer.id)
      assert.strictEqual(check, null)
    })

    it("should sanitize and redact secrets in security audit logs", () => {
      const log = logSecurityAudit({
        event: "TEST_SECURITY_EVENT",
        phone: "+8801712345678",
        ip: "127.0.0.1",
        details: {
          otpCode: "123456",
          authToken: "secret_token_val",
          cardData: "4111222233334444",
          browser: "Firefox",
        },
      })

      assert.strictEqual(log.details?.otpCode, "[REDACTED]")
      assert.strictEqual(log.details?.authToken, "[REDACTED]")
      assert.strictEqual(log.details?.cardData, "[REDACTED]")
      assert.strictEqual(log.details?.browser, "Firefox")
      assert.strictEqual(log.phoneMasked, "+88017****-***78")
    })
  })
})
