"use client"

import type React from "react"
import { Suspense } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Suspense fallback={<div className="w-64 bg-slate-50 border-r border-slate-200 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>}>
          <AdminSidebar />
        </Suspense>
        <SidebarInset className="flex-1">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}