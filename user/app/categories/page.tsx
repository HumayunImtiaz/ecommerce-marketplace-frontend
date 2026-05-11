"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Grid, List, ChevronDown, Sparkles, ArrowRight } from "lucide-react"
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
          fetchedProducts = prodRes.data.map(mapProduct).filter((p): p is Product => p !== null)
          setProducts(fetchedProducts)
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          const mappedCats = catRes.data.map(mapCategory).filter((c): c is Category => c !== null)
          const catsWithCounts = mappedCats.map(cat => ({
            ...cat,
            productCount: fetchedProducts.filter(p => p.category === cat.name).length
          }))
          setCategories(catsWithCounts)
        }
      } catch (error) { console.error("Failed to fetch categories data:", error) }
      finally { setIsLoading(false) }
    }
    fetchData()
  }, [])

  const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name)
      case "products": return (b.productCount || 0) - (a.productCount || 0)
      default: return 0
    }
  })

  const featuredCategories = [...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 3)
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center py-20 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb9a05] mx-auto mb-4"></div>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#002147] opacity-40">Consulting Collections...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">The Compendium</span>
          </div>
          <h1 className="text-6xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Shop by Collection</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto italic leading-relaxed">
            Discover our meticulously curated landscapes of prestige. From artisanal craftsmanship to modern marvels, explore the depths of true luxury.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-[#eb9a05]/10 transform hover:-translate-y-2 transition-all duration-500">
            <div className="text-5xl font-playfair font-black text-[#002147] mb-2">{categories.length}</div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05]">Curated Collections</div>
          </div>
          <div className="bg-[#002147] rounded-[2.5rem] p-10 text-center shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
            <div className="text-5xl font-playfair font-black text-[#eb9a05] mb-2">{totalProducts}</div>
            <div className="text-[10px] font-black tracking-widest uppercase text-white/40">Products</div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-[#eb9a05]/10 transform hover:-translate-y-2 transition-all duration-500">
            <div className="text-5xl font-playfair font-black text-[#002147] mb-2">98%</div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05]">Customer Approved </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px w-8 bg-[#eb9a05]"></div>
            <h2 className="text-3xl font-playfair font-black text-[#002147]">The Masterpieces</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative h-[450px] overflow-hidden rounded-[3rem] shadow-2xl"
              >
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002147] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-12 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-playfair font-black text-white mb-4">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05]">{category.productCount || 0} Products</p>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-10 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-[#eb9a05]/10 mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#eb9a05] w-5 h-5" />
              <input
                type="text"
                placeholder="Search the collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm"
              />
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl px-8 py-4 pr-12 focus:outline-none focus:border-[#eb9a05] font-black text-[10px] tracking-widest uppercase text-[#002147]"
                >
                  <option value="name">Sort: Identity</option>
                  <option value="products">Sort: Volume</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#eb9a05] pointer-events-none" />
              </div>

              <div className="flex border-2 border-gray-50 rounded-2xl bg-[#f8f9fa] p-1 shadow-inner">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "text-gray-300 hover:text-[#002147]"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "text-gray-300 hover:text-[#002147]"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        {sortedCategories.length === 0 ? (
          <div className="text-center py-24 bg-[#f8f9fa] rounded-[3rem] border-2 border-dashed border-[#eb9a05]/20">
            <Filter className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2">No Matches Found</h3>
            <p className="text-gray-400 text-sm italic">Adjust your search parameters for better resonance.</p>
          </div>
        ) : (
          <div className={`grid gap-10 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {sortedCategories.map((category) => (
              <CategoryCard key={category.id} category={category} viewMode={viewMode} products={products} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ category, viewMode, products }: { category: Category, viewMode: "grid" | "list", products: Product[] }) {
  const categoryProducts = products.filter((p) => p.category === category.name).slice(0, 3)

  if (viewMode === "list") {
    return (
      <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col md:flex-row items-center gap-10">
        <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden flex-shrink-0">
          <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-playfair font-black text-[#002147] mb-2 group-hover:text-[#eb9a05] transition-colors">{category.name}</h3>
          <p className="text-sm text-gray-400 font-medium italic mb-6">{category.productCount || 0} Artifacts Currently Curated</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {categoryProducts.map((p) => (
              <span key={p.id} className="px-4 py-1.5 rounded-full bg-[#f8f9fa] border border-gray-100 text-[10px] font-black uppercase tracking-widest text-[#002147] group-hover:bg-[#002147] group-hover:text-white transition-all">
                {p.name.split(" ").slice(0, 2).join(" ")}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 text-right pr-4">
          <div className="text-4xl font-playfair font-black text-[#002147]">{category.productCount || 0}</div>
          <div className="text-[8px] font-black tracking-widest uppercase text-[#eb9a05]">Available</div>
          <div className="mt-4 p-3 rounded-xl bg-[#002147] text-white transform group-hover:translate-x-2 transition-all">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50">
      <div className="relative h-64 overflow-hidden">
        <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
          <span className="text-xs font-black text-[#002147]">{category.productCount || 0}</span>
        </div>
      </div>
      <div className="p-10">
        <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2 group-hover:text-[#eb9a05] transition-colors">{category.name}</h3>
        <p className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05] mb-8">{category.productCount || 0} Artifacts</p>
        <div className="space-y-4">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-20">Key Selections</p>
          <div className="flex flex-wrap gap-2">
            {categoryProducts.map((p) => (
              <span key={p.id} className="text-[10px] font-bold text-gray-400 italic">#{p.name.split(" ").slice(0, 1)}</span>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-50 flex justify-between items-center">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#002147]">Explore</span>
          <ArrowRight className="w-4 h-4 text-[#eb9a05] transform group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
