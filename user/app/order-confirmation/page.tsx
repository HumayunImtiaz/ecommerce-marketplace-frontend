"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, Mail, Loader2, ArrowRight, Sparkles } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { orderApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const { addToast } = useToast()
  const orderNumber = searchParams.get("order") || "ORD-CONFIRMED"
  const paymentIntentId = searchParams.get("payment_intent")
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    window.scrollTo(0, 0)
    clearCart()
    if (paymentIntentId && orderId) {
      const confirmPayment = async () => {
        try {
          await orderApi.confirmPayment(orderId, paymentIntentId);
          addToast("Payment secured and validated.", "success");
        } catch (err) { console.error("Confirmation error:", err); }
      }
      confirmPayment()
    }
  }, [paymentIntentId, clearCart])

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-20 px-4">
      <div className="max-w-3xl w-full bg-white rounded-[3rem] p-12 md:p-24 shadow-2xl border border-[#eb9a05]/10 text-center relative overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#002147]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
            <CheckCircle className="w-12 h-12 text-[#eb9a05]" />
          </div>
          
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Order Confirmed</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Thank You!</h1>
          <p className="text-lg text-gray-500 mb-12 max-w-md mx-auto italic leading-relaxed">
            Thank you for your order. Your items have been reserved and are now being prepared.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-50">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-40 block mb-2">Identification</span>
              <p className="text-xl font-mono font-bold text-[#002147]">{orderNumber}</p>
            </div>
            <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-50">
              <span className="text-[10px] font-black tracking-widest uppercase opacity-40 block mb-2">Expected Arrival</span>
              <p className="text-xl font-bold text-[#002147]">7-10 Business Days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#eb9a05]/10 rounded-2xl flex items-center justify-center mx-auto text-[#eb9a05]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#002147] text-sm uppercase tracking-widest">Notification</h3>
              <p className="text-[10px] text-gray-400 font-medium">A dossier has been sent to your email.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#eb9a05]/10 rounded-2xl flex items-center justify-center mx-auto text-[#eb9a05]">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#002147] text-sm uppercase tracking-widest">Processing</h3>
              <p className="text-[10px] text-gray-400 font-medium">Your items are being packaged.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#eb9a05]/10 rounded-2xl flex items-center justify-center mx-auto text-[#eb9a05]">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#002147] text-sm uppercase tracking-widest">Shipping</h3>
              <p className="text-[10px] text-gray-400 font-medium">Tracking will be provided upon departure.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/account?tab=orders" className="btn-primary py-5 px-12 flex items-center justify-center gap-4 group">
              <span className="text-xs font-black tracking-widest uppercase">Track Heritage</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </Link>
            <Link href="/products" className="py-5 px-12 rounded-2xl border-2 border-gray-100 font-black text-xs tracking-widest uppercase text-[#002147] hover:bg-gray-50 transition-all">
              Continue Discovery
            </Link>
          </div>

          <div className="mt-20 p-10 bg-[#002147] rounded-[2.5rem] text-white">
            <h3 className="text-xl font-playfair font-bold mb-4">Connoisseur Support</h3>
            <p className="text-sm opacity-60 mb-8 max-w-sm mx-auto">Our support team is available for any questions regarding your order.</p>
            <Link href="/contact" className="text-[#eb9a05] text-xs font-black tracking-widest uppercase hover:underline">
              Contact Private Concierge →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]"><Loader2 className="w-12 h-12 animate-spin text-[#eb9a05]" /></div>}>
      <OrderConfirmationContent />
    </Suspense>
  )
}