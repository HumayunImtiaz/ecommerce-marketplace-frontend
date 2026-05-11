"use client"

import type React from "react"
import Link from "next/link"
import { Mail, Sparkles, ArrowRight } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { authApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"

const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string().email("Please enter a valid email address").required("Email is required"),
})

export default function ForgotPasswordPage() {
  const { addToast } = useToast()

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await authApi.forgotPassword(values.email)
        if (!response?.success) { addToast(response?.message || "Failed to send reset link", "error"); return }
        addToast(response.message || "Recovery link dispatched to your email.", "success")
        resetForm()
      } catch (error: any) { addToast(error?.message || "Failed to send reset link", "error") }
      finally { setSubmitting(false) }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      
      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[#eb9a05]/10 relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Access Recovery</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">Key Retrieval</h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">Enter your authorized email to receive a recovery link.</p>
        </div>

        <form className="space-y-8" onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Authorized Email</label>
            <div className="relative">
              <Mail className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your email"
                className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-gray-50"}`}
              />
            </div>
            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl"
          >
            <span className="text-sm font-black tracking-[0.2em] uppercase">{formik.isSubmitting ? "Dispatching..." : "Dispatch Recovery Link"}</span>
            {!formik.isSubmitting && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          </button>

          <div className="text-center">
            <Link href="/auth/login" className="text-[10px] font-black tracking-widest uppercase text-gray-400 hover:text-[#eb9a05] transition-colors">
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}