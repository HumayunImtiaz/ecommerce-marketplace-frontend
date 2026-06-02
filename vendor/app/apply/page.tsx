"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Store, Sparkles, ArrowRight, Building2, FileText } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { vendorApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"
import { useAuth } from "@/contexts/AuthContext"

const applyValidationSchema = Yup.object({
  businessName: Yup.string().required("Business name is required").min(3, "Too short"),
  description: Yup.string().required("Description is required").min(10, "Please provide more details"),
})

export default function ApplyPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingVendor, setExistingVendor] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const { data, success } = await vendorApi.getProfile()
        if (success && data) {
          setExistingVendor(data)
        }
      } catch (err) {
        // 404 means no application yet, which is fine
      } finally {
        setIsChecking(false)
      }
    }
    if (user) checkExisting()
    else setIsChecking(false)
  }, [user])

  const formik = useFormik({
    initialValues: { businessName: "", description: "" },
    validationSchema: applyValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true)
        const response = await vendorApi.register(values)
        if (response.success) {
          addToast("Application submitted successfully! Please wait for admin approval.", "success")
          router.push("/login") // Or a status page
        } else {
          addToast(response.message || "Failed to submit application", "error")
        }
      } catch (error: any) {
        addToast(error?.message || "An error occurred", "error")
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (!user || isChecking) return null

  if (existingVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#002147]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>

        <div className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-[#eb9a05]/10 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#002147]/10 border border-[#002147]/20 text-[#002147] mb-6">
            <Store className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Application Status</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">
            {existingVendor.status === "PENDING" ? "Application Pending" : "Account Suspended"}
          </h2>
          <p className="text-gray-500 text-sm mt-6 leading-relaxed">
            {existingVendor.status === "PENDING" 
              ? "Your application for " + existingVendor.businessName + " is currently being reviewed by our administrators. We'll notify you via email once it's approved."
              : "Your vendor account for " + existingVendor.businessName + " has been suspended. Please contact support for more information."
            }
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#002147] text-white py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl mt-12 hover:bg-[#002147]/90 transition-all font-black uppercase tracking-widest text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#002147]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>

      <div className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-[#eb9a05]/10 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#002147]/10 border border-[#002147]/20 text-[#002147] mb-6">
            <Store className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Vendor Partnership</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">Apply for Shop</h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">
            Welcome, {user.name}! Tell us about your business.
          </p>
        </div>

        <div className="space-y-8">
          {/* Business Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Business Name</label>
            <div className="relative">
              <Building2 className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
              <input
                name="businessName"
                type="text"
                value={formik.values.businessName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Shop Name"
                className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white transition-all font-bold text-sm ${formik.touched.businessName && formik.errors.businessName ? "border-red-400" : "border-gray-50"}`}
              />
            </div>
            {formik.touched.businessName && formik.errors.businessName && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.businessName}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Business Description</label>
            <div className="relative">
              <FileText className="h-5 w-5 text-[#eb9a05] absolute left-6 top-6" />
              <textarea
                name="description"
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="What do you sell?"
                className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white transition-all font-bold text-sm min-h-[150px] ${formik.touched.description && formik.errors.description ? "border-red-400" : "border-gray-50"}`}
              />
            </div>
            {formik.touched.description && formik.errors.description && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.description}</p>}
          </div>

          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={isSubmitting}
            className="w-full bg-[#002147] text-white py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl mt-8 hover:bg-[#002147]/90 transition-all font-black uppercase tracking-widest"
          >
            <span className="text-sm">{isSubmitting ? "Submitting..." : "Submit Application"}</span>
            {!isSubmitting && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          </button>
        </div>
      </div>
    </div>
  )
}
