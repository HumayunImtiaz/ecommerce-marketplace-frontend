"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function GoogleAuthProvider({ children }: Props) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {children}
    </GoogleOAuthProvider>
  )
}