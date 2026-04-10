"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardCharts } from "@/components/dashboard-charts"
import { RecentActivity } from "@/components/recent-activity"
import { KPICards } from "@/components/kpi-cards"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Loader2, RefreshCcw } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    revenueTrend: string
    ordersTrend: string
    customersTrend: string
  }
  monthlySales: { name: string; sales: number; orders: number }[]
  orderStatusDistribution: { name: string; value: number; fill: string }[]
  recentActivity: {
    id: string
    type: string
    user: string
    avatar: string | null
    action: string
    amount: string | null
    time: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<DateRange | undefined>()

  const fetchDashboard = useCallback(async (range?: DateRange) => {
    try {
      // Use the functional state update or just check the current state 
      // without making it a dependency to avoid infinite loops
      setData(prev => {
        if (!prev) setLoading(true)
        else setRefreshing(true)
        return prev
      })

      let url = "/api/dashboard"
      if (range?.from && range?.to) {
        const start = format(range.from, "yyyy-MM-dd")
        const end = format(range.to, "yyyy-MM-dd")
        url += `?startDate=${start}&endDate=${end}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.message || "Failed to fetch dashboard data")
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, []) // Removed [data] dependency

  useEffect(() => {
    fetchDashboard(date)
  }, [date, fetchDashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {date?.from && date?.to 
              ? `Showing data from ${format(date.from, "PPP")} to ${format(date.to, "PPP")}`
              : "Welcome back! Here's what's happening with your store today."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchDashboard(date)}
            disabled={refreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => fetchDashboard(date)} className="text-xs underline">
            Retry
          </button>
        </div>
      )}

      <KPICards data={data?.kpis || null} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DashboardCharts
            salesData={data?.monthlySales || []}
            orderStatusData={data?.orderStatusDistribution || []}
          />
        </div>
        <div className="col-span-3">
          <RecentActivity activities={data?.recentActivity || []} />
        </div>
      </div>
    </div>
  )
}
