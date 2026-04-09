"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
          const active = data
            .map(mapProduct)
            .filter((p): p is Product => p !== null)
          setProducts(active)
        }
      } catch {
        // Silent fail
      }
    }
    fetchProducts()
  }, [])

  // Pehle 9 products featured section mein dikhao
  const featuredProducts = products.slice(0, 9)

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage >= featuredProducts.length ? 0 : prev + itemsPerPage
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, featuredProducts.length - itemsPerPage)
        : prev - itemsPerPage
    )
  }

  useEffect(() => {
    if (featuredProducts.length === 0) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [featuredProducts.length])

  if (featuredProducts.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Handpicked products just for you
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts
              .slice(currentIndex, currentIndex + itemsPerPage)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>

          {featuredProducts.length > itemsPerPage && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-blue-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-blue-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}