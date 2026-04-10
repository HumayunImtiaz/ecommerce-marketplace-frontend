"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, Cell, PieChart, Pie, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface SalesDataItem {
  name: string
  sales: number
  orders: number
}

interface OrderStatusItem {
  name: string
  value: number
  fill: string
}

interface DashboardChartsProps {
  salesData: SalesDataItem[]
  orderStatusData: OrderStatusItem[]
}

const chartConfig = {
  sales: {
    label: "Sales ($)",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
}

const pieChartConfig = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  processing: {
    label: "Processing",
    color: "#8b5cf6",
  },
  shipped: {
    label: "Shipped",
    color: "#3b82f6",
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
  },
}

export function DashboardCharts({ salesData, orderStatusData }: DashboardChartsProps) {
  const isLoading = salesData.length === 0 && orderStatusData.length === 0

  // Calculate total for percentages
  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly sales and order trends</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} name="Sales ($)" />
                <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} name="Orders" />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Current order status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
              <div className="flex justify-center gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20" />
                ))}
              </div>
            </div>
          ) : orderStatusData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No order data available
            </div>
          ) : (
            <>
              <ChartContainer config={pieChartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm">
                      {item.name}: {item.value} ({totalOrders > 0 ? Math.round((item.value / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
