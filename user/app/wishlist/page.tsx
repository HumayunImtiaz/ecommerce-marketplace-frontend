"use client"

import Link from "next/link"
import { Heart, Loader2, Sparkles, Trash2 } from "lucide-react"
import { useWishlist } from "@/contexts/WishlistContext"
import ProductCard from "@/components/ProductCard"

export default function WishlistPage() {
  const { items, clearWishlist, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#002147] opacity-40">Consulting Your Gallery...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl border border-[#eb9a05]/10 text-center">
          <div className="w-24 h-24 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-dashed border-[#eb9a05]/30">
            <Heart className="w-10 h-10 text-gray-200" />
          </div>
          <h1 className="text-4xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Gallery of Desires</h1>
          <p className="text-gray-500 mb-10 italic leading-relaxed">Your curated collection awaits its first masterpiece. Save items that resonate with your soul.</p>
          <Link href="/products" className="btn-primary py-5 px-12 block uppercase tracking-widest text-xs font-black">
            Discover Masterpieces
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
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">Your Gallery</p>
            </div>
            <h1 className="text-5xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Private Collection</h1>
            <div className="flex items-center gap-3 mt-4">
               <div className="px-3 py-1 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[8px] font-black tracking-widest uppercase text-[#eb9a05] flex items-center gap-2">
                 <Sparkles className="w-3 h-3" />
                 {items.length} Saved Assets
               </div>
            </div>
          </div>
          <button onClick={clearWishlist} className="text-[10px] font-black tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Release All Assets
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {items.map((product) => (
            <div key={product.id} className="animate-fade-in-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
