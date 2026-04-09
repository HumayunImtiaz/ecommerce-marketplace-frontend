"use client"



import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 ${fieldError("email") ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldError("email") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("email")}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 pr-10 ${fieldError("password") ? "border-red-500" : ""}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword
                    ? <EyeOff className="h-5 w-5 text-gray-400" />
                    : <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
              {fieldError("password") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("password")}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage