"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { mapCategory } from "@/lib/productMapper"
import type { Category } from "@/lib/types"
import { productApi } from "@/lib/api"
import { ArrowRight } from "lucide-react"

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, success } = await productApi.getCategories()
        if (success && Array.isArray(data)) {
          setCategories(data.filter((c: any) => c.isActive !== false).map(mapCategory).filter((c): c is Category => c !== null))
        }
      } catch { /* Silent fail */ }
    }
    fetchCategories()
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="py-32 bg-[#f8f9fa]">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-[#eb9a05]"></div>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#eb9a05]">Collections</p>
            <div className="h-px w-8 bg-[#eb9a05]"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-playfair font-black leading-tight mb-6" style={{ color: 'var(--primary)' }}>
            Shop by Category
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">Explore our wide range of categories and find exactly what you're looking for.</p>
          <Link href="/categories" className="inline-flex items-center gap-3 font-bold text-sm tracking-widest uppercase pb-2 border-b-2 border-[#eb9a05]/30 hover:border-[#eb9a05] transition-all">
            View All Categories
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {categories.slice(0, 6).map((category, idx) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative flex flex-col items-center p-6 rounded-[2rem] transition-all duration-500 bg-white shadow-sm hover:shadow-2xl border border-[#eb9a05]/10 hover:border-[#eb9a05] animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-4 bg-[#f8f9fa] border-2 border-transparent group-hover:border-[#eb9a05] transition-all transform group-hover:scale-110 shadow-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-playfair text-base font-bold transition-colors group-hover:text-[#eb9a05] text-center" style={{ color: 'var(--primary)' }}>
                {category.name}
              </span>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-[2rem] bg-[#eb9a05]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}