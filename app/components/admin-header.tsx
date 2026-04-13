"use client"

import { useEffect, useState } from "react"

import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useRouter } from "next/navigation"
import { adminLogoutAction, getAdminAction } from "@/app/actions/auth.actions"

export function AdminHeader() {
  const { push } = useRouter()
  const [admin, setAdmin] = useState<{ name: string | null; email: string | null; avatar: string | null } | null>(null)

  useEffect(() => {
    getAdminAction().then((data) => {
      setAdmin(data)
    })
  }, [])

  const handleLogout = async () => {
    await adminLogoutAction()
    push("/login")
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger />

      <div className="flex-1 flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden w-8 h-8 focus-visible:ring-0">
              {admin?.avatar ? (
                <img 
                  src={admin.avatar.startsWith("http") ? admin.avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/uploads/${admin.avatar}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => push("/admin/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => push("/admin/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}