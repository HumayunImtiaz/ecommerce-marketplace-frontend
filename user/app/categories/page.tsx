"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Grid, List, ChevronDown } from "lucide-react"
import { productApi } from "@/lib/api"
import { mapProduct, mapCategory } from "@/lib/productMapper"
import type { Product, Category } from "@/lib/types"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [catRes, prodRes] = await Promise.all([
          productApi.getCategories(true),
          productApi.getProducts()
        ])

        let fetchedProducts: Product[] = []
        if (prodRes.success && Array.isArray(prodRes.data)) {
          fetchedProducts = prodRes.data
            .map(mapProduct)
            .filter((p): p is Product => p !== null)
          setProducts(fetchedProducts)
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          const mappedCats = catRes.data
            .map(mapCategory)
            .filter((c): c is Category => c !== null)
          // Dinamically count products for each category
          const catsWithCounts = mappedCats.map(cat => ({
            ...cat,
            productCount: fetchedProducts.filter(p => p.category === cat.name).length
          }))
          setCategories(catsWithCounts)
        }
      } catch (error) {
        console.error("Failed to fetch categories data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "products":
        return (b.productCount || 0) - (a.productCount || 0)
      case "popular":
        return (b.productCount || 0) - (a.productCount || 0)
      default:
        return 0
    }
  })

  // Get featured categories (top 3 by product count)
  const featuredCategories = [...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 3)

  // Get category stats
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)
  const avgProductsPerCategory = categories.length > 0 ? Math.round(totalProducts / categories.length) : 0

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our wide range of product categories. From electronics to fashion, find exactly what you're looking
          for in our organized collections.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{categories.length}</div>
          <div className="text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{totalProducts}</div>
          <div className="text-gray-600">Total Products</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{avgProductsPerCategory}</div>
          <div className="text-gray-600">Avg per Category</div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9 relative h-48">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.productCount || 0} products</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="products">Most Products</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Enhanced View Mode Toggle */}
              <div className="flex border-2 border-gray-200 rounded-xl bg-gray-50 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-all ${viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                    }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition-all ${viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                    }`}
                  title="Compact View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {sortedCategories.length} of {categories.length} categories
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>

      {/* Categories Grid/List */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No categories found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
        >
          {sortedCategories.map((category) => (
            <CategoryCard key={category.id} category={category} viewMode={viewMode} products={products} />
          ))}
        </div>
      )}

      {/* Category Insights */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Category Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat, idx) => (
            <div key={cat.id} className="text-center">
              <div className={`text-2xl font-bold mb-2 ${idx === 0 ? "text-blue-600" :
                  idx === 1 ? "text-pink-600" :
                    idx === 2 ? "text-green-600" :
                      "text-orange-600"
                }`}>
                {cat.productCount || 0}
              </div>
              <div className="text-sm text-gray-600">{cat.name} Products</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface CategoryCardProps {
  category: Category
  viewMode: "grid" | "list"
  products: Product[]
}

function CategoryCard({ category, viewMode, products }: CategoryCardProps) {
  // Get sample products from this category
  const categoryProducts = products.filter((p: Product) => p.category === category.name).slice(0, 3)

  if (viewMode === "list") {
    return (
      <Link
        href={`/products?category=${encodeURIComponent(category.name)}`}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
      >
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover rounded-xl"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{category.name}</h3>
            <p className="text-gray-600 mb-3">{category.productCount || 0} products available</p>
            {categoryProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Popular items:</span>
                <div className="flex space-x-1">
                  {categoryProducts.map((product: Product, index: number) => (
                    <span key={product.id} className="text-sm text-blue-600">
                      {product.name.split(" ").slice(0, 2).join(" ")}
                      {index < categoryProducts.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{category.productCount || 0}</div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.name)}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-800">{category.productCount || 0}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">{category.name}</h3>
        <p className="text-gray-600 mb-4">{category.productCount || 0} products available</p>

        {categoryProducts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Popular items:</div>
            <div className="flex flex-wrap gap-1">
              {categoryProducts.map((product: Product) => (
                <span key={product.id} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {product.name.split(" ").slice(0, 2).join(" ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
