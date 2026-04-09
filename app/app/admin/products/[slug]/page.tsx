"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Layers,
  ImageIcon,
  AlertCircle,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ProductVariant {
  id: string
  size: string
  color: string
  price: number | null
  stock: { quantity: number; status: string } | null
}

interface ProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string
  category: { _id: string; name: string; slug: string } | null
  tags: string[]
  images: string[]
  isActive: boolean
  totalStock: number
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

const stockStatusColor: Record<string, string> = {
  in_stock: "bg-green-100 text-green-800",
  low_stock: "bg-yellow-100 text-yellow-800",
  out_of_stock: "bg-red-100 text-red-800",
}

export default function ViewProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/auth/products`)
        const result = await response.json()

        if (result?.success && Array.isArray(result.data)) {
          const found = result.data.find((p: ProductItem) => p.slug === slug)
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

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "default" : "secondary"} className="py-3 px-10 rounded-lg">
            {product.isActive ? "Active" : "Draft"}
          </Badge>
          <Button asChild>
            <Link href={`/admin/products/${product.slug}/edit`}>
              <Edit className="h-5 w-5 mr-2" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Images */}
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.images.length > 0 ? (
                <>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                    <Image
                      src={product.images[activeImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          className={`relative h-16 w-16 rounded-md overflow-hidden border-2 transition-colors ${
                            activeImage === idx
                              ? "border-primary"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {product.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Product Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Slug</p>
                  <p className="font-mono text-sm">{product.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <Badge variant="secondary">{product.category?.name || "—"}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Stock</p>
                  <p className="font-medium">{product.totalStock} units</p>
                </div>
              </div>

              {product.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{product.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Compare Price</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {product.comparePrice ? `$${product.comparePrice.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Discount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {discountPercent ? `${discountPercent}% off` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          {product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4" />
                  Variants ({product.variants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <Badge variant="outline">{variant.size}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: variant.color.toLowerCase() }}
                            />
                            <span className="capitalize">{variant.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {variant.price != null ? `$${variant.price.toFixed(2)}` : (
                            <span className="text-muted-foreground text-xs">Base price</span>
                          )}
                        </TableCell>
                        <TableCell>{variant.stock?.quantity ?? 0}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              stockStatusColor[variant.stock?.status ?? "out_of_stock"]
                            }`}
                          >
                            {(variant.stock?.status ?? "out_of_stock").replace("_", " ")}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <p>Created: {new Date(product.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
            <p>Updated: {new Date(product.updatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}