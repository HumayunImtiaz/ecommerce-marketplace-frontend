"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Store, Mail, Phone, Package, DollarSign, Clock,
  CheckCircle, XCircle, ShieldAlert, Percent, Eye, EyeOff, Star, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { AdminLoader } from "@/components/admin-loader"

interface VendorDetail {
  id: string
  businessName: string
  slug: string
  description: string | null
  status: string
  commissionRate: number
  createdAt: string
  user: { fullName: string; email: string; phone?: string; avatar?: string }
  products: any[]
  earnings: any[]
  payoutRequests: any[]
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"products" | "earnings" | "payouts">("products")

  const fetchVendor = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/vendors/${id}`)
      const result = await res.json()
      if (result.success) setVendor(result.data)
      else toast.error(result.message || "Failed to fetch vendor")
    } catch { toast.error("Error fetching vendor details") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchVendor() }, [id])

  const handleApprove = async () => {
    const res = await fetch(`/api/admin/vendors/${id}/approve`, { method: "PATCH" })
    const result = await res.json()
    if (result.success) { toast.success("Vendor approved!"); fetchVendor() }
    else toast.error(result.message)
  }

  const handleSuspend = async () => {
    const res = await fetch(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" })
    const result = await res.json()
    if (result.success) { toast.success("Vendor suspended"); fetchVendor() }
    else toast.error(result.message)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Approved</Badge>
      case "PENDING": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Pending</Badge>
      case "SUSPENDED": return <Badge className="bg-red-500/10 text-red-600 border-red-200">Suspended</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><AdminLoader /></div>
  if (!vendor) return <div className="p-8 text-center text-muted-foreground">Vendor not found</div>

  const totalEarnings = vendor.earnings.reduce((sum: number, e: any) => sum + Number(e.netAmount || 0), 0)
  const totalCommission = vendor.earnings.reduce((sum: number, e: any) => sum + Number(e.commissionAmount || 0), 0)

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/vendors")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{vendor.businessName}</h1>
            {getStatusBadge(vendor.status)}
          </div>
          <p className="text-muted-foreground mt-1">/{vendor.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/vendors/${id}/commission`}>
              <Percent className="w-4 h-4 mr-2" /> Set Commission
            </Link>
          </Button>
          {vendor.status === "PENDING" && (
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </Button>
          )}
          {vendor.status !== "SUSPENDED" && (
            <Button variant="destructive" onClick={handleSuspend}>
              <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Business Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Store className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-muted-foreground">Owner</p>
          </div>
          <p className="font-bold text-lg text-slate-900">{vendor.user.fullName}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" />{vendor.user.email}</p>
            {vendor.user.phone && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" />{vendor.user.phone}</p>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Package className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{vendor.products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
          </div>
          <p className="text-3xl font-bold text-emerald-600">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Commission paid: ${totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Percent className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{Number(vendor.commissionRate)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Description */}
      {vendor.description && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2">Business Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{vendor.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="border-b bg-slate-50/50 px-4">
          <div className="flex gap-0">
            {(["products", "earnings", "payouts"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-muted-foreground hover:text-slate-700"
                }`}
              >
                {tab} ({tab === "products" ? vendor.products.length : tab === "earnings" ? vendor.earnings.length : vendor.payoutRequests.length})
              </button>
            ))}
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No products yet</TableCell></TableRow>
              ) : vendor.products.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold">${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={p.stock > 0 ? "text-emerald-600" : "text-red-500"}>{p.stock}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}>
                      {p.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Date</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.earnings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No earnings yet</TableCell></TableRow>
              ) : vendor.earnings.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono">${Number(e.grossAmount).toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-red-500">-${Number(e.commissionAmount).toFixed(2)}</TableCell>
                  <TableCell className="font-mono font-bold text-emerald-600">${Number(e.netAmount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Requested</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.payoutRequests.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No payout requests yet</TableCell></TableRow>
              ) : vendor.payoutRequests.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{new Date(p.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono font-bold">${Number(p.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={p.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-amber-500/10 text-amber-600 border-amber-200"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{p.resolvedAt ? new Date(p.resolvedAt).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
