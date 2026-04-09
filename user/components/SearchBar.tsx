"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { productApi } from "@/lib/api"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch products once on mount for searching
  useEffect(() => {
    const loadProducts = async () => {
      const { data, success } = await productApi.getProducts(true)
      if (success && Array.isArray(data)) {
        setAllProducts(
          data
            .map(mapProduct)
            .filter((p): p is Product => p !== null)
        )
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    if (query.trim() && allProducts.length > 0) {
      const filtered = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 5)
      setResults(filtered)
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, allProducts])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => {
                setIsOpen(false)
                setQuery("")
              }}
              className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={40}
                height={40}
                className="rounded object-cover"
              />
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">${product.price}</p>
              </div>
            </Link>
          ))}
          {query && (
            <Link
              href={`/products?search=${encodeURIComponent(query)}`}
              onClick={() => {
                setIsOpen(false)
                setQuery("")
              }}
              className="block p-3 text-center text-blue-600 hover:bg-gray-50 border-t border-gray-100"
            >
              View all results for "{query}"
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
