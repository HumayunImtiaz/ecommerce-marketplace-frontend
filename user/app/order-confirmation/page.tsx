"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order") || "ORD-CONFIRMED"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium text-blue-600">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span>
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Confirmation Email</h3>
            <p className="text-sm text-gray-600">
              We&apos;ve sent a confirmation email with your order details.
            </p>
          </div>
          <div className="text-center">
            <Package className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Order Processing</h3>
            <p className="text-sm text-gray-600">
              Your order is being prepared for shipment.
            </p>
          </div>
          <div className="text-center">
            <Truck className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Shipping Updates</h3>
            <p className="text-sm text-gray-600">
              You&apos;ll receive tracking information once your order ships.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account?tab=orders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            View Order Status
          </Link>
          <Link
            href="/products"
            className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your order, our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}