"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import ProductCard from "./ProductCard"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"
import { productApi } from "@/lib/api"

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, success } = await productApi.getProducts({ isFeatured: true, activeOnly: true })
        if (success && Array.isArray(data)) {
          const active = data.map(mapProduct).filter((p): p is Product => p !== null)
          setProducts(active)
        }
      } catch { /* Silent fail */ }
    }
    fetchProducts()
  }, [])

  const featuredProducts = products.slice(0, 9)

  const nextSlide = () => {
    setCurrentIndex((prev) => prev + itemsPerPage >= featuredProducts.length ? 0 : prev + itemsPerPage)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? Math.max(0, featuredProducts.length - itemsPerPage) : prev - itemsPerPage)
  }

  if (featuredProducts.length === 0) return null

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#eb9a05]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#eb9a05]/20 bg-[#eb9a05]/5 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#eb9a05]" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#eb9a05]">Featured Collection</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>
            Featured Products
          </h2>
          <p className="text-lg opacity-50 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover our top-rated products selected for quality and value.
          </p>
        </div>

        <div className="relative group/carousel">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredProducts.slice(currentIndex, currentIndex + itemsPerPage).map((product, idx) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {featuredProducts.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-6 mt-16">
              <button 
                onClick={prevSlide}
                className="p-4 rounded-full border border-[#eb9a05]/20 text-[#002147] hover:bg-[#002147] hover:text-[#eb9a05] transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {[...Array(Math.ceil(featuredProducts.length / itemsPerPage))].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === Math.floor(currentIndex / itemsPerPage) ? "w-10 bg-[#eb9a05]" : "w-3 bg-gray-200"}`}
                  ></div>
                ))}
              </div>
              <button 
                onClick={nextSlide}
                className="p-4 rounded-full border border-[#eb9a05]/20 text-[#002147] hover:bg-[#002147] hover:text-[#eb9a05] transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}