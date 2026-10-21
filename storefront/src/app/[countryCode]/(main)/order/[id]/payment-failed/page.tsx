import React from "react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Unsuccessful | MAIJRUN Tech",
  description: "Your payment could not be completed. You can retry with another method or switch to Cash on Delivery.",
}

interface PaymentFailedProps {
  params: Promise<{ id: string; countryCode: string }>
  searchParams: Promise<{ gateway?: string; error?: string; status?: string }>
}

export default async function PaymentFailedPage({
  params,
  searchParams,
}: PaymentFailedProps) {
  const { id, countryCode } = await params
  const { gateway, error, status } = await searchParams

  const isCancelled = status === "cancelled"

  return (
    <div className="py-16 sm:py-24 max-w-xl mx-auto px-4 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-6 shadow-sm">
        ✕
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 mb-3">
        {isCancelled ? "Payment Cancelled (পেমেন্ট বাতিল হয়েছে)" : "Payment Incomplete (পেমেন্ট সম্পন্ন হয়নি)"}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {isCancelled
          ? "You Cancelled the Payment"
          : "Payment Could Not Be Processed"}
      </h1>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
        {error ||
          (isCancelled
            ? "You cancelled the payment transaction on the gateway. No money was deducted from your account."
            : "Your card or mobile wallet transaction could not be authorized. Please check your balance or try an alternative method.")}
      </p>

      {/* Order Info Card */}
      <div className="my-6 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID:</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">{id}</span>
        </div>
        {gateway && (
          <div className="flex justify-between">
            <span className="text-gray-500">Attempted Gateway:</span>
            <span className="font-semibold uppercase text-sky-600">{gateway}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className="font-semibold text-rose-600">Pending Retry</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 max-w-md mx-auto">
        <Link
          href={`/${countryCode}/checkout?step=payment&orderId=${id}`}
          className="block w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 transition shadow-sm"
        >
          🔄 Retry Payment (পুনরায় চেষ্টা করুন)
        </Link>

        <Link
          href={`/${countryCode}/order/${id}/confirmed?payment=cod`}
          className="block w-full py-3 px-6 rounded-xl font-bold text-sm text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
        >
          🚚 Switch to Cash on Delivery (ক্যাশ অন ডেলিভারিতে নিন)
        </Link>

        <Link
          href={`/${countryCode}/store`}
          className="block text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pt-2"
        >
          ← Return to Store
        </Link>
      </div>

      <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
        Need assistance? Call MAIJRUN Tech Support: <strong className="text-gray-600 dark:text-gray-300">+880 1700-000000</strong>
      </div>
    </div>
  )
}
