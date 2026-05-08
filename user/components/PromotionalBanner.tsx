"use client"

import { useState, useEffect } from "react"
import { Ticket, Copy, CheckCircle, X, Sparkles } from "lucide-react"
import { orderApi } from "@/lib/api"

export default function PromotionalBanner() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const result = await orderApi.getPublicCoupons()
        if (result.success && Array.isArray(result.data)) setCoupons(result.data)
      } catch (error) { console.error("Failed to fetch public coupons:", error) }
      finally { setLoading(false) }
    }
    fetchPublicCoupons()
  }, [])

  const handleClose = () => setIsVisible(false)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading || coupons.length === 0 || !isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002147]/80 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="relative max-w-lg w-full bg-white rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border border-[#eb9a05]/20" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Gradient */}
        <div className="h-32 bg-[#002147] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#002147] to-[#003366]"></div>
          <div className="absolute top-[-50%] left-[-20%] w-full h-[200%] bg-[#eb9a05]/10 rotate-45 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-[#eb9a05]/20 border border-[#eb9a05]/30 text-[#eb9a05] mb-2">
              <Sparkles className="w-3 h-3" />
              <span className="text-[8px] font-black tracking-[0.3em] uppercase">Limited Time</span>
            </div>
            <h2 className="text-2xl font-playfair font-black text-white">Special Offers</h2>
          </div>

          <button onClick={handleClose} className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-[#eb9a05] hover:text-[#002147] transition-all duration-300 transform hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <p className="text-center text-gray-500 mb-6 font-medium text-sm italic leading-relaxed">
            &quot;Quality products and exceptional value, delivered right to your doorstep.&quot;
          </p>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {coupons.map((coupon, idx) => (
              <div key={idx} className="p-6 rounded-[1.5rem] border-2 border-dashed border-[#eb9a05] bg-[#f8f9fa] relative group transition-all hover:bg-white hover:shadow-xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <span className="text-[8px] font-black tracking-[0.4em] uppercase text-[#eb9a05] block mb-1">Limited Offer</span>
                    <h3 className="text-3xl font-playfair font-black text-[#002147]">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} <span className="text-xl opacity-40 uppercase">Off</span>
                    </h3>
                  </div>

                  <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#002147] group-hover:bg-[#002b5c] transition-all">
                    <div className="flex-1 flex justify-center">
                      <span className="font-mono text-2xl font-black tracking-[0.3em] uppercase text-[#eb9a05]">{coupon.code}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(coupon.code)} 
                      className="p-4 rounded-xl bg-[#eb9a05] text-[#002147] hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                      {copiedCode === coupon.code ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleClose}
            className="w-full mt-8 btn-primary py-4 text-sm font-black tracking-[0.3em] uppercase shadow-[0_10px_30px_rgba(0,33,71,0.2)]"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  )
}
