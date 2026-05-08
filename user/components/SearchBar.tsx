"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
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
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadProducts = async () => {
      const { data, success } = await productApi.getProducts({ activeOnly: true })
      if (success && Array.isArray(data)) {
        setAllProducts(data.map(mapProduct).filter((p): p is Product => p !== null))
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    if (query.trim() && allProducts.length > 0) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = allProducts.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3)
        setResults(filtered)
        setIsOpen(true)
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
      setIsOpen(false)
      setIsSearching(false)
    }
  }, [query, allProducts])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-[#eb9a05]" style={{ color: 'var(--primary)', opacity: 0.4 }} />
        <input 
          type="text" 
          placeholder="Search for perfection..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-12 py-3 rounded-2xl bg-[#f8f9fa] border border-[#e2e8f0] focus:border-[#eb9a05] focus:bg-white focus:shadow-2xl transition-all font-medium text-sm text-[#002147] placeholder:text-gray-400"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-[#eb9a05]" />}
          {query && !isSearching && (
            <button onClick={() => { setQuery(""); setIsOpen(false) }} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-4 h-4 opacity-40 hover:opacity-100" />
            </button>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl z-[100] p-4 border border-[#eb9a05]/10 animate-fade-in-up">
          <div className="p-3 border-b border-gray-50 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eb9a05]">Top Suggestions</p>
          </div>
          <div className="space-y-2">
            {results.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                onClick={() => { setIsOpen(false); setQuery("") }}
                className="flex items-center p-3 rounded-2xl hover:bg-[#f8f9fa] transition-all group"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f8f9fa] border border-gray-100">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-bold truncate group-hover:text-[#eb9a05] transition-colors" style={{ color: 'var(--primary)' }}>{product.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#eb9a05] mt-1">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
          {query && (
            <Link 
              href={`/products?search=${encodeURIComponent(query)}`}
              onClick={() => { setIsOpen(false); setQuery("") }}
              className="block mt-4 p-4 text-center text-xs font-black tracking-widest uppercase rounded-2xl bg-[#002147] text-[#eb9a05] hover:bg-[#002b5c] transition-all shadow-xl"
            >
              See all results
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
