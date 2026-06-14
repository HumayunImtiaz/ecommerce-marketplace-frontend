"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Store, 
  Package, 
  AlertCircle,
  Tag,
  DollarSign,
  Type,
  Layers
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AdminLoader } from "@/components/admin-loader"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"

export default function ProductApprovalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/slug/${slug}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data.product)
        } else {
          toast.error("Failed to load product details")
        }
      } catch (err) {
        toast.error("An error occurred loading the product")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/products/approval/${product.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Product approved and live!")
        router.push("/admin/products/approval")
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error("Failed to approve")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error("Please provide a reason")

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/products/approval/${product.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reason: rejectionReason })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Product rejected")
        router.push("/admin/products/approval")
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error("Failed to reject")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><AdminLoader /></div>
  if (!product) return <div className="h-[80vh] flex items-center justify-center text-slate-500">Product not found</div>

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-32 p-4 md:p-8">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl py-6 border-b border-slate-200 -mx-4 px-4 md:-mx-8 md:px-8 mb-10 transition-all shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/products/approval" 
              className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-[#eb9a05] transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-[#002147] group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black uppercase tracking-widest text-[10px]">Pending Approval</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-playfair font-black text-[#002147] line-clamp-1">
                {product.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setRejectModalOpen(true)}
              disabled={isSubmitting}
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm"
            >
              <XCircle className="w-5 h-5 mr-2" /> Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isSubmitting}
              className="h-14 px-10 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <CheckCircle className="w-5 h-5 mr-2" /> Approve & Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Images Section */}
          <div className="bg-white rounded-[3rem] p-10 border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
            <h3 className="text-xl font-black text-[#002147] mb-6 flex items-center gap-3">
              <Package className="text-slate-400" /> Visual Assets
            </h3>
            {product.images?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm relative group bg-slate-50">
                    <img 
                      src={img.startsWith('http') ? img : `${SERVER_URL}${img}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={`Product image ${idx + 1}`} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl text-slate-400 bg-slate-50/50">
                <Package className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-xs">No images provided</p>
              </div>
            )}
          </div>

          {/* Description & Features */}
          <div className="bg-white rounded-[3rem] p-10 border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
             <h3 className="text-xl font-black text-[#002147] mb-6 flex items-center gap-3">
              <Type className="text-slate-400" /> Product Narrative
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase font-black tracking-[0.2em] text-[#002147] opacity-60 mb-3">Description</p>
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {product.description || <span className="italic text-slate-400">No description provided.</span>}
                </div>
              </div>

              {product.features?.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-black tracking-[0.2em] text-[#002147] opacity-60 mb-3">Highlights & Features</p>
                  <ul className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-3">
                    {product.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="font-medium text-sm md:text-base">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="bg-white rounded-[3rem] p-10 border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
              <h3 className="text-xl font-black text-[#002147] mb-6 flex items-center gap-3">
                <Layers className="text-slate-400" /> Variations & Inventory
              </h3>
              <div className="space-y-4">
                {product.variants.map((v: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center justify-between bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 shadow-sm gap-4">
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Color</p>
                        <p className="font-bold text-slate-900">{v.color || "Standard"}</p>
                      </div>
                      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Size</p>
                        <p className="font-bold text-slate-900">{v.size || "Standard"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-dashed border-slate-200">
                      {v.price && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Modifier</p>
                          <p className="font-black text-[#eb9a05]">${v.price}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Stock</p>
                        <Badge className={`${(v.stock?.quantity || 0) > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} border-none text-sm font-mono`}>
                          {v.stock?.quantity || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Vendor Info */}
          <div className="bg-[#002147] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
              <Store className="text-blue-300" /> Vendor Profile
            </h3>
            {product.vendor ? (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Business Name</p>
                  <p className="text-2xl font-bold">{product.vendor.businessName || "Unknown Vendor"}</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Primary Acc</p>
                  <p className="font-medium text-sm">{product.vendor.user?.fullName}</p>
                  <p className="text-sm opacity-70 break-all">{product.vendor.user?.email}</p>
                </div>
              </div>
            ) : (
                <div className="bg-white/10 p-5 rounded-2xl flex items-center gap-3 border border-white/10">
                  <AlertCircle className="text-amber-400" />
                  <p className="text-sm font-medium">No vendor associated (Admin uploaded)</p>
                </div>
            )}
          </div>

          {/* Pricing Box */}
          <div className="bg-white rounded-[3rem] p-10 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/5 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            <h3 className="text-xl font-black text-[#002147] mb-8 flex items-center gap-3">
              <DollarSign className="text-[#eb9a05]" /> Pricing & Stats
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase font-black tracking-widest text-[#002147] opacity-60 mb-2">Base Price</p>
                <p className="text-5xl font-black text-[#eb9a05]">${product.price}</p>
              </div>
              
              {product.comparePrice && (
                <div>
                  <p className="text-xs uppercase font-black tracking-widest text-slate-400 mb-1">Compare At</p>
                  <p className="text-2xl font-bold text-slate-400 line-through decoration-slate-300">${product.comparePrice}</p>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                <Tag className="w-10 h-10 p-2 bg-slate-50 text-slate-400 rounded-xl" />
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Category</p>
                  <p className="font-bold text-slate-900">{product.category?.name || "Uncategorized"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600 text-2xl font-black">
              <AlertCircle className="w-6 h-6" /> Reject Submission
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 font-medium pt-2">
              Please provide a clear reason for rejection. This feedback will be sent directly to the vendor so they can fix it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea 
              placeholder="e.g. Images are low quality, price is unrealistic, please update the description..." 
              className="min-h-[160px] rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-200 text-base p-4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)} className="rounded-xl font-bold px-6 h-12">Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-xs" 
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
