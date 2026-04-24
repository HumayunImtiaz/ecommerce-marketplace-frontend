"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/contexts/ToastContext"
import { orderApi } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart,
    appliedCoupon,
    discountAmount
  } = useCart()

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = Math.max(0, subtotal + tax + shipping - discountAmount)


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
                      src={getImageUrl(item.product.image)}
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
                            onClick={() => {
                              const avail = (() => {
                                if (!item.product.variants || item.product.variants.length === 0) return item.product.totalStock || 0
                                const v = item.product.variants.find(v => 
                                  (item.selectedColor ? v.color === item.selectedColor : true) &&
                                  (item.selectedSize ? v.size === item.selectedSize : true)
                                )
                                return v?.stock?.quantity ?? 0
                              })()
                              if (item.quantity < avail) {
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            }}
                            disabled={(() => {
                              const avail = (() => {
                                if (!item.product.variants || item.product.variants.length === 0) return item.product.totalStock || 0
                                const v = item.product.variants.find(v => 
                                  (item.selectedColor ? v.color === item.selectedColor : true) &&
                                  (item.selectedSize ? v.size === item.selectedSize : true)
                                )
                                return v?.stock?.quantity ?? 0
                              })()
                              return item.quantity >= avail
                            })()}
                            className={`p-2 ${(() => {
                              const avail = (() => {
                                if (!item.product.variants || item.product.variants.length === 0) return item.product.totalStock || 0
                                const v = item.product.variants.find(v => 
                                  (item.selectedColor ? v.color === item.selectedColor : true) &&
                                  (item.selectedSize ? v.size === item.selectedSize : true)
                                )
                                return v?.stock?.quantity ?? 0
                              })()
                              return item.quantity >= avail
                            })() ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stock warning */}
                        {(() => {
                           const avail = (() => {
                                if (!item.product.variants || item.product.variants.length === 0) return item.product.totalStock || 0
                                const v = item.product.variants.find(v => 
                                  (item.selectedColor ? v.color === item.selectedColor : true) &&
                                  (item.selectedSize ? v.size === item.selectedSize : true)
                                )
                                return v?.stock?.quantity ?? 0
                              })()
                           return item.quantity >= avail && (
                             <p className="text-[10px] text-amber-600 font-bold mt-1">Max stock reached</p>
                           )
                        })()}

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

            {/* Coupon Section (Informational) */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-700">Promo Code</label>
              {appliedCoupon ? (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Applied Coupon</p>
                    <p className="text-lg font-black text-blue-800">{appliedCoupon.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-blue-400 font-bold uppercase">Saving</p>
                    <p className="text-xl font-black text-blue-600">-${discountAmount.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-sm text-slate-500">Apply coupons on the Product Detail Page to get discounts.</p>
                </div>
              )}
            </div>

            {/* Order Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
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
