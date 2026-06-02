"use client"

import { useEffect, useState, use } from "react"
import ProductForm from "@/components/vendor/ProductForm"
import { vendorApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await vendorApi.getProducts()
        if (res.success && res.data) {
          const found = res.data.find((p: any) => p.id === params.id)
          if (found) setProduct(found)
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

  return (
    <div className="py-8 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="rounded-3xl overflow-hidden">
              <div className="h-96 bg-slate-50 flex items-center justify-center">
                {product.image || product.images?.[0] ? (
                  <img src={(product.image || product.images?.[0])?.startsWith('http') ? (product.image || product.images?.[0]) : `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}${product.image || product.images?.[0]}`} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-slate-400">No image</div>
                )}
              </div>
              <CardContent className="p-8">
                <h2 className="text-3xl font-playfair font-black text-[#002147]">{product.name}</h2>
                <p className="text-slate-500 mt-2">SKU: {product.sku || 'N/A'}</p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="text-2xl font-black text-[#002147]">${product.price.toFixed(2)}</div>
                    <Badge className="rounded-lg px-3 py-1 text-sm">
                      {product.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                  <div>
                    <Button className="bg-[#eb9a05] text-[#002147] rounded-2xl">Edit product</Button>
                  </div>
                </div>

                <div className="mt-6 text-slate-700">
                  <h3 className="font-bold mb-2">Description</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '<p>No description provided.</p>' }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-3xl p-6 space-y-4">
              <div>
                <h4 className="text-sm text-slate-500">Status</h4>
                <div className="mt-2">
                  <Badge className="rounded-lg px-3 py-1 text-sm">
                    {product.productStatus === "APPROVED" ? (product.isActive ? 'Active' : 'Draft') : product.productStatus?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {product.productStatus === 'REJECTED' && product.rejectionReason && (
                <div>
                  <h4 className="text-sm text-slate-500">Admin comment</h4>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700">
                    {product.rejectionReason}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm text-slate-500">Stock</h4>
                <div className="mt-2 text-lg font-bold">{product.totalStock} units</div>
              </div>

              <div className="pt-4">
                <h4 className="text-sm text-slate-500">Actions</h4>
                <div className="mt-3 flex flex-col gap-2">
                  <Button asChild>
                    <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="w-full text-center">Open listing (public)</a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
