"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import ProductEditForm from "@/components/product-edit-form"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ProductVariant {
  id: string
  size: string
  color: string
  price: number | null
  stock: { quantity: number; status: string } | null
}

export interface ProductEditData {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string
  category: { _id: string; name: string; slug: string } | null
  tags: string[]
  features: string[]
  images: string[]
  isActive: boolean
  totalStock: number
  variants: ProductVariant[]
}

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductEditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/auth/products`)
        const result = await response.json()

        if (result?.success && Array.isArray(result.data)) {
          const found = result.data.find((p: ProductEditData) => p.slug === slug)
          if (found) {
            setProduct(found)
          } else {
            setError("Product not found")
          }
        } else {
          setError("Failed to load product")
        }
      } catch {
        setError("Failed to connect to server")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{error || "Product not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <ProductEditForm product={product} />
    </div>
  )
}