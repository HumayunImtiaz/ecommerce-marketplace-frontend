"use client"

import React from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useToast } from "@/contexts/ToastContext"
import { forgotAdminPassword } from "@/lib/admin-auth-api"
import "./Style.css"

const forgotSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
})

const ForgotPasswordPage = () => {
  const { addToast } = useToast()
  const [submitted, setSubmitted] = React.useState(false)

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotSchema,
    onSubmit: async (values) => {
      try {
        const response = await forgotAdminPassword({ email: values.email })
        addToast(response?.message || "Reset link sent successfully", "success")
        setSubmitted(true)
      } catch (error: any) {
        addToast(error?.message || "Failed to send reset link", "error")
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
            Password reset link has been sent to your email.
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
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
                    className={`input-field pl-10 ${
                      formik.touched.email && formik.errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage