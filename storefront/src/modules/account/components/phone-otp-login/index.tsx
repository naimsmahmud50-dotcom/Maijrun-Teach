"use client"

import React, { useState, useEffect } from "react"
import { normalizeBangladeshMobile } from "@/lib/auth/otp-service-helper"

interface PhoneOtpLoginProps {
  onSuccess?: (user: any) => void
  redirectUrl?: string
}

export default function PhoneOtpLogin({ onSuccess, redirectUrl = "/account" }: PhoneOtpLoginProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const normalized = normalizeBangladeshMobile(phone)
    if (!normalized) {
      setErrorMessage("Please enter a valid Bangladesh mobile number (e.g. 01712345678).")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to send verification code.")
        setLoading(false)
        return
      }

      setStep("otp")
      setSuccessMessage("6-digit verification code sent via SMS.")
      setCooldown(data.cooldownSeconds || 60)
    } catch {
      setErrorMessage("Network error occurred. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (otp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otp.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Invalid or expired code.")
        setLoading(false)
        return
      }

      setSuccessMessage("Login successful! Redirecting...")
      if (onSuccess) {
        onSuccess(data.user)
      } else {
        window.location.href = redirectUrl
      }
    } catch {
      setErrorMessage("Verification request failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 text-xl font-bold mb-3">
          📱
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
          {step === "phone" ? "Sign In with Mobile OTP" : "Enter Verification Code"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {step === "phone"
            ? "Enter your Bangladesh phone number for passwordless, secure instant access."
            : `We sent a 6-digit code to ${phone}`}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Mobile Number (Bangladesh)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-gray-500 border-r border-gray-300 dark:border-gray-700 pr-2 select-none flex items-center gap-1">
                <span>🇧🇩</span>
                <span>+880</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712345678"
                className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-mono"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Sending Code..." : "Send Verification OTP →"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              6-Digit Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="123456"
              className="w-full py-2.5 text-center tracking-[0.5em] text-lg font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setOtp("")
              }}
              className="hover:underline text-gray-600 dark:text-gray-400"
            >
              Change number
            </button>

            {cooldown > 0 ? (
              <span className="text-gray-400">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-sky-600 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
