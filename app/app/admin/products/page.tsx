"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductsTable } from "@/components/products-table"
import { ProductFilters } from "@/components/product-filters"
import { Plus, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ProductVariant {
  id: string; size: string; color: string; price: number | null;
}

interface ProductItem {
  id: string
  name: string
  sku: string
  price: number
  totalStock: number
  isActive: boolean
  category: { name: string; slug: string } | null
  createdAt: string
  variants: ProductVariant[]
}

interface CategoryItem {
  _id: string
  name: string
  slug: string
  isActive: boolean
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("category") || ""

  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [filters, setFilters] = useState({
    categorySlug: "all",
    status: "all",
    priceRange: [0, 1000000],
  })

  // Ref to store products for export without re-rendering
  const productsRef = useRef<ProductItem[]>([])

  const handleProductsLoaded = useCallback((products: ProductItem[]) => {
    productsRef.current = products
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const result = await response.json()
        if (result?.success && Array.isArray(result.data)) {
          setCategories(result.data.filter((cat: CategoryItem) => cat.isActive))
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Sync URL category param with filters
  useEffect(() => {
    if (categorySlug) {
      setFilters((prev) => ({ ...prev, categorySlug: categorySlug }))
    } else {
      setFilters((prev) => ({ ...prev, categorySlug: "all" }))
    }
  }, [categorySlug])

  const handleExportCSV = () => {
    const products = productsRef.current
    if (!products.length) {
      toast.error("No products available to export")
      return
    }

    const headers = ["Name", "SKU", "Category", "Price", "Stock", "Status", "Created At"]
    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.category?.name || "-",
      `$${p.price.toFixed(2)}`,
      p.totalStock,
      p.isActive ? "Active" : "Draft",
      new Date(p.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(`${products.length} products exported successfully`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ProductFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <ProductsTable searchQuery={searchQuery} filters={filters} onProductsLoaded={handleProductsLoaded} />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}