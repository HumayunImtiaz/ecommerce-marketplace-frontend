"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Search, Filter, Eye, Clock, CheckCircle2, Truck, User, Box } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { vendorApi } from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const { data, success } = await vendorApi.getOrders()
        if (success) setOrders(data || [])
      } catch (err) {
        toast.error("Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold px-3 py-1 rounded-lg border-amber-200">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1 rounded-lg border-blue-200">Processing</Badge>
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 font-bold px-3 py-1 rounded-lg border-purple-200">Shipped</Badge>
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1 rounded-lg border-emerald-200">Delivered</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold px-3 py-1 rounded-lg border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Customer Orders</h1>
          <p className="text-slate-500 mt-1">Manage fulfillment for your store items.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search order number, customers..." 
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                <TableHead className="px-8 font-bold">Order ID</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold text-center">Your Items</TableHead>
                <TableHead className="font-bold">Order Total</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-8 py-6"><Skeleton className="h-10 w-32 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-40 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 mx-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-8 text-right"><Skeleton className="h-6 w-24 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Box className="w-12 h-12 opacity-20" />
                      <p className="font-medium text-slate-500">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-[#002147]">{order.orderNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <User className="h-3 w-3" /> {order.user?.fullName || "Guest"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{order.user?.email || "N/A"}</span>
                      </div>
                    </TableCell>
                    <td className="py-6 text-center">
                      <Badge variant="outline" className="rounded-md font-bold text-slate-500 bg-white">
                        {order.items?.length || 0} Items
                      </Badge>
                    </td>
                    <td className="py-6 font-black text-[#002147]">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-6">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-6 text-right px-8">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <Button variant="link" size="sm" className="h-auto p-0 text-[#eb9a05] text-[10px] font-black uppercase tracking-widest hover:no-underline hover:text-[#002147]">
                          View Details →
                        </Button>
                      </div>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
