"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/contexts/ToastContext"
import { orderApi } from "@/lib/api"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const { addToast } = useToast()

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping - discount

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      addToast("Please enter a promo code", "error")
      return
    }

    setIsApplyingPromo(true)
    try {
      const result = await orderApi.validateCoupon(promoCode, subtotal)
      if (result.success && result.data) {
        const coupon = result.data
        let discountAmount = 0
        if (coupon.discountType === "percentage") {
          discountAmount = (subtotal * coupon.discountValue) / 100
        } else {
          discountAmount = coupon.discountValue
        }
        setDiscount(discountAmount)
        addToast(`Promo code "${coupon.code}" applied!`, "success")
      } else {
        addToast(result.message || "Invalid promo code", "error")
        setDiscount(0)
      }
    } catch (error) {
      addToast("Failed to validate promo code", "error")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                <button onClick={clearCart} className="text-red-600 hover:text-red-800 text-sm">
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={100}
                      height={100}
                      className="rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-lg font-semibold hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-600 mt-1">${item.product.price}</p>

                      {item.selectedColor && <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>}
                      {item.selectedSize && <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>}

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center mt-1"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Promo Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 input-field uppercase font-mono"
                  disabled={isApplyingPromo}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                  className="btn-secondary disabled:opacity-50"
                >
                  {isApplyingPromo ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>

            {/* Order Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="w-full btn-primary flex items-center justify-center space-x-2">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Continue Shopping */}
            <Link href="/products" className="block text-center text-blue-600 hover:text-blue-800 mt-4">
              Continue Shopping
            </Link>

            {/* Free Shipping Notice */}
            {subtotal < 50 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
