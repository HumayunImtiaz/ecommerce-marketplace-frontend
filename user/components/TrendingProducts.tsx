"use client"

import { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"

import { productApi } from "@/lib/api"

export default function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, success } = await productApi.getProducts({ sortBy: "trending", limit: 4, activeOnly: true })
        if (success && Array.isArray(data)) {
          const active = data
            .map(mapProduct)
            .filter((p): p is Product => p !== null)
          setTrendingProducts(active)
        }
      } catch {
        // Silent fail
      }
    }
    fetchProducts()
  }, [])

  if (trendingProducts.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🔥 Trending Now
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Check out what&apos;s popular right now. These products are flying off our shelves!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}