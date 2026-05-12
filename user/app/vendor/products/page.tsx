"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2,
  Box,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { vendorApi } from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Pagination (Mocked for now)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const { data, success } = await vendorApi.getProducts()
        if (success) {
          setProducts(data || [])
        }
      } catch (err) {
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.isActive : !p.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Product Catalog</h1>
          <p className="text-slate-500 mt-1">Manage your store inventory and listings.</p>
        </div>
        <Button asChild className="bg-[#eb9a05] text-[#002147] hover:bg-[#d48b04] rounded-2xl font-black uppercase tracking-widest text-xs px-8 py-6 shadow-lg shadow-[#eb9a05]/20">
          <Link href="/vendor/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-12 bg-white border-slate-200 rounded-2xl h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select 
              className="h-10 border rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#002147]/10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Inactive</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="px-8 font-bold">Product</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Price</TableHead>
              <TableHead className="font-bold">Stock</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right px-8 font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-8"><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                  <TableCell className="text-right px-8"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Box className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-slate-500">No products found</p>
                    <Button variant="link" className="text-[#eb9a05] font-bold" onClick={() => {setSearchQuery(""); setStatusFilter("all")}}>
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border bg-slate-50 group-hover:shadow-md transition-all">
                        <img 
                          src={product.image || product.images?.[0] || '/placeholder.png'} 
                          alt={product.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#002147] leading-tight">{product.name}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">SKU: {product.sku || "N/A"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 rounded-lg font-bold text-slate-500 text-[10px] uppercase">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black text-[#002147]">${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${product.totalStock > 5 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-xs font-bold text-slate-600">{product.totalStock} units</span>
                      </div>
                      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#002147]" style={{ width: `${Math.min(100, product.totalStock)}%` }}></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      product.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}>
                      {product.isActive ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl p-2 border-slate-100">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2 py-2">Management</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                          <Link href={`/vendor/products/${product.id}/edit`}>
                            <Edit3 className="mr-2 h-4 w-4 text-blue-500" />
                            Edit Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg py-2 cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-slate-500" />
                          View Listing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg py-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-6 border-t bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="text-[#002147] font-bold">{filteredProducts.length}</span> of <span className="text-[#002147] font-bold">{products.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002147] text-white text-xs font-bold">
              {page}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
