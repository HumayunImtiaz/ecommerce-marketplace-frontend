"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react"
import { useFormik, type FormikHelpers } from "formik"
import * as Yup from "yup"

import { authApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"

type ResetPasswordFormValues = {
  password: string
  confirmPassword: string
}

const resetPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get("token") || ""

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (
      values: ResetPasswordFormValues,
      { setSubmitting, resetForm }: FormikHelpers<ResetPasswordFormValues>
    ) => {
      try {
        if (!token) {
          addToast("Invalid or missing token", "error")
          return
        }

        const response = await authApi.resetPassword(token, {
          password: values.password,
          confirmPassword: values.confirmPassword,
        })

        if (!response?.success) {
          addToast(response?.message || "Failed to reset password", "error")
          return
        }

        addToast(response.message || "Password reset successful", "success")
        resetForm()
        router.push("/auth/login")
        return
      } catch (error: any) {
        addToast(error?.message || "Failed to reset password", "error")
        return
      } finally {
        setSubmitting(false)
      }
    },
  })

  const getInputError = (
    fieldName: keyof ResetPasswordFormValues
  ): string | undefined => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : undefined
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 pr-10 ${getInputError("password") ? "border-red-500" : ""}`}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {getInputError("password") ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>

              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 pr-10 ${getInputError("confirmPassword") ? "border-red-500" : ""}`}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {getInputError("confirmPassword") ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              ) : null}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}