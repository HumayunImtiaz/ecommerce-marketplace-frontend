"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuPortal, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { MoreHorizontal, Eye, Printer, RefreshCw, CreditCard, Package } from "lucide-react"
import { AdminLoader } from "./admin-loader"
import Link from "next/link"
import { DateRange } from "react-day-picker"
import { isWithinInterval, startOfDay, endOfDay } from "date-fns"

export interface Order {
  _id: string
  id: string
  user: { fullName: string; email: string }
  orderNumber: string
  total: number
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  items: any[]
  shippingAddress: { name: string; street: string; city: string; state: string; zipCode: string; country: string }
  createdAt: string
}

interface OrdersTableProps {
  searchQuery: string
  filters: { status: string; dateRange: DateRange | undefined; minAmount: string }
  onOrdersLoaded?: (orders: Order[]) => void
}

const buildLabelHtml = (orders: Order[]) => orders.map((o) => {
  const a = o.shippingAddress
  return `
    <div style="border:2px solid #000;padding:20px;margin:10px;width:350px;display:inline-block;font-family:Arial,sans-serif;page-break-inside:avoid;vertical-align:top">
      <div style="font-size:11px;color:#666;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Shipping Label</div>
      <div style="font-weight:bold;font-size:14px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #ccc">${o.orderNumber}</div>
      <div style="font-size:11px;color:#666;margin-bottom:4px">SHIP TO:</div>
      <div style="font-size:15px;font-weight:bold;margin-bottom:2px">${a?.name || o.user?.fullName || "Customer"}</div>
      <div style="font-size:13px;margin-bottom:1px">${a?.street || ""}</div>
      <div style="font-size:13px;margin-bottom:1px">${a?.city || ""}, ${a?.state || ""} ${a?.zipCode || ""}</div>
      <div style="font-size:13px;margin-bottom:12px">${a?.country || ""}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;padding-top:8px;border-top:1px solid #ccc">
        <span>Items: ${o.items?.length || 0}</span>
        <span>Total: $${o.total?.toFixed(2)}</span>
        <span style="text-transform:uppercase">${o.paymentMethod}</span>
      </div>
    </div>`
}).join("")

const openPrintWindow = (orders: Order[]) => {
  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) { alert("Please allow popups to print labels"); return }
  win.document.write(`<!DOCTYPE html><html><head><title>Shipping Labels</title>
    <style>body{margin:20px;background:white}@media print{body{margin:0}button{display:none!important}}</style>
    </head><body>
    <div style="text-align:right;margin-bottom:16px">
      <button onclick="window.print()" style="padding:8px 16px;background:#000;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px">
        Print ${orders.length} Label${orders.length > 1 ? "s" : ""}
      </button>
    </div>
    ${buildLabelHtml(orders)}</body></html>`)
  win.document.close()
}

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"]

