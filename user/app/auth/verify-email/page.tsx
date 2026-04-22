"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react"

import { authApi } from "@/lib/api"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [isLoading, setIsLoading]   = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [message, setMessage]       = useState("Verifying your email...")

  // ── StrictMode double-call rok do ─────────────────────────────────────────
  const hasCalled = useRef(false)

  useEffect(() => {
    if (hasCalled.current) return   // already ran — skip second StrictMode call
    hasCalled.current = true

    const verify = async () => {
      try {
        const token = searchParams.get("token")

        if (!token) {
          setIsVerified(false)
          setMessage("Invalid or missing verification token.")
          setIsLoading(false)
          return
        }

        const { success, message, data } = await authApi.verifyEmail(token)

        if (!success) {
          setIsVerified(false)
          setMessage(message || "Email verification failed.")
          addToast(message || "Email verification failed.", "error")
          setIsLoading(false)
          return
        }

        setIsVerified(true)
        setMessage("Email verified successfully! You can now login.")
        addToast("Email verified successfully!", "success")
      } catch {
        setIsVerified(false)
        setMessage("Failed to connect to server. Please try again.")
        addToast("Failed to connect to server.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, []) 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        <div className="flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-gray-500 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-sm">Verifying your email...</p>
          </div>

        ) : isVerified ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <p className="text-green-700 font-semibold text-lg">Verification Successful!</p>
              <p className="text-gray-500 text-sm mt-1">Your email has been verified. You can now login.</p>
            </div>
            <Link
              href="/auth/login"
              className="mt-2 inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>

        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <div>
              <p className="text-red-600 font-semibold text-lg">Verification Failed</p>
              <p className="text-gray-500 text-sm mt-1">{message}</p>
            </div>
            <div className="flex flex-col gap-3 w-full mt-2">
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Login
              </Link>
              <p className="text-xs text-gray-400">
                If the link expired,{" "}
                <Link href="/auth/login" className="text-blue-500 hover:underline">
                  login to resend verification email
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}