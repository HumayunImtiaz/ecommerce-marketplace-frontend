"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"

const registerValidationSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Please enter a valid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm password is required"),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register(values.name, values.email, values.password)
        addToast("Registration successful. Please verify your email.", "success")
        router.push("/auth/login")
      } catch (error: any) { addToast(error?.message || "Registration failed", "error") }
      finally { setSubmitting(false) }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#002147]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>

      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[#eb9a05]/10 relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Get Started</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">User Registration</h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">
            Already a member?{" "}
            <Link href="/auth/login" className="text-[#eb9a05] hover:underline">Sign In</Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Full Name</label>
              <div className="relative">
                <User className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
                <input
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.name && formik.errors.name ? "border-red-400" : "border-gray-50"}`}
                />
              </div>
              {formik.touched.name && formik.errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Email Address</label>
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

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-4">Password</label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your password"
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-14 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-gray-50"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#eb9a05] transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.password}</p>}
            </div>

            {/* Confirm Password */}
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
                  placeholder="Confirm your password"
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-14 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-400" : "border-gray-50"}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#eb9a05] transition-colors">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl mt-8"
          >
            <span className="text-sm font-black tracking-[0.2em] uppercase">{isLoading || formik.isSubmitting ? "Creating Account..." : "Create Account"}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          </button>
        </form>
      </div>
    </div>
  )
}