export function OrdersTable({ searchQuery, filters, onOrdersLoaded }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
        onOrdersLoaded?.(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) fetchOrders()
      else alert(data.message || "Failed to update status")
    } catch {
      alert("Error updating order status")
    }
  }

  // Mark COD as Paid
  const handleMarkCodPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }) // delivered auto-sets paymentStatus=paid for COD
      })
      const data = await res.json()
      if (data.success) fetchOrders()
      else alert(data.message || "Failed")
    } catch {
      alert("Error")
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) return
    setBulkUpdating(true)
    await Promise.all(
      selectedOrders.map((id) =>
        fetch(`/api/orders/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkStatus })
        })
      )
    )
    setBulkUpdating(false)
    setBulkStatusDialog(false)
    setSelectedOrders([])
    fetchOrders()
  }

  const handleBulkPrintLabels = () => {
    const selected = orders.filter((o) => selectedOrders.includes(o.id))
    openPrintWindow(selected)
  }

  const filteredOrders = orders.filter((order) => {
    const customerName = order.user?.fullName || ""
    const customerEmail = order.user?.email || ""
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filters.status || filters.status === "all" || order.orderStatus === filters.status
    const matchesAmount = !filters.minAmount || order.total >= Number.parseFloat(filters.minAmount)
    
    let matchesDate = true
    if (filters.dateRange?.from) {
      const orderDate = new Date(order.createdAt)
      const start = startOfDay(filters.dateRange.from)
      const end = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(filters.dateRange.from)
      matchesDate = isWithinInterval(orderDate, { start, end })
    }

    return matchesSearch && matchesStatus && matchesAmount && matchesDate
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? paginatedOrders.map((o) => o.id) : [])
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(checked
      ? [...selectedOrders, orderId]
      : selectedOrders.filter((id) => id !== orderId)
    )
  }

  const getStatusColor = (status: string) => {
    const base = "shadow-sm border-transparent transition-colors cursor-default"
    switch (status) {
      case "pending": return `${base} bg-amber-100 text-amber-700 hover:bg-amber-50`
      case "processing": return `${base} bg-blue-100 text-blue-700 hover:bg-blue-50`
      case "shipped": return `${base} bg-violet-100 text-violet-700 hover:bg-violet-50`
      case "delivered": return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-50`
      case "cancelled": return `${base} bg-rose-100 text-rose-700 hover:bg-rose-50`
      default: return `${base} bg-gray-100 text-gray-700 hover:bg-gray-50`
    }
  }

  const getPaymentStatusColor = (status: string) => {
    const base = "shadow-sm border-transparent transition-colors cursor-default"
    switch (status) {
      case "paid": return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-50`
      case "pending": return `${base} bg-amber-100 text-amber-700 hover:bg-amber-50`
      case "failed": return `${base} bg-rose-100 text-rose-700 hover:bg-rose-50`
      default: return `${base} bg-gray-100 text-gray-700 hover:bg-gray-50`
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <span className="text-sm font-semibold text-blue-700">{selectedOrders.length} order(s) selected</span>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={handleBulkPrintLabels}>
            <Printer className="h-4 w-4 mr-2" />Print Labels
          </Button>
          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" onClick={() => { setBulkStatus(""); setBulkStatusDialog(true) }}>
            <RefreshCw className="h-4 w-4 mr-2" />Update Status
          </Button>
        </div>
      )}

      {/* Bulk Status Dialog */}
      <Dialog open={bulkStatusDialog} onOpenChange={setBulkStatusDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status for {selectedOrders.length} Order(s)</DialogTitle>
          </DialogHeader>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkStatusUpdate} disabled={!bulkStatus || bulkUpdating}>
              {bulkUpdating ? "Updating..." : "Apply to All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Order</TableHead>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Total</TableHead>
              <TableHead className="font-semibold text-gray-700">Payment</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Items</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="p-0">
                  <AdminLoader message="Loading orders..." minHeight="min-h-[300px]" />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center h-24 text-muted-foreground">No orders found.</TableCell></TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className={`transition-all duration-200 border-b ${
                    selectedOrders.includes(order.id)
                      ? "bg-blue-50 border-l-4 border-l-blue-600 text-blue-900"
                      : "hover:bg-blue-50/50 hover:border-l-4 hover:border-l-blue-400 text-gray-900 transition-colors"
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.user?.fullName || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{order.user?.email || "N/A"}</div>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {order.paymentMethod === "cod"
                          ? <Package className="h-3 w-3 text-green-600" />
                          : <CreditCard className="h-3 w-3 text-blue-600" />}
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {order.paymentMethod === "cod" ? "COD" : "Stripe"}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus || "pending"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPrintWindow([order])}>
                          <Printer className="h-4 w-4 mr-2" />Print Label
                        </DropdownMenuItem>
                        {/* COD: Mark as Paid */}
                        {order.paymentMethod === "cod" && order.paymentStatus !== "paid" && (
                          <DropdownMenuItem
                            className="text-green-700 font-medium focus:text-green-700"
                            onClick={() => handleMarkCodPaid(order.id)}
                          >
                            <Package className="h-4 w-4 mr-2 text-green-600" />
                            Mark COD as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger disabled={order.orderStatus === "delivered"}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${order.orderStatus === "delivered" ? "opacity-50" : ""}`} />
                            <span className={order.orderStatus === "delivered" ? "text-muted-foreground" : ""}>
                              Update Status
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {STATUS_OPTIONS.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => handleUpdateStatus(order.id, s)}>
                                  <span className="capitalize">{s}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
