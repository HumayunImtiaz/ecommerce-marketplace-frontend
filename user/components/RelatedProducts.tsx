"use client"

import { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"

interface RelatedProductsProps {
  currentProduct: Product
}

import { productApi } from "@/lib/api"

export default function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data, success } = await productApi.getProducts()

        if (success && Array.isArray(data)) {
          const related = data
            .filter(
              (p: any) =>
                (p.id ?? p._id)?.toString() !== currentProduct.id &&
                p.isActive !== false &&
                (p.category?.name ?? p.category) === currentProduct.category
            )
            .slice(0, 4)
            .map(mapProduct)
            .filter((p): p is Product => p !== null)

          setRelatedProducts(related)
        }
      } catch {
        console.error("Error fetching related products")
      }
    }

    fetchRelated()
  }, [currentProduct.id, currentProduct.category])

  if (relatedProducts.length === 0) return null

  return (
    <section>
      <h2 className="text-2xl font-bold mb-8">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}