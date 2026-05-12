"use client"

import Link from "next/link"
import { ShieldX, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Please contact support if you believe this is an error.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#002147] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#003366] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
