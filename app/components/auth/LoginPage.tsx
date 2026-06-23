"use client"



import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"
import { toast } from "sonner"
import { adminLoginAction } from "@/app/actions/auth.actions"
import "./Style.css"

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {

        const result = await adminLoginAction(values.email, values.password)

        if (!result.success) {
          toast.error(result.message)
          return
        }

        toast.success("Login successful!")
        router.replace("/admin/dashboard")
      } catch {
        toast.error("Something went wrong. Please try again.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  const fieldError = (field: "email" | "password") =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 py-8 relative overflow-hidden">
      {/* Premium Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#002147]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#eb9a05]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>

      <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,33,71,0.1)] border border-[#eb9a05]/10 relative z-10 transition-all duration-500">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Secure Login</span>
          </div>
          <h2 className="text-3xl font-black text-[#002147] tracking-tight">Admin Portal</h2>
          <p className="text-sm font-medium text-gray-400 mt-2 tracking-wide">Secure access for authorized personnel</p>
        </div>

        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold tracking-widest text-[#002147] uppercase opacity-70 ml-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#eb9a05]" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all ${fieldError("email") ? "border-red-400" : "border-gray-50"
                    }`}
                  placeholder="admin@luxacart.com"
                />
              </div>
              {fieldError("email") && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-2">{fieldError("email")}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-2 mr-2">
                <label htmlFor="password" className="block text-xs font-bold tracking-widest text-[#002147] uppercase opacity-70">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#eb9a05]" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-12 pr-12 py-3 text-sm font-medium focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all ${fieldError("password") ? "border-red-400" : "border-gray-50"
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-[#eb9a05] transition-colors"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
              {fieldError("password") && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-2">{fieldError("password")}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#002147] hover:bg-[#00152e] text-white text-sm font-bold tracking-[0.1em] uppercase shadow-lg shadow-[#002147]/20 transition-all focus:outline-none focus:ring-4 focus:ring-[#002147]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Authenticating..." : "Sign in securely"}
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-gray-100"></div>
              <span className="absolute bg-white px-4 text-[10px] font-black tracking-widest uppercase text-gray-400">Quick Access</span>
            </div>

            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("email", "admin@luxacart.com")
                formik.setFieldValue("password", "admin123")
              }}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-[#002147]/10 via-[#002147]/5 to-[#eb9a05]/5 border-2 border-[#002147]/30 hover:border-[#002147] hover:shadow-md hover:from-[#002147]/20 hover:to-[#002147]/10 text-[#002147] transition-all group relative overflow-hidden"
            >
              <Shield className="w-4 h-4 text-[#002147] animate-pulse" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase relative z-10">
                <span className="text-[#eb9a05] group-hover:text-[#002147] transition-colors">One-Click</span>{" "}
                <span className="text-[#002147] group-hover:text-[#eb9a05] transition-colors">Demo Login</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage