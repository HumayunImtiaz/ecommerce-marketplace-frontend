"use client"

import React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import "./Style.css"

const otpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
})

const VerifyOtpPage = () => {
  const [submitted, setSubmitted] = React.useState(false)

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    onSubmit: async (_values) => {
      // API call yahan lagana hai
      setSubmitted(true)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
            OTP verified! You may now set a new password.
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  value={formik.values.otp}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field ${
                    formik.touched.otp && formik.errors.otp ? "border-red-500" : ""
                  }`}
                  placeholder="Enter 6-digit OTP"
                />
                {formik.touched.otp && formik.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.otp}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default VerifyOtpPage