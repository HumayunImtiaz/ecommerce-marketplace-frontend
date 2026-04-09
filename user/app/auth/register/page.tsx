"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useFormik, type FormikHelpers } from "formik"
import * as Yup from "yup"

import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"

type RegisterFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const registerValidationSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (
      values: RegisterFormValues,
      { setSubmitting }: FormikHelpers<RegisterFormValues>
    ) => {
      try {
        await register(values.name, values.email, values.password)

      addToast("Registration successful. Please verify your email.", "success")
      router.push("/auth/login")
      return

    } catch (error: any) {
      addToast(error?.message || "Registration failed", "error")
      return
    } finally {
        setSubmitting(false)
      }
    },
  })

  const getInputError = (
    fieldName: keyof RegisterFormValues
  ): string | undefined => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : undefined
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 ${getInputError("name") ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
              </div>
              {getInputError("name") ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
              ) : null}
            </div>

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
                  className={`input-field pl-10 ${getInputError("email") ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
              {getInputError("email") ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              ) : null}
            </div>

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
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`input-field pl-10 pr-10 ${getInputError("password") ? "border-red-500" : ""}`}
                  placeholder="Enter your password"
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
                Confirm Password
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
                  placeholder="Confirm your password"
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
              disabled={isLoading || formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || formik.isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}