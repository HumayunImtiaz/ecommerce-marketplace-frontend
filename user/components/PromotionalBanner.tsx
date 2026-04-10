"use client"

import { useState, useEffect } from "react"
import { Ticket, Copy, CheckCircle, X } from "lucide-react"
import { orderApi } from "@/lib/api"

export default function PromotionalBanner() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading || coupons.length === 0 || !isVisible) return null

  // Show only the most recent/relevant public coupon for the banner
  const activeCoupon = coupons[0]

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Ticket className="w-5 h-5 text-yellow-300" />
          </div>
          <span className="font-bold tracking-tight text-sm sm:text-base">
            SPECIAL OFFER: {activeCoupon.discountType === "percentage" ? `${activeCoupon.discountValue}% OFF` : `$${activeCoupon.discountValue} OFF`}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <p className="text-xs sm:text-sm text-blue-100 font-medium">
            Use code: <span className="text-white font-black bg-black/20 px-2 py-0.5 rounded ml-1 font-mono">{activeCoupon.code}</span>
          </p>
          <button
            onClick={() => copyToClipboard(activeCoupon.code)}
            className="flex items-center space-x-1.5 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            {copiedCode === activeCoupon.code ? (
              <><CheckCircle className="w-3.5 h-3.5" /> <span>Copied!</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> <span>Copy</span></>
            )}
          </button>
        </div>

        {activeCoupon.minPurchase > 0 && (
          <p className="text-[10px] sm:text-xs text-blue-100/80">
            *On orders over ${activeCoupon.minPurchase}
          </p>
        )}

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors hidden md:block"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
      
      {/* Decorative pulse line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent animate-pulse" />
    </div>
  )
}
