"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrdersTable, type Order } from "@/components/orders-table"
import { OrderFilters } from "@/components/order-filters"
import { Printer, Download } from "lucide-react"
import { DateRange } from "react-day-picker"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{
    status: string
    dateRange: DateRange | undefined
    minAmount: string
  }>({ status: "all", dateRange: undefined, minAmount: "" })
  const ordersRef = useRef<Order[]>([])

  const handleOrdersLoaded = useCallback((orders: Order[]) => {
    ordersRef.current = orders
  }, [])

  // ── Export CSV ────────────────────────────────────────────────────────────────
  const handleExportOrders = () => {
    const orders = ordersRef.current
    if (!orders.length) { alert("No orders to export"); return }

    const headers = ["Order Number", "Customer Name", "Customer Email", "Date", "Total", "Payment Method", "Payment Status", "Order Status", "Items"]
    const rows = orders.map((o) => [
      o.orderNumber,
      o.userId?.fullName || "Unknown",
      o.userId?.email || "N/A",
      new Date(o.createdAt).toLocaleDateString(),
      `$${o.total.toFixed(2)}`,
      o.paymentMethod?.toUpperCase(),
      o.paymentStatus,
      o.orderStatus,
      o.items?.length || 0,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ── Print Shipping Labels ────────────────────────────────────────────────────
  const handlePrintLabels = () => {
    const orders = ordersRef.current
    if (!orders.length) { alert("No orders to print"); return }

    const labelsHtml = orders.map((o) => {
      const addr = o.shippingAddress
      return `
        <div style="border: 2px solid #000; padding: 20px; margin: 10px; width: 350px; display: inline-block; font-family: Arial, sans-serif; page-break-inside: avoid; vertical-align: top;">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Shipping Label</div>
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">${o.orderNumber}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">SHIP TO:</div>
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 2px;">${addr?.name || o.userId?.fullName || "Customer"}</div>
          <div style="font-size: 13px; margin-bottom: 1px;">${addr?.street || ""}</div>
          <div style="font-size: 13px; margin-bottom: 1px;">${addr?.city || ""}, ${addr?.state || ""} ${addr?.zipCode || ""}</div>
          <div style="font-size: 13px; margin-bottom: 12px;">${addr?.country || ""}</div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555; padding-top: 8px; border-top: 1px solid #ccc;">
            <span>Items: ${o.items?.length || 0}</span>
            <span>Total: $${o.total?.toFixed(2)}</span>
            <span style="text-transform: uppercase;">${o.paymentMethod}</span>
          </div>
        </div>
      `
    }).join("")

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) { alert("Please allow popups to print labels"); return }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Labels — ${new Date().toLocaleDateString()}</title>
          <style>
            body { margin: 20px; background: white; }
            @media print {
              body { margin: 0; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 16px;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Print All Labels (${orders.length})</button>
          </div>
          ${labelsHtml}
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and process customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintLabels}>
            <Printer className="h-4 w-4 mr-2" />
            Print Labels
          </Button>
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <OrdersTable searchQuery={searchQuery} filters={filters} onOrdersLoaded={handleOrdersLoaded} />
    </div>
  )
}
