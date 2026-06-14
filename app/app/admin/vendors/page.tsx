"use client"

import { useState, useEffect } from "react"
import { 
  Store, CheckCircle, XCircle, Clock, Search, Filter, MoreVertical, 
  Mail, Phone, ArrowUpRight, User as UserIcon, ShieldAlert, Eye, Percent
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AdminLoader } from "@/components/admin-loader"
import Link from "next/link"

interface Vendor {
  id: string
  businessName: string
  slug: string
  status: "PENDING" | "APPROVED" | "SUSPENDED"
  commissionRate: number
  createdAt: string
  user: { fullName: string; email: string; phone?: string }
  _count?: { products: number }
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/vendors${filterStatus !== "all" ? `?status=${filterStatus}` : ""}`)
      const result = await res.json()
      if (result.success) setVendors(result.data)
      else toast.error(result.message || "Failed to fetch vendors")
    } catch (error) {
      toast.error("An error occurred while fetching vendors")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchVendors() }, [filterStatus])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}/approve`, { method: "PATCH" })
      const result = await res.json()
      if (result.success) { toast.success("Vendor approved successfully"); fetchVendors() }
      else toast.error(result.message || "Failed to approve vendor")
    } catch (error) { toast.error("Error approving vendor") }
  }

  const handleSuspend = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}/suspend`, { method: "PATCH" })
      const result = await res.json()
      if (result.success) { toast.success("Vendor suspended"); fetchVendors() }
      else toast.error(result.message || "Failed to suspend vendor")
    } catch (error) { toast.error("Error suspending vendor") }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/vendors/${id}/reject`, { method: "DELETE" })
      const result = await res.json()
      if (result.success) { toast.success("Vendor deleted successfully"); fetchVendors() }
      else toast.error(result.message || "Failed to delete vendor")
    } catch (error) { toast.error("Error deleting vendor") }
  }

  const filteredVendors = vendors.filter(v =>
    v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Approved</Badge>
      case "PENDING": return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Pending</Badge>
      case "SUSPENDED": return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">Suspended</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vendor Management</h1>
          <p className="text-muted-foreground">Approve, monitor and manage your marketplace partners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Store className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
            <h3 className="text-2xl font-bold">{vendors.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
            <h3 className="text-2xl font-bold text-amber-600">{vendors.filter(v => v.status === "PENDING").length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Stores</p>
            <h3 className="text-2xl font-bold text-emerald-600">{vendors.filter(v => v.status === "APPROVED").length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by business name, owner or email..." className="pl-10 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground mr-2" />
            <select className="bg-white border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><AdminLoader /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[250px]">Vendor / Store</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Store className="w-8 h-8 opacity-20" />
                      <p>No vendors found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {vendor.businessName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{vendor.businessName}</p>
                          <p className="text-xs text-muted-foreground">/{vendor.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-700">{vendor.user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{vendor.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-700">{vendor._count?.products || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold">
                        {(() => {
                          const raw = vendor.commissionRate;
                          if (raw === undefined || raw === null) return "N/A";
                          const rate = typeof raw === 'number' ? raw : parseFloat((raw as any).toString());
                          return isNaN(rate) ? "N/A" : rate.toFixed(1);
                        })()}%
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">Manage Vendor</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="rounded-lg py-2">
                            <Link href={`/admin/vendors/${vendor.id}`}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg py-2">
                            <Link href={`/admin/vendors/${vendor.id}/commission`}>
                              <Percent className="w-4 h-4 mr-2" /> Set Commission
                            </Link>
                          </DropdownMenuItem>
                          {vendor.status === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleApprove(vendor.id)} className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg py-2 cursor-pointer">
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </DropdownMenuItem>
                          )}
                          {vendor.status === "SUSPENDED" && (
                            <DropdownMenuItem onClick={() => handleApprove(vendor.id)} className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg py-2 cursor-pointer">
                              <CheckCircle className="w-4 h-4 mr-2" /> Reactivate
                            </DropdownMenuItem>
                          )}
                          {vendor.status !== "SUSPENDED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSuspend(vendor.id)} className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg py-2 cursor-pointer">
                                <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(vendor.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg py-2 cursor-pointer">
                            <XCircle className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
