import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // Format Bangladesh Taka (BDT) with clean ৳ symbol and standard integer digits
  if (currency_code.toLowerCase() === "bdt") {
    const num = typeof amount === "number" && !isNaN(amount) ? amount : 0
    const minDigits = minimumFractionDigits ?? 0
    const maxDigits = maximumFractionDigits ?? (num % 1 !== 0 ? 2 : 0)
    return `৳${num.toLocaleString("en-US", {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    })}`
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
