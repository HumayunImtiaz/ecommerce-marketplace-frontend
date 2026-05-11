"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { User, MapPin, Package, Heart, Settings, Loader2, CheckCircle, Clock, Truck, XCircle, ChevronDown, ChevronUp, Camera, Sparkles, LogOut, Shield, ArrowLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { useWishlist } from "@/contexts/WishlistContext"
import ProductCard from "@/components/ProductCard"
import AddressManager from "@/components/AddressManager"
import { useSearchParams } from "next/navigation"
import { orderApi, authApi } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import AddressMapPicker from "@/components/AddressMapPicker"

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

function StatusBadge({ status }: { status: Order["orderStatus"] }) {
  const map = {
    pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: Clock, label: "Pending" },
    processing: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: Package, label: "Processing" },
    shipped: { color: "bg-purple-50 text-purple-700 border-purple-100", icon: Truck, label: "Shipped" },
    delivered: { color: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle, label: "Delivered" },
    cancelled: { color: "bg-red-50 text-red-700 border-red-100", icon: XCircle, label: "Cancelled" },
  }
  const { color, icon: Icon, label } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}>
      <Icon className="w-3 h-3 mr-2" />
      {label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-[2rem] border border-[#eb9a05]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-8 cursor-pointer hover:bg-[#f8f9fa] transition-colors gap-6"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 md:gap-8">
          <div className="p-3 md:p-4 rounded-2xl bg-[#002147]/5 text-[#002147] shrink-0">
            <Package className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-[10px] md:text-xs tracking-widest uppercase text-[#002147] mb-1 truncate">{order.orderNumber}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={order.orderStatus} />
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 border-t sm:border-none pt-4 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-lg md:text-xl font-playfair font-black text-[#002147]">${order.total.toFixed(2)}</p>
            <p className="text-[8px] font-black text-[#eb9a05] uppercase tracking-widest">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
            </p>
          </div>
          <div className={`p-2 rounded-xl bg-gray-50 text-gray-300 transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 md:p-10 space-y-10 border-t border-gray-50 animate-fade-in-up">
          <div>
            <h4 className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 mb-6">Order Items</h4>
            <div className="space-y-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 md:gap-6">
                  <div className="relative w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden bg-[#f8f9fa] border border-gray-100 flex-shrink-0">
                    <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-playfair font-black text-[#002147] truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Qty: {item.quantity}</span>
                      {item.selectedColor && <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">· {item.selectedColor}</span>}
                    </div>
                  </div>
                  <p className="text-sm md:text-lg font-black text-[#002147] shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#f8f9fa] rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40"><span>Shipping</span><span>{order.shippingCost === 0 ? "Gratis" : `$${order.shippingCost.toFixed(2)}`}</span></div>
              <div className="pt-4 border-t border-[#002147]/5 flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-widest text-[#002147]">Total</span>
                <span className="text-xl md:text-2xl font-playfair font-black text-[#002147]">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 mb-2">Shipping Address</h4>
                <p className="text-xs md:text-sm font-medium text-gray-600 leading-relaxed italic">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40">Payment:</span>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${order.paymentStatus === "paid" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountContent() {
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const { items: wishlistItems, isLoading: wishlistLoading } = useWishlist()

  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "dashboard")
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(getImageUrl(user?.avatar))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [deletionPending, setDeletionPending] = useState(false)
  const [deletionLoading, setDeletionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [emailPrefs, setEmailPrefs] = useState({ orderUpdates: true, promotionalEmails: true, productRecommendations: false })
  const [prefsLoading, setPrefsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "", email: user.email || "", phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : ""
      })
      setAvatarPreview(getImageUrl(user?.avatar))
    }
  }, [user])

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      const fetchOrders = async () => {
        setOrdersLoading(true)
        try {
          const { data, success } = await orderApi.getOrders()
          if (success && Array.isArray(data)) setOrders(data)
        } catch { } finally { setOrdersLoading(false) }
      }
      fetchOrders()
    }
    if (activeTab === "settings") {
      const fetchPrefs = async () => {
        setPrefsLoading(true)
        try {
          const { data, success } = await authApi.getEmailPreferences()
          if (success && data) setEmailPrefs(data)
        } catch { } finally { setPrefsLoading(false) }
      }
      fetchPrefs()
    }
  }, [activeTab])

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      formData.append("fullName", profileData.name)
      formData.append("email", profileData.email)
      formData.append("phone", profileData.phone)
      formData.append("dateOfBirth", profileData.dateOfBirth)
      if (avatarFile) formData.append("avatar", avatarFile)

      const res = await authApi.updateProfile(formData)
      if (res.success) { addToast("Identity successfully updated.", "success"); setIsEditing(false) }
      else { addToast(res.message || "Failed to update identity.", "error") }
    } catch { addToast("Communication failure.", "error") }
  }

  const handleTogglePref = async (key: keyof typeof emailPrefs) => {
    const newPrefs = { ...emailPrefs, [key]: !emailPrefs[key] }
    setEmailPrefs(newPrefs)
    try {
      const result = await authApi.updateEmailPreferences({ [key]: newPrefs[key] })
      if (!result.success) { setEmailPrefs(emailPrefs); addToast(result.message || "Preference update failed.", "error") }
    } catch { setEmailPrefs(emailPrefs); addToast("Communication failure.", "error") }
  }

  const handleRequestDeletion = async () => {
    setDeletionLoading(true)
    try {
      const result = await authApi.requestDeletion()
      if (result.success || result.message === "Deletion already requested") { setDeletionPending(true); setShowDeleteConfirm(false); addToast("Dissolution request submitted.", "success") }
      else { addToast(result.message || "Request failed.", "error") }
    } catch { addToast("Communication failure.", "error") } finally { setDeletionLoading(false) }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  if (!user) return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#eb9a05]" /></div>

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="hidden md:block h-px w-8 bg-[#eb9a05]"></div>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">Account Dashboard</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-playfair font-black" style={{ color: 'var(--primary)' }}>{activeTab === 'dashboard' ? 'Welcome Back' : tabs.find(t => t.id === activeTab)?.label}</h1>

            {activeTab === 'dashboard' && (
              <div className="mt-8 lg:hidden flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#002147] flex items-center justify-center text-[#eb9a05]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-playfair font-black text-[#002147]">{user?.name}</h2>
                <p className="text-[10px] font-bold text-[#eb9a05] uppercase tracking-widest mt-1">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar - Hidden on mobile if viewing a sub-page */}
          <div className={`lg:col-span-1 ${activeTab !== 'dashboard' ? 'hidden lg:block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-[#eb9a05]/10 sticky top-28">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#f8f9fa] shadow-2xl mb-6">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#002147] flex items-center justify-center text-[#eb9a05]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-playfair font-black text-[#002147] truncate w-full">{user.name}</h2>
                <p className="text-[10px] font-bold text-[#eb9a05] uppercase tracking-[0.2em] mt-2 truncate w-full">{user.email}</p>
              </div>

              <nav className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all group ${activeTab === tab.id ? "bg-[#002147] text-[#eb9a05] shadow-xl" : "text-gray-400 hover:bg-gray-50 hover:text-[#002147]"}`}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#eb9a05]' : ''}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                      {tab.id === "orders" && orders.length > 0 && (
                        <span className="ml-auto bg-[#eb9a05] text-[#002147] text-[8px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {orders.length}
                        </span>
                      )}
                    </button>
                  )
                })}
                <div className="pt-6 border-t border-gray-50 mt-6">
                  <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-red-400 hover:bg-red-50 transition-all group">
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className={`lg:col-span-3 ${activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-[#eb9a05]/10 min-h-[600px] animate-fade-in-up">
              {/* Back Button for Mobile */}
              {activeTab !== 'dashboard' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="lg:hidden flex items-center gap-2 text-[#eb9a05] text-[10px] font-black uppercase tracking-widest mb-10 group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Back to Dashboard
                </button>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-playfair font-black text-[#002147]">Profile Information</h2>
                    <button onClick={() => setIsEditing(!isEditing)} className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${isEditing ? 'bg-red-50 text-red-500' : 'bg-[#f8f9fa] text-[#eb9a05] hover:bg-[#002147] hover:text-white shadow-sm'}`}>
                      {isEditing ? "Discard" : "Update Profile"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { key: "name", label: "Full Name", type: "text" },
                      { key: "email", label: "Email Address", type: "email" },
                      { key: "phone", label: "Phone Number", type: "tel" },
                      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 mb-3 ml-4">{label}</label>
                        <input
                          type={type}
                          value={(profileData as any)[key]}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, [key]: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm disabled:opacity-40"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-50">
                    <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 mb-6 ml-2">Profile Picture</label>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div
                        className={`relative w-32 h-32 rounded-3xl overflow-hidden group transition-all duration-500 shadow-xl ${isEditing ? 'cursor-pointer ring-4 ring-[#eb9a05]/20' : ''}`}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-[#002147] flex items-center justify-center text-[#eb9a05]">
                            <User className="w-12 h-12" />
                          </div>
                        )}
                        {isEditing && (
                          <div className="absolute inset-0 bg-[#002147]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) } }} />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-playfair font-black text-[#002147] mb-2">Change Profile Picture</p>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-[180px]">Square images (1:1) work best for your digital identity.</p>
                        {isEditing && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 text-[10px] font-black text-[#eb9a05] uppercase tracking-widest border-b border-[#eb9a05]/20 hover:border-[#eb9a05] transition-all"
                          >
                            Upload New
                          </button>
                        )}
                      </div>
                    </div>
                  </div>


                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-16 animate-fade-in-up">
                      <button onClick={handleSaveProfile} className="flex-1 btn-primary py-5 px-12 text-[10px] font-black tracking-widest uppercase shadow-2xl">Save Changes</button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 px-12 py-5 rounded-2xl border-2 border-gray-100 text-[#002147] font-black text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all">Discard</button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">Purchase History</h2>

                  {ordersLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                      <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40">Loading Orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-32 bg-[#f8f9fa] rounded-[3rem] border-2 border-dashed border-[#eb9a05]/20">
                      <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                      <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2">No Orders Found</h3>
                      <p className="text-gray-400 text-sm italic font-medium">You haven't placed any orders yet.</p>
                      <Link href="/products" className="btn-primary mt-8 inline-block px-10 py-4 uppercase tracking-widest text-[10px] font-black">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                      {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="animate-fade-in-up">
                  {isAddingAddress ? (
                    <div>
                      <div className="flex items-center gap-6 mb-12">
                        <button onClick={() => setIsAddingAddress(false)} className="p-3 rounded-2xl bg-gray-50 text-[#002147] hover:bg-[#002147] hover:text-white transition-all">
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-3xl font-playfair font-black text-[#002147]">New Address</h2>
                      </div>
                      <div className="bg-white rounded-[3rem] border border-[#eb9a05]/10 shadow-2xl overflow-hidden">
                        <AddressMapPicker 
                          isOpen={true} 
                          onClose={() => setIsAddingAddress(false)} 
                          onAddressSelect={async (address) => {
                            try {
                              const response = await fetch('/api/auth/user/addresses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(address),
                              })
                              if (response.ok) {
                                addToast("Address established successfully", "success")
                                setIsAddingAddress(false)
                                // Trigger a refresh of the address list by briefly toggling activeTab or just relying on component remount
                              }
                            } catch (error) { addToast("Failed to secure address", "error") }
                          }} 
                          isFullPage={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">Saved Addresses</h2>
                      <AddressManager onAddClick={() => setIsAddingAddress(true)} />
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">My Wishlist</h2>

                  {wishlistLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                      <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-32 bg-[#f8f9fa] rounded-[3rem] border-2 border-dashed border-[#eb9a05]/20">
                      <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                      <p className="text-xl font-playfair font-bold text-[#002147]">Your wishlist is empty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                      {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">Account Settings</h2>

                  <div className="space-y-12">
                    <div className="bg-[#f8f9fa] rounded-[2.5rem] p-10 border border-gray-50">
                      <div className="flex items-center gap-4 mb-8">
                        <Sparkles className="w-5 h-5 text-[#eb9a05]" />
                        <h3 className="text-sm font-black tracking-widest uppercase text-[#002147]">Email Notifications</h3>
                      </div>
                      {prefsLoading ? (
                        <div className="flex items-center gap-4 py-4 text-[#eb9a05]">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-black tracking-widest uppercase">Loading Preferences...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {[
                            { id: "orderUpdates", label: "Order & Shipping Notifications" },
                            { id: "promotionalEmails", label: "Promotional Emails & Offers" },
                            { id: "productRecommendations", label: "Product Recommendations" },
                          ].map((pref) => (
                            <label key={pref.id} className="flex items-center justify-between cursor-pointer group p-4 rounded-2xl hover:bg-white transition-all">
                              <span className="text-xs font-bold text-gray-600 group-hover:text-[#002147] transition-colors">{pref.label}</span>
                              <div className="relative flex items-center">
                                <input type="checkbox" className="sr-only peer" checked={(emailPrefs as any)[pref.id]} onChange={() => handleTogglePref(pref.id as any)} />
                                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002147]"></div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-red-50/30 rounded-[2.5rem] p-10 border border-red-100">
                      <div className="flex items-center gap-4 mb-6">
                        <Shield className="w-5 h-5 text-red-400" />
                        <h3 className="text-sm font-black tracking-widest uppercase text-red-600">Danger Zone</h3>
                      </div>

                      {deletionPending ? (
                        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl flex items-center gap-6">
                          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-red-600 tracking-widest uppercase">Account Deletion Pending</p>
                            <p className="text-xs text-gray-400 italic mt-1">Our team is reviewing your request for account deletion.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                          <p className="text-xs text-gray-400 italic max-w-xs">Permanent account deletion requires manual verification from our team.</p>
                          <button onClick={() => setShowDeleteConfirm(true)} className="px-10 py-5 rounded-2xl bg-white border-2 border-red-100 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all shadow-xl">Delete Account</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="lg:hidden grid grid-cols-1 gap-4 animate-fade-in-up">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center justify-between p-8 bg-white rounded-3xl border border-[#eb9a05]/10 shadow-xl group active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#002147]/5 flex items-center justify-center text-[#002147] group-hover:bg-[#002147] group-hover:text-[#eb9a05] transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-playfair font-black text-[#002147]">{tab.label}</p>
                        <p className="text-[8px] font-black tracking-widest uppercase text-gray-300 mt-1">Manage your {tab.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#eb9a05]" />
                  </button>
                )
              })}
              <button
                onClick={logout}
                className="flex items-center justify-between p-8 bg-red-50/30 rounded-3xl border border-red-100 shadow-xl group active:scale-95 transition-all mt-4"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-playfair font-black text-red-600">Sign Out</p>
                    <p className="text-[8px] font-black tracking-widest uppercase text-red-300 mt-1">Terminate current session</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002147]/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-12 text-center animate-in zoom-in-95 duration-500 border border-[#eb9a05]/20">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-3xl font-playfair font-black text-[#002147] mb-4">Confirm Account Deletion?</h3>
            <p className="text-sm text-gray-400 italic mb-10 leading-relaxed">
              This action is permanent. Once confirmed, your account, order history, and personal data will be permanently deleted.
            </p>
            <div className="flex flex-col gap-4">
              <button onClick={handleRequestDeletion} disabled={deletionLoading} className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center justify-center gap-3">
                {deletionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Permanently Delete"}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-5 bg-[#f8f9fa] text-[#002147] rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#eb9a05]" /></div>}>
      <AccountContent />
    </Suspense>
  )
}