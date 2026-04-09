"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { RevenueMetrics } from "@/components/revenue-metrics"
import { CustomerAnalytics } from "@/components/customer-analytics"
import { ProductAnalytics } from "@/components/product-analytics"
import { Download, RefreshCw } from "lucide-react"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Orders,Customers\n2024-01-01,$1000,50,25"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "analytics-report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCharts dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductAnalytics dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
