"use client"

import { useEffect, useCallback, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { RevenueMetrics } from "@/components/revenue-metrics"
import { CustomerAnalytics } from "@/components/customer-analytics"
import { ProductAnalytics } from "@/components/product-analytics"
import { Download, RefreshCw } from "lucide-react"
import { AdminLoader } from "@/components/admin-loader"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [date, setDate] = useState<DateRange | undefined>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (rangeStr: string, customRange?: DateRange) => {
    try {
      setData((prev: any) => {
        if (!prev) setLoading(true)
        else setIsRefreshing(true)
        return prev
      })

      let url = `/api/analytics?dateRange=${rangeStr}`
      if (customRange?.from && customRange?.to) {
        const start = format(customRange.from, "yyyy-MM-dd")
        const end = format(customRange.to, "yyyy-MM-dd")
        url += `&startDate=${start}&endDate=${end}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.message || "Failed to fetch analytics data")
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, []) // Removed [data] dependency

  useEffect(() => {
    // Default to '30d' if no custom date is selected
    fetchAnalytics(dateRange, date)
  }, [date, fetchAnalytics]) // Removed dateRange as we are leaning on calendar

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Orders,Customers\n2024-01-01,$1000,50,25"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `analytics-report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <AdminLoader message="Loading analytics..." minHeight="min-h-[60vh]" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAnalytics(dateRange, date)}
            disabled={isRefreshing}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => fetchAnalytics(dateRange)} className="text-xs underline">
            Retry
          </button>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-6">
          <AnalyticsCharts data={data?.dailyTrends || []} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 pt-6">
          <RevenueMetrics data={data?.revenueMetrics || []} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 pt-6">
          <CustomerAnalytics 
            segmentData={data?.customerSegmentData || []} 
            acquisitionData={data?.acquisitionData || []} 
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6 pt-6">
          <ProductAnalytics 
            topProducts={data?.topProducts || []} 
            categoryPerformance={data?.categoryPerformance || []} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
