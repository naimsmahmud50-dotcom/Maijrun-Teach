import { test, describe } from "node:test"
import assert from "node:assert/strict"
import {
  validateBDPhoneNumber,
  isInsideDhaka,
  getBangladeshShippingRate,
  formatBDT,
  BANGLADESH_DISTRICTS,
} from "./bangladesh"

describe("Bangladesh Phone Number Validation", () => {
  test("validates standard 11-digit local mobile numbers", () => {
    const numbers = [
      { num: "01711223344", op: "Grameenphone" },
      { num: "01311223344", op: "Grameenphone (Skitto)" },
      { num: "01811223344", op: "Robi" },
      { num: "01611223344", op: "Airtel" },
      { num: "01911223344", op: "Banglalink" },
      { num: "01411223344", op: "Banglalink" },
      { num: "01511223344", op: "Teletalk" },
    ]

    for (const { num, op } of numbers) {
      const res = validateBDPhoneNumber(num)
      assert.equal(res.isValid, true, `Expected ${num} to be valid`)
      assert.equal(res.normalized, num)
      assert.equal(res.formatted, `+88${num}`)
      assert.equal(res.operator, op)
    }
  })

  test("validates international +880 and 880 formats with punctuation", () => {
    const withPlus = validateBDPhoneNumber("+880 1711-223344")
    assert.equal(withPlus.isValid, true)
    assert.equal(withPlus.normalized, "01711223344")
    assert.equal(withPlus.formatted, "+8801711223344")

    const withoutPlus = validateBDPhoneNumber("8801811223344")
    assert.equal(withoutPlus.isValid, true)
    assert.equal(withoutPlus.normalized, "01811223344")
  })

  test("rejects invalid length, invalid prefix, and empty values", () => {
    // Too short
    const short = validateBDPhoneNumber("0171122334")
    assert.equal(short.isValid, false)
    assert.match(short.error!, /11-digit/)

    // Too long
    const long = validateBDPhoneNumber("017112233445")
    assert.equal(long.isValid, false)

    // Invalid prefix (010, 011, 012 are not assigned mobile prefixes)
    const invalidPrefix = validateBDPhoneNumber("01211223344")
    assert.equal(invalidPrefix.isValid, false)

    // Empty or non-string
    assert.equal(validateBDPhoneNumber("").isValid, false)
    assert.equal(validateBDPhoneNumber(null).isValid, false)
    assert.equal(validateBDPhoneNumber(undefined).isValid, false)
  })
})

describe("Bangladesh Shipping Matrix & District Resolution", () => {
  test("identifies Dhaka city & metropolitan areas correctly", () => {
    assert.equal(isInsideDhaka("Dhaka"), true)
    assert.equal(isInsideDhaka("Dhaka City"), true)
    assert.equal(isInsideDhaka("Gulshan, Dhaka"), true)
    assert.equal(isInsideDhaka("Dhanmondi"), true)
    assert.equal(isInsideDhaka("Uttara Sector 7"), true)
    assert.equal(isInsideDhaka("Mirpur 10"), true)
  })

  test("identifies districts outside Dhaka correctly", () => {
    assert.equal(isInsideDhaka("Chattogram"), false)
    assert.equal(isInsideDhaka("Sylhet"), false)
    assert.equal(isInsideDhaka("Rajshahi"), false)
    assert.equal(isInsideDhaka("Khulna"), false)
    assert.equal(isInsideDhaka("Gazipur"), false) // Outside metro
    assert.equal(isInsideDhaka(""), false)
    assert.equal(isInsideDhaka(null), false)
  })

  test("calculates inside Dhaka flat rate of ৳80 with 24-48h timeframe", () => {
    const rate = getBangladeshShippingRate("Dhaka")
    assert.equal(rate.code, "inside-dhaka")
    assert.equal(rate.amount, 80)
    assert.equal(rate.timeframe, "24–48 Hours")
  })

  test("calculates outside Dhaka flat rate of ৳150 with 2-4 days timeframe", () => {
    const rate = getBangladeshShippingRate("Chattogram")
    assert.equal(rate.code, "outside-dhaka")
    assert.equal(rate.amount, 150)
    assert.equal(rate.timeframe, "2–4 Days")

    // Null/undefined defaults safely to outside Dhaka courier
    const fallbackRate = getBangladeshShippingRate(null)
    assert.equal(fallbackRate.code, "outside-dhaka")
    assert.equal(fallbackRate.amount, 150)
  })

  test("provides complete 64 districts in Bangladesh", () => {
    assert.equal(BANGLADESH_DISTRICTS.length, 64)
    const dhakaDistrict = BANGLADESH_DISTRICTS.find((d) => d.name === "Dhaka")
    assert.ok(dhakaDistrict)
    assert.equal(dhakaDistrict.isInsideDhaka, true)
  })
})

describe("BDT Currency Formatter", () => {
  test("formats numbers to clean ৳ currency string", () => {
    assert.equal(formatBDT(125000), "৳125,000")
    assert.equal(formatBDT(80), "৳80")
    assert.equal(formatBDT(150), "৳150")
    assert.equal(formatBDT(245000, true), "৳245,000.00")
    assert.equal(formatBDT(0), "৳0")
  })

  test("handles negative or NaN safely", () => {
    assert.equal(formatBDT(NaN), "৳0")
  })
})
