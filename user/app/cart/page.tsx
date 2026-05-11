"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag, ArrowRight, Sparkles, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/contexts/ToastContext"
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
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = Math.max(0, subtotal + tax + shipping - discountAmount)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl border border-[#eb9a05]/10 text-center">
          <div className="w-24 h-24 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-dashed border-[#eb9a05]/30">
            <ShoppingBag className="w-10 h-10 text-gray-200" />
          </div>
          <h1 className="text-4xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Your Selection is Empty</h1>
          <p className="text-gray-500 mb-10 italic leading-relaxed">The luxury you seek is just a selection away. Explore our curated masterpieces.</p>
          <Link href="/products" className="btn-primary py-5 px-12 block uppercase tracking-widest text-xs font-black">
            Explore Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-[#eb9a05]"></div>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">The Boutique</p>
            </div>
            <h1 className="text-5xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Shopping Selection</h1>
          </div>
          <button onClick={clearCart} className="text-[10px] font-black tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Dissolve Selection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-[#eb9a05]/10">
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="p-10 group animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                      <div className="relative w-40 h-48 rounded-3xl overflow-hidden bg-[#f8f9fa] border border-gray-100 flex-shrink-0">
                        <Image src={getImageUrl(item.product.image)} alt={item.product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>

                      <div className="flex-1 space-y-6 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <Link href={`/products/${item.product.slug}`} className="text-2xl font-playfair font-black text-[#002147] hover:text-[#eb9a05] transition-colors leading-tight">
                              {item.product.name}
                            </Link>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-[10px] font-bold uppercase tracking-widest opacity-40">
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            </div>
                          </div>
                          <span className="text-2xl font-black text-[#002147]">${item.product.price}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-50 gap-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center p-1 rounded-2xl border-2 bg-white" style={{ borderColor: 'var(--secondary)' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-3 hover:bg-gray-50 rounded-xl">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                            <button
                              onClick={() => {
                                const avail = (() => {
                                  if (!item.product.variants || item.product.variants.length === 0) return item.product.totalStock || 0
                                  const v = item.product.variants.find(v => (item.selectedColor ? v.color === item.selectedColor : true) && (item.selectedSize ? v.size === item.selectedSize : true))
                                  return v?.stock?.quantity ?? 0
                                })()
                                if (item.quantity < avail) updateQuantity(item.id, item.quantity + 1)
                              }}
                              className="p-3 hover:bg-gray-50 rounded-xl"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-10">
                            <div className="text-right">
                              <p className="text-[10px] font-black tracking-widest uppercase opacity-20 mb-1">Asset Value</p>
                              <p className="text-2xl font-black text-[#002147]">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90">
                              <X className="w-5 h-5" />
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

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#002147] rounded-[3rem] p-10 shadow-2xl sticky top-28 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <h2 className="text-2xl font-playfair font-bold mb-10">Selection Summary</h2>

              {/* Privilege Entry (Coupon) */}
              <div className="mb-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-4 h-4 text-[#eb9a05]" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#eb9a05]">Privilege Entry</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase mb-1">Authenticated Code</p>
                      <p className="text-xl font-black tracking-widest text-white">{appliedCoupon.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#eb9a05] uppercase mb-1">Privilege</p>
                      <p className="text-2xl font-black text-[#eb9a05]">-${discountAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-white/40 font-medium italic leading-relaxed">Navigate to our curated products to apply exclusive privilege codes.</p>
                )}
              </div>

              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-40"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-40"><span>Surcharge (Tax)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-40"><span>Logistics</span><span>{shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#eb9a05]"><span>Privilege Benefit</span><span>-${discountAmount.toFixed(2)}</span></div>
                )}
                <div className="pt-8 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase tracking-[0.3em]">Total Value</span>
                  <span className="text-4xl font-playfair font-black text-[#eb9a05]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full btn-secondary py-6 flex items-center justify-center gap-4 group shadow-2xl">
                <span className="text-sm font-black tracking-[0.2em] uppercase">Advance to Checkout</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Link>

              <Link href="/products" className="block text-center text-xs font-bold tracking-[0.2em] uppercase text-white/40 hover:text-[#eb9a05] mt-8 transition-colors">
                Continue Discovery
              </Link>

              {subtotal < 50 && (
                <div className="mt-8 p-4 bg-[#eb9a05]/10 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-[#eb9a05] tracking-widest uppercase">Add ${(50 - subtotal).toFixed(2)} more for complimentary logistics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
