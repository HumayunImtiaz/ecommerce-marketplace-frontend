"use client"

import { useState, useEffect, use } from "react"
import ProductForm from "@/components/vendor/ProductForm"
import { vendorApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await vendorApi.getProducts()
        if (res.success && res.data) {
          const found = res.data.find((p: any) => p.id === params.id)
          if (found) {
             const mappedProduct = {
               ...found,
               variants: found.variants?.map((v: any) => ({
                 color: v.color,
                 size: v.size,
                 quantity: v.stock?.quantity || 0,
                 price: v.price || undefined
               })) || []
             }
             setProduct(mappedProduct)
          }
        }
      } catch (err) {
        console.error("Failed to load product", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  if (loading) return <div className="p-8 space-y-4 animate-in fade-in"><Skeleton className="h-12 w-1/4" /><Skeleton className="h-96 w-full" /></div>
  if (!product) return <div className="p-8 text-center text-slate-500 font-medium">Product not found</div>

  return <ProductForm initialData={product} isEditing />
}
