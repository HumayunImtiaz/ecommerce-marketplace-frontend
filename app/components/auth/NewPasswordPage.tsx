"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useToast } from "@/contexts/ToastContext"
import { resetAdminPassword } from "@/lib/admin-auth-api"
import "./Style.css"

const resetSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
})

const NewPasswordPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [isSuccess, setIsSuccess] = React.useState(false)

  const token = useMemo(() => searchParams.get("token") || "", [searchParams])

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: resetSchema,
    onSubmit: async (values) => {
      if (!token) {
        addToast("Invalid or missing reset token", "error")
        return
      }

      try {
        const response = await resetAdminPassword({
          token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        })

        addToast(response?.message || "Password reset successful", "success")
        setIsSuccess(true)

        setTimeout(() => {
          router.push("/login")
        }, 1200)
      } catch (error: any) {
        addToast(error?.message || "Failed to reset password", "error")
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
            Your password has been reset successfully. Redirecting to login...
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input-field pl-10 ${
                      formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : ""
                    }`}
                    placeholder="Enter new password"
                  />
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input-field pl-10 ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? "Updating..." : "Update Password"}
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

export default NewPasswordPage