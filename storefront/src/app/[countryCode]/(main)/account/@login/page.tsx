import { Metadata } from "next"
import { brandConfig } from "@config/brand"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${brandConfig.name} account.`,
}

export default function Login() {
  return <LoginTemplate />
}
