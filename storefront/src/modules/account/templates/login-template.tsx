"use client"

import { useState } from "react"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import PhoneOtpLogin from "@modules/account/components/phone-otp-login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  PHONE_OTP = "phone-otp",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.PHONE_OTP)

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-8">
      {currentView === LOGIN_VIEW.PHONE_OTP ? (
        <div className="w-full max-w-md">
          <PhoneOtpLogin />
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className="text-xs text-gray-500 hover:text-sky-600 transition underline"
            >
              Sign in with Email & Password instead
            </button>
          </div>
        </div>
      ) : currentView === LOGIN_VIEW.SIGN_IN ? (
        <div className="w-full max-w-md flex flex-col items-center">
          <Login setCurrentView={setCurrentView} />
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentView(LOGIN_VIEW.PHONE_OTP)}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              ← Sign in with Mobile OTP (Bangladesh)
            </button>
          </div>
        </div>
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
