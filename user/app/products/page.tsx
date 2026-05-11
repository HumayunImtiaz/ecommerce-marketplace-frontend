"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import ProductFilters from "@/components/ProductFilters"
import type { Product, Category } from "@/lib/types"
import { mapProduct, mapCategory } from "@/lib/productMapper"
import { ChevronDown, Grid, List, Sparkles, Loader2, ArrowLeft } from "lucide-react"

import { productApi } from "@/lib/api"
import Link from "next/link"

function ProductsContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [sortOptions, setSortOptions] = useState<{ value: string; label: string }[]>([
    { value: "featured", label: "Featured Selection" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Excellence Rating" },
    { value: "newest", label: "New Arrivals" },
    { value: "name", label: "Name A-Z" },
  ])
  const [filters, setFilters] = useState<{
    category: string
    priceRange: [number, number]
    rating: number
    inStock: boolean
    search: string
  }>({
    category: searchParams.get("category") || "",
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    search: searchParams.get("search") || "",
  })

  const itemsPerPage = 12

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const prodRes = await productApi.getProducts({
          activeOnly: true,
          search: filters.search,
          category: filters.category,
          priceRange: filters.priceRange,
          rating: filters.rating,
          inStock: filters.inStock,
          sortBy: sortBy,
          page: currentPage,
          limit: itemsPerPage,
        })

        if (prodRes.success && Array.isArray(prodRes.data)) {
          const mapped = prodRes.data.map(mapProduct).filter((p): p is Product => p !== null)
          setProducts(mapped)
          if ((prodRes as any).metaDetails) {
            const meta = (prodRes as any).metaDetails
            setTotalPages(meta.totalPages || 1)
            setTotalProducts(meta.totalCount || 0)
            if (meta.categoryCounts) {
              setCategories(prev => prev.map(cat => ({ ...cat, productCount: meta.categoryCounts[cat.id] || 0 })))
            }
            if (meta.sortOptions) setSortOptions(meta.sortOptions)
          } else {
            setTotalPages(1)
            setTotalProducts(mapped.length)
          }
        }
      } catch (err) { console.error("Failed to fetch products:", err) }
      finally { setIsLoading(false) }
    }
    fetchData()
  }, [filters, sortBy, currentPage])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await productApi.getCategories(true)
        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data.map(mapCategory).filter((c): c is Category => c !== null))
        }
      } catch (err) { console.error("Failed to fetch categories:", err) }
    }
    fetchCategories()
  }, [])

  useEffect(() => { setCurrentPage(1) }, [filters, sortBy])

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="mb-12 flex items-center gap-4 text-[10px] font-black tracking-widest uppercase opacity-40">
          <Link href="/" className="hover:text-[#eb9a05] transition-colors">Home</Link>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <span className="text-[#002147]">Collection</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar bg-white rounded-[2.5rem] p-10 shadow-xl border border-[#eb9a05]/10">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-6 bg-[#eb9a05]"></div>
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-[#002147]">Refine</h2>
              </div>
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row justify-between items-end gap-8 mb-12">
                <div className="max-w-xl">
                  <h1 className="text-5xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>
                    {filters.category ? filters.category : "The Entire Collection"}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[10px] font-black tracking-widest uppercase text-[#eb9a05]">
                      <Sparkles className="w-3 h-3" />
                      {totalProducts} Masterpieces Found
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* View Toggle */}
                  <div className="flex bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-[#002147] text-white shadow-xl" : "text-gray-400 hover:text-[#002147]"}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-[#002147] text-white shadow-xl" : "text-gray-400 hover:text-[#002147]"}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sort */}
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-100 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:border-[#eb9a05] focus:shadow-2xl transition-all font-bold text-sm text-[#002147] cursor-pointer shadow-lg"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eb9a05] pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(filters.category || filters.search || filters.rating > 0 || filters.inStock) && (
                <div className="flex flex-wrap gap-3 p-6 bg-white rounded-3xl border border-dashed border-[#eb9a05]/30 animate-fade-in-up">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 mr-2 flex items-center">Active Curation:</span>
                  {filters.category && (
                    <span className="bg-[#002147] text-[#eb9a05] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      {filters.category}
                      <button onClick={() => setFilters({...filters, category: ""})} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="bg-[#002147] text-[#eb9a05] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      &quot;{filters.search}&quot;
                      <button onClick={() => setFilters({...filters, search: ""})} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filters.rating > 0 && (
                    <span className="bg-[#002147] text-[#eb9a05] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      {filters.rating}+ Stars
                      <button onClick={() => setFilters({...filters, rating: 0})} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="bg-[#002147] text-[#eb9a05] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      Buy Now
                      <button onClick={() => setFilters({...filters, inStock: false})} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Content Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] shadow-xl border border-[#eb9a05]/10">
                <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-6" />
                <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#002147] opacity-40">Unveiling Selections...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] shadow-xl border border-[#eb9a05]/10 flex flex-col items-center">
                <div className="w-24 h-24 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-[#eb9a05]/30">
                  <Sparkles className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-3xl font-playfair font-black text-[#002147] mb-4">No Selections Found</h3>
                <p className="text-gray-500 mb-10 max-w-xs mx-auto">Perhaps a different search would yield better results.</p>
                <button
                  onClick={() => setFilters({ category: "", priceRange: [0, 10000], rating: 0, inStock: false, search: "" })}
                  className="btn-primary py-4 px-10"
                >
                  Clear Curation
                </button>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <div className={`grid gap-10 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-20">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-4 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-[#eb9a05] disabled:opacity-20 transition-all group"
                    >
                      <ArrowLeft className="w-5 h-5 text-[#002147] group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-lg ${currentPage === pageNum ? "bg-[#002147] text-[#eb9a05] shadow-2xl scale-110" : "bg-white text-gray-400 border border-gray-100 hover:border-[#eb9a05] hover:text-[#002147]"}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-4 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-[#eb9a05] disabled:opacity-20 transition-all group"
                    >
                      <ChevronRight className="w-5 h-5 text-[#002147] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function X({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
}

function ChevronRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]"><Loader2 className="w-12 h-12 animate-spin text-[#eb9a05]" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}