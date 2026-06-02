"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { authApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"

const resetPasswordValidationSchema = Yup.object({
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm password is required"),
})

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const token = searchParams.get("token") || ""

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (!token) { addToast("Invalid or missing token", "error"); return }
        const response = await authApi.resetPassword(token, { password: values.password, confirmPassword: values.confirmPassword })
        if (!response?.success) { addToast(response?.message || "Failed to reset password", "error"); return }
        addToast("Access key successfully regenerated.", "success")
        resetForm(); router.push("/auth/login")
      } catch (error: any) { addToast(error?.message || "Failed to reset password", "error") }
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
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Security Update</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">Reset Password</h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">Create your new password below.</p>
        </div>

        <form className="space-y-8" onSubmit={formik.handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">New Password</label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter new password"
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-14 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-gray-50"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#eb9a05]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Confirm Password</label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm new key"
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-14 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-400" : "border-gray-50"}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#eb9a05]">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl"
          >
            <span className="text-sm font-black tracking-[0.2em] uppercase">{formik.isSubmitting ? "Regenerating..." : "Regenerate Key"}</span>
            {!formik.isSubmitting && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-[10px] font-black tracking-widest uppercase text-gray-400 hover:text-[#eb9a05] transition-colors">
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#eb9a05]" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
