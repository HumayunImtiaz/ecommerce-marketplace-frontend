"use client"

import { useEffect, useState } from "react"
import {
  User, MapPin, Package, Heart, Settings, Loader2,
  CheckCircle, Clock, Truck, XCircle, ChevronDown, ChevronUp
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { useWishlist } from "@/contexts/WishlistContext"
import ProductCard from "@/components/ProductCard"

import { orderApi } from "@/lib/api"

// ─── Order types 
interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

interface Order {
  id: string
  _id?: string
  orderNumber: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shippingCost: number
  paymentMethod: "stripe" | "cod"
  paymentStatus: "pending" | "paid" | "failed"
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string; street: string; city: string; state: string; zipCode: string; country: string
  }
  createdAt: string
}

// ─── Status badge 
function StatusBadge({ status }: { status: Order["orderStatus"] }) {
  const map = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
    processing: { color: "bg-blue-100 text-blue-800", icon: Package, label: "Processing" },
    shipped: { color: "bg-purple-100 text-purple-800", icon: Truck, label: "Shipped" },
    delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Delivered" },
    cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
  }
  const { color, icon: Icon, label } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  )
}

// ─── Single Order Card 
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div>
            <p className="font-semibold text-sm text-blue-600">{order.orderNumber}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-bold">${order.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500 capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
            </p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          {/* Items */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                      {item.selectedColor && ` · ${item.selectedColor}`}
                      {item.selectedSize && ` · ${item.selectedSize}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Shipping Address</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.name}, {order.shippingAddress.street},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Payment status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Payment:</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === "paid"
              ? "bg-green-100 text-green-700"
              : order.paymentStatus === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
              }`}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

import { useSearchParams } from "next/navigation"

// ─── Main Account Page ────────────────────────────────────────────────────────
export default function AccountPage() {
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const { items: wishlistItems, isLoading: wishlistLoading } = useWishlist()

  // Get initial tab from URL if present
  const initialTab = searchParams.get("tab") || "profile"
  const [activeTab, setActiveTab] = useState(initialTab)

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
  })

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({ ...prev, name: user.name || "", email: user.email || "" }))
    }
  }, [user])

  // Fetch orders when tab opens
  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      const fetchOrders = async () => {
        setOrdersLoading(true)
        try {
          const { data, success } = await orderApi.getOrders()
          if (success && Array.isArray(data)) {
            setOrders(data)
          }
        } catch {
          // silent
        } finally {
          setOrdersLoading(false)
        }
      }
      fetchOrders()
    }
  }, [activeTab])

  const handleSaveProfile = () => {
    addToast("Profile updated successfully!", "success")
    setIsEditing(false)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600">You need to be logged in to access your account.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                    {tab.id === "orders" && orders.length > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {orders.length}
                      </span>
                    )}
                  </button>
                )
              })}
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <button onClick={() => setIsEditing(!isEditing)} className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium">
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "name", label: "Full Name", type: "text" },
                    { key: "email", label: "Email Address", type: "email" },
                    { key: "phone", label: "Phone Number", type: "tel" },
                    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2">{label}</label>
                      <input
                        type={type}
                        value={(profileData as any)[key]}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, [key]: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-4 mt-6">
                    <button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-medium">Cancel</button>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Order History</h2>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No orders yet</p>
                    <p className="text-sm text-gray-500 mt-1">When you place orders, they will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                </div>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No addresses saved</p>
                  <p className="text-sm text-gray-500 mt-2">Add addresses for faster checkout.</p>
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
                
                {wishlistLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500 mt-2">Save items you love to shop them later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      {["Order updates and shipping notifications", "Promotional emails and special offers", "Product recommendations"].map((label, i) => (
                        <label key={i} className="flex items-center cursor-pointer">
                          <input type="checkbox" className="mr-3" defaultChecked={i < 2} />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                      Delete Account
                    </button>
                    <p className="text-xs text-gray-500 mt-2">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}