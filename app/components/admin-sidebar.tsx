"use client"

import { useState, useEffect } from "react"
import { BarChart3, Package, ShoppingCart, Users, Megaphone, Settings, Home, ChevronDown, Mail, MessageCircle } from "lucide-react"
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
    title: "Marketing",
    url: "/admin/marketing",
    icon: Megaphone,
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
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navigation</SidebarGroupLabel>
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
                  className={`cursor-pointer justify-between transition-all duration-200 ${productsOpen ? "bg-slate-100/80 text-blue-600 font-semibold shadow-sm" : "font-medium hover:bg-slate-100"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className={`h-4 w-4 transition-colors ${productsOpen ? "text-blue-600" : ""}`} />
                    <span>Products</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] ${productsOpen ? "rotate-180 text-blue-600" : "text-slate-400"
                      }`}
                  />
                </SidebarMenuButton>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${productsOpen ? "grid-rows-[1fr] opacity-100 mt-2 text-slate-900" : "grid-rows-[0fr] opacity-0 mt-0 text-transparent"
                    }`}
                >
                  <div className="overflow-hidden ml-[22px] space-y-1 border-l-2 border-slate-100 pl-3 py-1">
                    <Link
                      href="/admin/products"
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${pathname === "/admin/products" && !currentCategory
                        ? "bg-blue-50/80 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${pathname === "/admin/products" && !currentCategory
                        ? "bg-blue-600 scale-125 ring-4 ring-blue-100"
                        : "bg-slate-300 group-hover:bg-slate-400"
                        }`}></span>
                      All Products
                    </Link>

                    {categories.map((cat) => {
                      const isActive = pathname === "/admin/products" && currentCategory === cat.slug;
                      return (
                        <Link
                          key={cat._id}
                          href={`/admin/products?category=${cat.slug}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${isActive
                            ? "bg-blue-50/80 text-blue-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive
                            ? "bg-blue-600 scale-125 ring-4 ring-blue-100"
                            : "bg-slate-300 group-hover:bg-slate-400"
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