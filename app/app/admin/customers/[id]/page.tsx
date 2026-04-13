"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Mail, Calendar, ShieldCheck, ShieldAlert, Globe, Facebook, Key, ShoppingBag, Eye, Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Customer {
  id: string
  fullName: string
  email: string
  avatar: string | null
  provider: "local" | "google" | "facebook"
  isVerified: boolean
  isDeleted: boolean
  deletionRequested: boolean
  createdAt: string
  lastLogin: string | null
}

interface Order {
  id: string
  orderNumber: string
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, ordersRes] = await Promise.all([
          fetch(`/api/customers/${params.id}`),
          fetch(`/api/customers/${params.id}/orders`)
        ])

        const customerData = await customerRes.json()
        const ordersData = await ordersRes.json()

        if (customerRes.ok && customerData.success) {
          setCustomer(customerData.data)
        } else {
          toast.error(customerData.message || "Failed to fetch customer details")
        }

        if (ordersRes.ok && ordersData.success) {
          setOrders(ordersData.data)
        }
      } catch (error) {
        toast.error("Failed to connect to server")
      } finally {
        setIsLoading(false)
        setIsOrdersLoading(false)
      }
    }

    if (params.id) fetchData()
  }, [params.id])

  const handlePermanentDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/customers/${params.id}/delete`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("User permanently deleted")
        router.push("/admin/customers")
      } else {
        toast.error(data.message || "Failed to delete user")
      }
    } catch {
      toast.error("Failed to connect to server")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button variant="link" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Customers
        </Button>
      </div>
    )
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google": return <Globe className="h-4 w-4 text-blue-500" />
      case "facebook": return <Facebook className="h-4 w-4 text-indigo-600" />
      default: return <Key className="h-4 w-4 text-gray-500" />
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200"
      case "cancelled": return "bg-rose-100 text-rose-800 border-rose-200"
      default: return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="border-gray-200 shadow-sm hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Customer Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-gray-100 text-gray-600">
                  {customer.fullName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{customer.fullName}</h2>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {customer.isVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-0.5">
                    <ShieldAlert className="h-3 w-3 mr-1" /> Unverified
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize px-2.5 py-0.5 border-gray-200">
                   {customer.provider} User
                </Badge>
                {customer.isDeleted && (
                  <Badge variant="destructive" className="px-2.5 py-0.5">Deleted</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2" /> Email Address
                  </p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                    {getProviderIcon(customer.provider)}
                    <span className="ml-2">Auth Provider</span>
                  </p>
                  <p className="font-medium capitalize">{customer.provider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-2" /> Joined Date
                  </p>
                  <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                     <Calendar className="h-3.5 w-3.5 mr-2" /> Last Login
                  </p>
                  <p className="font-medium">{customer.lastLogin ? new Date(customer.lastLogin).toLocaleString() : "Never logged in"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 h-5 text-blue-600" />
                Order History
              </CardTitle>
              <CardDescription>Recent purchases made by this customer</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isOrdersLoading ? (
                <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No orders found for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="font-semibold px-6 py-3">Order #</TableHead>
                          <TableHead className="font-semibold px-6 py-3">Date</TableHead>
                          <TableHead className="font-semibold px-6 py-3">Status</TableHead>
                          <TableHead className="font-semibold px-6 py-3">Total</TableHead>
                          <TableHead className="w-12 px-6 py-3"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="px-6 py-4 font-medium">{order.orderNumber}</TableCell>
                            <TableCell className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className={`capitalize px-2 py-0 border-none ${getOrderStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Link href={`/admin/orders/${order.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Deletion Request Warning */}
          {customer.deletionRequested && (
            <Card className="border-red-300 bg-red-50 shadow-sm">
              <CardHeader className="pb-3 border-b border-red-200">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Account Deletion Requested
                </CardTitle>
                <CardDescription className="text-red-600">
                  This user has requested to delete their account. Review their data and confirm the permanent deletion below.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Permanently Delete User
                  </Button>
                ) : (
                  <div className="bg-white border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-red-800">
                      Are you sure? This action is irreversible. All user data, orders, and history will be permanently removed.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handlePermanentDelete}
                        disabled={isDeleting}
                        className="gap-2"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Yes, Delete Permanently
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
