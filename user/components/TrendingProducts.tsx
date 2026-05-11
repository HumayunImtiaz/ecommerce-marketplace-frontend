"use client"

import { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"
import { productApi } from "@/lib/api"
import { TrendingUp } from "lucide-react"

export default function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, success } = await productApi.getProducts({ sortBy: "trending", limit: 4, activeOnly: true })
        if (success && Array.isArray(data)) {
          const active = data.map(mapProduct).filter((p): p is Product => p !== null)
          setTrendingProducts(active)
        }
      } catch { /* Silent fail */ }
    }
    fetchProducts()
  }, [])

  if (trendingProducts.length === 0) return null

  return (
    <section className="py-32 bg-[#002147] relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#eb9a05]/5 -skew-x-12 transform origin-top pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20">
          <div className="max-w-2xl text-center mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-[#eb9a05]/20 text-[#eb9a05]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#eb9a05]">Popular Choice</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-playfair font-black text-white leading-tight mb-6">
              Trending Now
            </h2>
            <p className="text-white/50 max-w-sm text-center mx-auto font-medium">
              Check out what's popular right now. These products are flying off our shelves!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {trendingProducts.map((product, idx) => (
            <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}