"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"
import { Loader2, CheckCircle, XCircle, Mail, Sparkles, ArrowRight } from "lucide-react"
import { authApi } from "@/lib/api"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [message, setMessage] = useState("Authenticating your credentials...")
  const hasCalled = useRef(false)

  useEffect(() => {
    if (hasCalled.current) return
    hasCalled.current = true
    const verify = async () => {
      try {
        const token = searchParams.get("token")
        if (!token) { setIsVerified(false); setMessage("Invalid or missing verification token."); setIsLoading(false); return }
        const { success, message } = await authApi.verifyEmail(token)
        if (!success) { setIsVerified(false); setMessage(message || "Email verification failed."); addToast(message || "Email verification failed.", "error"); setIsLoading(false); return }
        setIsVerified(true)
        setMessage("Email verified successfully! You can now login.")
        addToast("Email verified successfully!", "success")
      } catch { setIsVerified(false); setMessage("Failed to connect to server."); addToast("Failed to connect to server.", "error") }
      finally { setIsLoading(false) }
    }
    verify()
  }, []) 

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      
      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[#eb9a05]/10 relative z-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-10">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Identity Verification</span>
        </div>

        {isLoading ? (
          <div className="py-10 space-y-6">
            <Loader2 className="h-16 w-16 animate-spin text-[#eb9a05] mx-auto" />
            <p className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40">Consulting The Registry...</p>
          </div>
        ) : isVerified ? (
          <div className="py-10 space-y-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/10">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-playfair font-black text-[#002147] mb-4">Identity Confirmed</h2>
              <p className="text-gray-400 text-sm italic font-medium leading-relaxed">Your electronic address has been successfully authenticated. Access to the collection is now granted.</p>
            </div>
            <Link href="/auth/login" className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-4 group">
              <span className="text-sm font-black tracking-widest uppercase">Advance To Login</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        ) : (
          <div className="py-10 space-y-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/10">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-3xl font-playfair font-black text-[#002147] mb-4">Authentication Error</h2>
              <p className="text-gray-400 text-sm italic font-medium leading-relaxed">{message}</p>
            </div>
            <div className="space-y-4">
              <Link href="/auth/login" className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-4">
                <span className="text-sm font-black tracking-widest uppercase">Return To Login</span>
              </Link>
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-300">
                If the link expired, <Link href="/auth/login" className="text-[#eb9a05] hover:underline">re-authenticate</Link>
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
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#eb9a05]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}