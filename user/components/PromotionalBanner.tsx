"use client"

import { useState, useEffect } from "react"
import { Ticket, Copy, CheckCircle, X } from "lucide-react"
import { orderApi } from "@/lib/api"

export default function PromotionalBanner() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false) // Start hidden to check session

  useEffect(() => {
    // Show every time they land on the page (delay slightly for better UX)
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const result = await orderApi.getPublicCoupons()
        if (result.success && Array.isArray(result.data)) {
          setCoupons(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch public coupons:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPublicCoupons()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading || coupons.length === 0 || !isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-purple-700" />
        <div className="absolute top-0 left-0 w-full h-32 overflow-hidden">
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-white/10 rotate-12 blur-3xl" />
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-purple-400/20 -rotate-12 blur-2xl" />
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 pt-12 px-8 pb-8 text-center">
          {/* Icon Header */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-6 -mt-10 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Ticket className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">Exclusive Offers!</h2>
          <p className="text-slate-500 text-sm mb-6">We have special discounts just for you. Grab them before they&apos;re gone!</p>

          {/* Coupon Cards */}
          <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-1">
            {coupons.map((coupon, idx) => (
              <div key={idx} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 relative group text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">
                  {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                </div>
                <div className="flex items-center justify-between space-x-2 bg-white border border-slate-100 py-2.5 px-4 rounded-xl shadow-sm mx-auto max-w-[200px]">
                  <span className="font-mono text-xl font-bold tracking-widest text-slate-700 uppercase">{coupon.code}</span>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shrink-0"
                    title="Copy Code"
                  >
                    {copiedCode === coupon.code ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instruction Pointer - ESSENTIAL per user request */}
          <div className="flex items-start space-x-3 bg-blue-50/50 p-4 rounded-xl text-left mb-8 border border-blue-100/50">
            <div className="mt-0.5 p-1 bg-blue-100 text-blue-600 rounded-md shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-0.5">Where to use?</p>
              <p className="text-xs text-blue-600 leading-relaxed font-medium">
                Apply this code on the <span className="font-bold underline">Checkout Page</span> in the &apos;Available Offers&apos; section to see your savings.
              </p>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
          >
            Got it, Let&apos;s Shop!
          </button>
        </div>
      </div>
    </div>
  )
}
