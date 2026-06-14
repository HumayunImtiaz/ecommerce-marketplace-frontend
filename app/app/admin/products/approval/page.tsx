"use client"

import { useState, useEffect } from "react"
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  Store, 
  Package, 
  Clock,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface PendingProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  description: string
  features: string[]
  createdAt: string
  category: { name: string }
  vendor: { 
    businessName: string
    user: { fullName: string; email: string }
  }
  variants?: {
    color: string
    size: string
    price?: number
    stock?: { quantity: number } | null
  }[]
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"

export default function ProductApprovalPage() {
  const [products, setProducts] = useState<PendingProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal states
  const [rejectProduct, setRejectProduct] = useState<PendingProduct | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPendingProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/products/approval/pending")
      const result = await res.json()
      if (result.success) setProducts(result.data.products)
      else toast.error("Failed to load queue")
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPendingProducts() }, [])

  const handleApprove = async (id: string) => {
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/products/approval/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Product approved and live!")
        fetchPendingProducts()
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
    if (!rejectProduct) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/products/approval/${rejectProduct.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reason: rejectionReason })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Product rejected")
        setRejectProduct(null)
        setRejectionReason("")
        fetchPendingProducts()
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error("Failed to reject")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading && products.length === 0) return <div className="h-[60vh] flex items-center justify-center"><AdminLoader /></div>

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Approval Queue</h1>
          <p className="text-muted-foreground">Review and approve vendor product submissions.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 text-sm font-medium">
          <Clock className="w-4 h-4" />
          {products.length} Products Waiting
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by product or vendor..." 
              className="pl-10 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Product Info</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-8 h-8 opacity-20" />
                    <p>No products waiting for review.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {p.images?.[0] ? <img src={p.images[0].startsWith('http') ? p.images[0] : `${SERVER_URL}${p.images[0]}`} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-slate-300" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {p.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium">{p.vendor.businessName}</p>
                        <p className="text-[10px] text-muted-foreground">{p.vendor.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium">
                      {p.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">${p.price}</TableCell>
                  <TableCell className="text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0 hover:bg-slate-100">
                         <Link href={`/admin/products/approval/${p.slug}`}>
                           <Eye className="w-4 h-4 text-slate-500" />
                         </Link>
                       </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setRejectProduct(p); setRejectionReason(""); }} className="rounded-lg h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600">
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleApprove(p.id)} disabled={isSubmitting} className="rounded-lg h-9 w-9 p-0 hover:bg-emerald-50 hover:text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectProduct} onOpenChange={() => setRejectProduct(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> Reject Product
            </DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejection. This will be sent to the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Images are low quality, price is unrealistic, category mismatch..." 
              className="min-h-[120px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-200"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRejectProduct(null)} className="rounded-xl">Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-xl px-8" 
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
