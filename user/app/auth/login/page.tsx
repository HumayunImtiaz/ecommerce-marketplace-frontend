"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { FormikHelpers } from "formik"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { useFormik } from "formik"
import * as Yup from "yup"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { authApi } from "@/lib/api"

const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const { login: authLogin, socialLogin: authSocialLogin, isLoading } = useAuth()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  type LoginFormValues = {
    email: string
    password: string
  }

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const success = await authLogin(values.email, values.password)
        if (!success) {
          addToast("Login failed. Please try again.", "error")
          return
        }
        addToast("Login successful!", "success")
        router.push("/")
      } catch (error: any) {
        addToast(error?.message || "Login failed", "error")
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse?.credential
      if (!idToken) {
        addToast("Google token not received", "error")
        return
      }

      const { data, success: apiSuccess, message } = await authApi.socialLogin({
        provider: "google",
        token: idToken,
      })

      const loggedInUser = data?.user
      const token = data?.token

      if (!apiSuccess || !loggedInUser || !token) {
        addToast(message || "Google login failed", "error")
        return
      }

      const sessionSuccess = await authSocialLogin(loggedInUser, token)

      if (!sessionSuccess) {
        addToast("Failed to save Google login session", "error")
        return
      }

      addToast("Login successful!", "success")
      router.push("/")
    } catch (error: any) {
      addToast(error?.message || "Google login failed", "error")
    }
  }

  const getInputError = (fieldName: "email" | "password") => {
    return formik.touched[fieldName] && formik.errors[fieldName]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Or{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  getInputError("email") ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  getInputError("password") ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* 👁 Eye Button FIXED */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading || formik.isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {/* Google */}
          <div className="flex justify-center pt-2">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => addToast("Google login failed", "error")}
            />
          </div>
        </form>
      </div>
    </div>
  )
}