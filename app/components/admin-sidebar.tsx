"use client"

import { useState, useEffect } from "react"
import { BarChart3, Package, ShoppingCart, Users, Megaphone, Settings, Home, ChevronDown, Mail, MessageCircle, Store, DollarSign } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface CategoryItem {
  _id: string
  name: string
  slug: string
  isActive: boolean
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Vendors",
    url: "/admin/vendors",
    icon: Store,
  },
  {
    title: "Payouts",
    url: "/admin/payouts",
    icon: DollarSign,
  },
  {
    title: "Newsletter",
    url: "/admin/newsletter",
    icon: Mail,
  },
  {
    title: "Coupons",
    url: "/admin/coupons",
    icon: ShoppingCart, // Changed icon for variety, or keep Megaphone? Let's use Ticket if available, otherwise ShoppingCart is fine. Actually, let's look for a better icon.
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Inquiries",
    url: "/admin/inquiries",
    icon: Mail,
  },
  {
    title: "Live Chat",
    url: "/admin/inbox",
    icon: MessageCircle,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  const [productsOpen, setProductsOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryItem[]>([])

  const isProductsActive = pathname.startsWith("/admin/products")

  useEffect(() => {
    if (isProductsActive) {
      setProductsOpen(true)
    }
  }, [isProductsActive])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const result = await response.json()
        if (result?.success && Array.isArray(result.data)) {
          setCategories(result.data.filter((cat: CategoryItem) => cat.isActive))
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"} className="transition-all hover:bg-slate-100">
                  <Link href="/admin/dashboard">
                    <Home className="h-4 w-4" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Products Dropdown */}
              <SidebarMenuItem className="flex flex-col">
                <SidebarMenuButton
                  isActive={isProductsActive && !productsOpen}
                  onClick={() => setProductsOpen((prev) => !prev)}
                  className={`cursor-pointer justify-between transition-all duration-200 ${productsOpen ? "bg-accent text-primary font-semibold shadow-sm" : "font-medium hover:bg-accent"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className={`h-4 w-4 transition-colors ${productsOpen ? "text-primary" : ""}`} />
                    <span>Products</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] ${productsOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                      }`}
                  />
                </SidebarMenuButton>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${productsOpen ? "grid-rows-[1fr] opacity-100 mt-2 text-foreground" : "grid-rows-[0fr] opacity-0 mt-0 text-transparent"
                    }`}
                >
                  <div className="overflow-hidden ml-[22px] space-y-1 border-l-2 border-border pl-3 py-1">
                    <Link
                      href="/admin/products/approval"
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${pathname === "/admin/products/approval"
                        ? "bg-amber-50 text-amber-600 shadow-sm"
                        : "text-amber-600/70 hover:text-amber-600 hover:bg-amber-50/50"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${pathname === "/admin/products/approval"
                        ? "bg-amber-500 scale-125 ring-4 ring-amber-500/20"
                        : "bg-amber-500/50 group-hover:bg-amber-500"
                        }`}></span>
                      Approval Queue
                    </Link>

                    <Link
                      href="/admin/products"
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${pathname === "/admin/products" && !currentCategory
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${pathname === "/admin/products" && !currentCategory
                        ? "bg-primary scale-125 ring-4 ring-primary/20"
                        : "bg-muted-foreground/30 group-hover:bg-muted-foreground"
                        }`}></span>
                      All Products
                    </Link>

                    {categories.length > 0 && (
                      <div className="px-3 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">
                        Categories
                      </div>
                    )}

                    {categories.map((cat) => {
                      const isActive = pathname === "/admin/products" && currentCategory === cat.slug;
                      return (
                        <Link
                          key={cat._id}
                          href={`/admin/products?category=${cat.slug}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive
                            ? "bg-primary scale-125 ring-4 ring-primary/20"
                            : "bg-muted-foreground/30 group-hover:bg-muted-foreground"
                            }`}></span>
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </SidebarMenuItem>

              {/* Rest of menu items */}
              {menuItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}