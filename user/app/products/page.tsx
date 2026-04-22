"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import ProductFilters from "@/components/ProductFilters"
import type { Product, Category } from "@/lib/types"
import { mapProduct, mapCategory } from "@/lib/productMapper"
import { ChevronDown, Grid, List, Sparkles, Loader2 } from "lucide-react"

import { productApi } from "@/lib/api"

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
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
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

  // ── Fetch data whenever filters, sort or page changes ──────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch products with backend filters
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
          const mapped = prodRes.data
            .map(mapProduct)
            .filter((p): p is Product => p !== null)
          setProducts(mapped)

          // Handle backend metadata for results summary & pagination
          if ((prodRes as any).metaDetails) {
            const meta = (prodRes as any).metaDetails
            setTotalPages(meta.totalPages || 1)
            setTotalProducts(meta.totalCount || 0)

            // Update dynamic category counts in sidebar
            if (meta.categoryCounts) {
              setCategories(prev => prev.map(cat => ({
                ...cat,
                productCount: meta.categoryCounts[cat.id] || 0
              })))
            }

            // Update dynamic sorting options if provided
            if (meta.sortOptions) {
              setSortOptions(meta.sortOptions)
            }
          } else {
            // Fallback for unexpected response structure
            setTotalPages(1)
            setTotalProducts(mapped.length)
          }
        }
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters, sortBy, currentPage])

  // Separate effect for categories (fetch only once)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await productApi.getCategories(true)
        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          setCategories(
            categoriesRes.data
              .map(mapCategory)
              .filter((c): c is Category => c !== null)
          )
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [])

  // Reset page to 1 when filters or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy])

  const processedProducts = products
  const paginatedProducts = products

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {filters.category ? `${filters.category} Products` : "All Products"}
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {isLoading
                      ? "Loading products..."
                      : `Showing ${products.length} of ${totalProducts} products`}
                  </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  {/* View Toggle */}
                  <div className="flex border-2 border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-xl transition-all ${viewMode === "grid"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:shadow-sm"
                        }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-xl transition-all ${viewMode === "list"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:shadow-sm"
                        }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(filters.category || filters.search || filters.rating > 0 || filters.inStock) && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.category && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Category: {filters.category}
                    </span>
                  )}
                  {filters.search && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.rating > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Rating: {filters.rating}+ stars
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      In Stock Only
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-lg">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Sparkles className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No products found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters or search terms</p>
                <button
                  onClick={() =>
                    setFilters({
                      category: "",
                      priceRange: [0, 10000],
                      rating: 0,
                      inStock: false,
                      search: "",
                    })
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                    }`}
                >
                  {products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border-2 rounded-xl font-medium transition-all ${currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                              : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}

                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-4 py-2 border-2 rounded-xl font-medium transition-all ${currentPage === totalPages
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                              : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}