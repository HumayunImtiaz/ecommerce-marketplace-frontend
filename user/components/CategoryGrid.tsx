"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { mapCategory } from "@/lib/productMapper"
import type { Category } from "@/lib/types"

import { productApi } from "@/lib/api"

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, success } = await productApi.getCategories()
        if (success && Array.isArray(data)) {
          setCategories(
            data
              .filter((c: any) => c.isActive !== false)
              .map(mapCategory)
              .filter((c): c is Category => c !== null)
          )
        }
      } catch {
        // Silent fail
      }
    }
    fetchCategories()
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you&apos;re looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-3 group-hover:shadow-md transition-shadow">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium text-gray-800 text-center text-sm group-hover:text-blue-600 transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}