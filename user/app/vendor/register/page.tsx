"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { vendorApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"
import { useAuth } from "@/contexts/AuthContext"

export default function VendorRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addToast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.businessName.trim()) {
      addToast("Business name is required", "error")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const { success, message } = await vendorApi.register(formData)

      if (success) {
        setIsSuccess(true)
        addToast("Application submitted successfully!", "success")
      } else {
        setError(message || "Failed to submit application")
        addToast(message || "Submission failed", "error")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Application Received!</h1>
          <p className="text-gray-600 leading-relaxed">
            Thank you for applying to be a vendor at LuxaCart. Our admin team will review your application and notify you via email once approved.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-4 bg-[#002147] text-white rounded-xl font-bold tracking-widest uppercase hover:bg-[#003366] transition-all"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#002147] p-10 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              <Store className="w-8 h-8 text-[#eb9a05]" />
            </div>
            <h1 className="text-4xl font-playfair font-black mb-3">Become a Vendor</h1>
            <p className="text-blue-100 opacity-80">Start your luxury business journey with LuxaCart today.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-400 ml-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your store name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none text-gray-900 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-400 ml-1">
                  Business Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your brand and products..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none text-gray-900 font-medium resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[#002147] text-white rounded-2xl font-black tracking-[0.2em] uppercase hover:bg-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Application...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-6 font-medium tracking-wide">
                By submitting, you agree to LuxaCart&apos;s Vendor Terms & Conditions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
