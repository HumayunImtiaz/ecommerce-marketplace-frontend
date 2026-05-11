"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { useFormik } from "formik"
import * as Yup from "yup"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { authApi } from "@/lib/api"

const loginValidationSchema = Yup.object({
  email: Yup.string().email("Please enter a valid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const { login: authLogin, socialLogin: authSocialLogin, isLoading } = useAuth()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const success = await authLogin(values.email, values.password)
        if (!success) { addToast("Login failed. Please try again.", "error"); return }
        addToast("Welcome back to LuxeCart.", "success")
        router.push("/")
      } catch (error: any) { addToast(error?.message || "Login failed", "error") }
      finally { setSubmitting(false) }
    },
  })

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse?.credential
      if (!idToken) { addToast("Google token not received", "error"); return }
      const { data, success: apiSuccess, message } = await authApi.socialLogin({ provider: "google", token: idToken })
      const loggedInUser = data?.user
      const token = data?.token
      if (!apiSuccess || !loggedInUser || !token) { addToast(message || "Google login failed", "error"); return }
      const sessionSuccess = await authSocialLogin(loggedInUser, token)
      if (!sessionSuccess) { addToast("Failed to save Google login session", "error"); return }
      addToast("Login successful!", "success")
      router.push("/")
    } catch (error: any) { addToast(error?.message || "Google login failed", "error") }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#002147]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>

      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[#eb9a05]/10 relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Secure Login</span>
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#002147] leading-tight">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">
            New to LuxaCart?{" "}
            <Link href="/auth/register" className="text-[#eb9a05] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <form className="space-y-8" onSubmit={formik.handleSubmit}>
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
                className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-gray-50"
                  }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4">
              <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40">Password</label>
              <Link href="/auth/forgot-password" className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-5 w-5 text-[#eb9a05] absolute left-6 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-16 pr-14 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-gray-50"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#eb9a05] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest ml-4">{formik.errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl"
          >
            <span className="text-sm font-black tracking-[0.2em] uppercase">{isLoading || formik.isSubmitting ? "Signing In..." : "Sign In"}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          </button>

          <div className="relative flex items-center justify-center py-4">
            <div className="w-full border-t border-gray-100"></div>
            <span className="absolute bg-white px-4 text-[8px] font-black tracking-[0.3em] uppercase text-gray-300">Or continue with</span>
          </div>

          <div className="flex justify-center">
            <div className="w-full transform hover:scale-105 transition-transform duration-500">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => addToast("Google login failed", "error")}
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}