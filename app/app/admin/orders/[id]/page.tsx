"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  User,
  Calendar,
  Hash,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react"
import Image from "next/image"

interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

interface Address {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface Order {
  _id: string
  orderNumber: string
  userId: {
    _id: string
    fullName: string
    email: string
  }
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  subtotal: number
  tax: number
  shippingCost: number
  total: number
  paymentMethod: "stripe" | "cod"
  paymentStatus: string
  orderStatus: string
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"]

const getOrderStatusIcon = (status: string) => {
  switch (status) {
    case "pending": return <Clock className="w-4 h-4" />
    case "processing": return <RefreshCw className="w-4 h-4" />
    case "shipped": return <Truck className="w-4 h-4" />
    case "delivered": return <CheckCircle2 className="w-4 h-4" />
    case "cancelled": return <XCircle className="w-4 h-4" />
    default: return <Package className="w-4 h-4" />
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "processing": return "bg-blue-100 text-blue-800 border-blue-200"
    case "shipped": return "bg-purple-100 text-purple-800 border-purple-200"
    case "delivered": return "bg-green-100 text-green-800 border-green-200"
    case "cancelled": return "bg-red-100 text-red-800 border-red-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPaymentBadgeClass = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-800 border-green-200"
    case "failed": return "bg-red-100 text-red-800 border-red-200"
    default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`)
        const data = await res.json()
        if (data.success) {
          setOrder(data.data)
          setNewStatus(data.data.orderStatus)
        }
      } catch (err) {
        console.error("Failed to fetch order:", err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id])

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.orderStatus) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder((prev) => prev ? { ...prev, orderStatus: newStatus, paymentStatus: data.data?.paymentStatus || prev.paymentStatus } : prev)
      } else {
        alert(data.message || "Failed to update status")
      }
    } catch {
      alert("Error updating status")
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkCodPaid = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder((prev) => prev ? { ...prev, orderStatus: "delivered", paymentStatus: "paid" } : prev)
        setNewStatus("delivered")
      } else {
        alert(data.message || "Failed")
      }
    } catch {
      alert("Error")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium ${getStatusBadgeClass(order.orderStatus)}`}>
            {getOrderStatusIcon(order.orderStatus)}
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </Badge>
          <Badge variant="outline" className={`px-3 py-1 text-sm font-medium ${getPaymentBadgeClass(order.paymentStatus)}`}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.selectedColor && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.selectedColor}</span>
                      )}
                      {item.selectedSize && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.selectedSize}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span><span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span><span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{order.billingAddress.name}</p>
                <p>{order.billingAddress.street}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.userId?.fullName || "Unknown"}</p>
              <p className="text-muted-foreground">{order.userId?.email || "N/A"}</p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium flex items-center gap-1">
                  {order.paymentMethod === "cod" ? (
                    <><Package className="w-3.5 h-3.5 text-green-600" /> COD</>
                  ) : (
                    <><CreditCard className="w-3.5 h-3.5 text-blue-600" /> Stripe</>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={getPaymentBadgeClass(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.stripePaymentIntentId && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Payment Intent ID</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">{order.stripePaymentIntentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order ID */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="w-4 h-4" /> Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order #</span>
                <span className="font-mono font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placed</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.orderStatus}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {updating ? "Updating..." : "Apply Status"}
              </Button>
            </CardContent>
          </Card>

          {/* COD: Mark as Paid */}
          {order.paymentMethod === "cod" && order.paymentStatus !== "paid" && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-800">
                  <Package className="w-4 h-4" /> COD Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-3">
                  Customer ne cash payment di? Neeche click karein taake order paid aur delivered mark ho.
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleMarkCodPaid}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                  Mark as Paid (COD Received)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
