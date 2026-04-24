"use client"

import { X, Plus, Minus, ShoppingBag, Sparkles, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { getImageUrl } from "@/lib/utils"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart()

  return (
    <>
      {/* Enhanced Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mr-3">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              Shopping Cart ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some amazing products to get started!</p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-xl object-cover shadow-sm"
                        />
                        {item.product.isFeatured && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                            ⭐
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{item.product.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-blue-600">${item.product.price}</span>
                          {item.product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${item.product.originalPrice}</span>
                          )}
                        </div>

                        {/* Product Options */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.selectedColor && (
                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium border">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium border">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>

                        {/* Enhanced Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    View Full Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <span>Checkout Now</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                {/* Free Shipping Notice */}
                {getCartTotal() < 50 && (
                  <div className="bg-blue-100 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-blue-800 font-medium">
                      🚚 Add ${(50 - getCartTotal()).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
