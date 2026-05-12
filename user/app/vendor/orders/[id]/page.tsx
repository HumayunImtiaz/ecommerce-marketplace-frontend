"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { vendorApi } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function VendorOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true)
        const { data, success } = await vendorApi.getOrderDetail(params.id)
        if (success) setOrder(data)
        else toast.error("Failed to load order details")
      } catch (err) {
        toast.error("An error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrderDetail()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!order) return <div className="text-center py-20 text-slate-500 font-bold">Order not found.</div>

  const shippingAddress = order.addresses?.find((a: any) => a.type === "shipping")
  const billingAddress = order.addresses?.find((a: any) => a.type === "billing")

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case "pending": return <Badge className="bg-amber-100 text-amber-700 font-bold px-4 py-1.5 rounded-full border-amber-200">Pending</Badge>
      case "processing": return <Badge className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full border-blue-200">Processing</Badge>
      case "shipped": return <Badge className="bg-purple-100 text-purple-700 font-bold px-4 py-1.5 rounded-full border-purple-200">Shipped</Badge>
      case "delivered": return <Badge className="bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full border-emerald-200">Delivered</Badge>
      default: return <Badge variant="secondary" className="px-4 py-1.5 rounded-full">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/vendor/orders" className="flex items-center text-slate-400 hover:text-[#002147] transition-colors font-bold text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-playfair font-black text-[#002147]">Order #{order.orderNumber}</h1>
            {getStatusBadge(order.orderStatus)}
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Calendar className="w-4 h-4" />
            Placed on {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200 shadow-sm h-12">
            Print Invoice
          </Button>
          <Button className="bg-[#002147] text-white hover:bg-[#003366] rounded-xl font-black uppercase tracking-widest text-xs px-8 h-12 shadow-lg shadow-blue-900/10">
            Contact Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items and Tracking */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items Table */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <div className="flex items-center gap-3 text-[#002147]">
                <Package className="w-6 h-6" />
                <CardTitle className="text-lg font-bold">Order Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                    <TableHead className="px-8 font-bold">Product</TableHead>
                    <TableHead className="font-bold">Variation</TableHead>
                    <TableHead className="text-center font-bold">Quantity</TableHead>
                    <TableHead className="text-right px-8 font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#002147] text-base leading-tight">{item.name}</span>
                            <span className="text-xs text-slate-400 font-medium">SKU: {item.product?.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col gap-1">
                          {item.selectedColor && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Color:</span>
                              <Badge variant="outline" className="rounded-md font-bold text-slate-600 bg-white border-slate-200">{item.selectedColor}</Badge>
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Size:</span>
                              <Badge variant="outline" className="rounded-md font-bold text-slate-600 bg-white border-slate-200">{item.selectedSize}</Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <span className="font-black text-[#002147]">x{item.quantity}</span>
                      </TableCell>
                      <TableCell className="py-6 text-right px-8 font-black text-[#002147]">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fulfillment Status */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-[#002147] text-white">
            <CardHeader className="p-8 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#eb9a05]" />
                <CardTitle className="text-lg font-bold">Fulfillment Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                {/* Connector Line */}
                <div className="hidden md:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0"></div>
                
                {[
                  { label: "Pending", icon: Clock, active: true },
                  { label: "Processing", icon: Package, active: ["processing", "shipped", "delivered"].includes(order.orderStatus.toLowerCase()) },
                  { label: "Shipped", icon: Truck, active: ["shipped", "delivered"].includes(order.orderStatus.toLowerCase()) },
                  { label: "Delivered", icon: CheckCircle2, active: order.orderStatus.toLowerCase() === "delivered" }
                ].map((step, idx) => (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-3 bg-[#002147] px-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${
                      step.active ? 'bg-[#eb9a05] border-[#eb9a05] text-[#002147] scale-110 shadow-lg shadow-[#eb9a05]/20' : 'bg-[#002147] border-white/10 text-white/20'
                    }`}>
                      <step.icon className="w-7 h-7" />
                    </div>
                    <span className={`text-sm font-bold ${step.active ? 'text-white' : 'text-white/20'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <div className="flex items-center gap-3 text-[#002147]">
                <User className="w-6 h-6" />
                <CardTitle className="text-lg font-bold">Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="h-12 w-12 rounded-xl bg-white border shadow-sm flex items-center justify-center font-black text-[#002147]">
                    {order.user?.fullName?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#002147] text-lg leading-tight">{order.user?.fullName}</span>
                    <span className="text-xs text-slate-400 font-medium">Customer Since {new Date().getFullYear()}</span>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold">{order.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold">{order.user?.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Shipping Address
                  </h4>
                  {shippingAddress ? (
                    <p className="text-sm text-[#002147] font-bold leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      {shippingAddress.street}<br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                      {shippingAddress.country}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No shipping address provided.</p>
                  )}
                </div>

                <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-start gap-4">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Fulfillment Tip</h4>
                    <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                      Processing orders within 24 hours increases your store rating and helps you get featured in top search results.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-50/50">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-base font-bold text-[#002147]">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Method</span>
                <span className="text-[#002147] font-black uppercase tracking-widest text-[10px] bg-white px-3 py-1 rounded-lg border">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Status</span>
                <Badge className={order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                  {order.paymentStatus?.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
