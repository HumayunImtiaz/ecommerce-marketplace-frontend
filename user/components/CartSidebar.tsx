"use client"

import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { getImageUrl } from "@/lib/utils"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#002147]/60 backdrop-blur-md z-[100] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[101] shadow-2xl transition-transform duration-700 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"} border-l border-[#eb9a05]/20`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-[#eb9a05]/20 flex items-center justify-between bg-[#002147] text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-[#eb9a05]/10 border border-[#eb9a05]/20">
                  <ShoppingBag className="w-6 h-6 text-[#eb9a05]" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#eb9a05] text-[#002147] text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[#002147]">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-playfair font-black uppercase tracking-widest text-white">Your Selection</h2>
                <p className="text-[10px] font-black text-[#eb9a05] tracking-[0.2em] uppercase opacity-80">Elite Curation</p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-3 rounded-2xl bg-white/5 hover:bg-[#eb9a05] hover:text-[#002147] transition-all duration-500 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-[#f8f9fa] rounded-full flex items-center justify-center border-2 border-dashed border-[#eb9a05]/30">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2">Awaiting Excellence</h3>
                  <p className="text-gray-400 text-sm font-medium">Your collection is currently empty.</p>
                </div>
                <button
                  onClick={onClose}
                  className="btn-primary py-4 px-10 text-sm font-bold tracking-widest uppercase"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-6 animate-fade-in-up group">
                  <div className="relative w-28 h-32 rounded-2xl overflow-hidden bg-[#f8f9fa] border border-gray-100 flex-shrink-0">
                    <Image
                      src={getImageUrl(item.product.image)}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <Link href={`/products/${item.product.slug}`} onClick={onClose}>
                        <h4 className="font-playfair font-bold text-lg leading-tight hover:text-[#eb9a05] transition-colors" style={{ color: 'var(--primary)' }}>
                          {item.product.name}
                        </h4>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold" style={{ color: 'var(--primary)' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-black text-[#002147]">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-8 border-t border-gray-100 bg-[#f8f9fa] space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Estimated Total</span>
                <span className="text-3xl font-playfair font-black text-[#002147]">${getCartTotal().toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center">
                Complimentary shipping and premium packaging included.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="btn-primary py-6 text-center text-sm font-black tracking-[0.3em] uppercase shadow-2xl flex items-center justify-center gap-4 group"
                >
                  Complete Purchase
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </Link>
                <button
                  onClick={onClose}
                  className="py-4 text-center text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
