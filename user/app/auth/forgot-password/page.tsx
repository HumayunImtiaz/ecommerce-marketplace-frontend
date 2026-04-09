"use client"

import type React from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useFormik, type FormikHelpers } from "formik"
import * as Yup from "yup"

import { authApi } from "@/lib/api"
import { useToast } from "@/contexts/ToastContext"

type ForgotPasswordFormValues = {
  email: string
}

const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
})

export default function ForgotPasswordPage() {
  const { addToast } = useToast()

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (
      values: ForgotPasswordFormValues,
      { setSubmitting, resetForm }: FormikHelpers<ForgotPasswordFormValues>
    ) => {
      try {
        const response = await authApi.forgotPassword(values.email)

        if (!response?.success) {
          addToast(response?.message || "Failed to send reset link", "error")
          return
        }

        addToast(response.message || "Password reset link sent successfully", "success")
        resetForm()
        return
      } catch (error: any) {
        addToast(error?.message || "Failed to send reset link", "error")
        return
      } finally {
        setSubmitting(false)
      }
    },
  })

  const emailError =
    formik.touched.email && formik.errors.email ? formik.errors.email : undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we’ll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
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
                className={`input-field pl-10 ${emailError ? "border-red-500" : ""}`}
                placeholder="Enter your email"
              />
            </div>

            {emailError ? <p className="mt-1 text-sm text-red-600">{emailError}</p> : null}
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Sending..." : "Send reset link"}
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