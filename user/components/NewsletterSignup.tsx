"use client"

import type React from "react"
import { useState } from "react"
import { Mail, CheckCircle, Sparkles } from "lucide-react"
import { useToast } from "@/contexts/ToastContext"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { addToast("Please enter your email address", "error"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { addToast("Please enter a valid email address", "error"); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      const result = await res.json()
      if (result.success) { setIsSubscribed(true); addToast(result.message || "Welcome to our inner circle!", "success"); setEmail("") }
      else { addToast(result.message || "Failed to join", "error") }
    } catch { addToast("Failed to connect. Please try again.", "error") }
    finally { setIsLoading(false) }
  }

  if (isSubscribed) {
    return (
      <section className="py-32 bg-[#002147] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#eb9a05]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="w-24 h-24 bg-[#eb9a05] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
            <CheckCircle className="w-12 h-12 text-[#002147]" />
          </div>
          <h2 className="text-5xl font-playfair font-black text-white mb-6">Welcome to the Inner Circle</h2>
          <p className="text-[#eb9a05] text-lg font-bold tracking-widest uppercase max-w-md mx-auto opacity-80">
            You are now subscribed to LuxeCart exclusive updates.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-32 bg-[#f8f9fa] relative overflow-hidden border-y border-[#eb9a05]/10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-[#002147] rounded-[3rem] p-12 md:p-24 shadow-2xl relative overflow-hidden group">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#eb9a05]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#eb9a05]/20 transition-all duration-700"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Join the Elite</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair font-black text-white leading-tight mb-6">
                Step Into <br />
                <span className="italic text-[#eb9a05]">Unrivaled</span> Luxury
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Subscribe to receive curated trends, elite previews, and invitations to private shopping events.
              </p>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="relative space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#eb9a05] transition-colors" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-16 pr-8 py-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#eb9a05] focus:bg-white/10 transition-all text-lg font-medium"
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full btn-secondary py-6 text-base font-black tracking-[0.2em] uppercase shadow-2xl group relative overflow-hidden"
                >
                  {isLoading ? "Enrolling..." : "Enroll Now"}
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </button>
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Privacy is a luxury we strictly maintain.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
