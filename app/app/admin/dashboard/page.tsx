"use client"
import { DashboardCharts } from "@/components/dashboard-charts"
import { RecentActivity } from "@/components/recent-activity"
import { KPICards } from "@/components/kpi-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      <KPICards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DashboardCharts />
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
