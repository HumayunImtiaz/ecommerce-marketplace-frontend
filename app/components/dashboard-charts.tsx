"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, Cell, PieChart, Pie, Legend } from "recharts"

const salesData = [
  { name: "Jan", sales: 4000, orders: 240 },
  { name: "Feb", sales: 3000, orders: 139 },
  { name: "Mar", sales: 2000, orders: 980 },
  { name: "Apr", sales: 2780, orders: 390 },
  { name: "May", sales: 1890, orders: 480 },
  { name: "Jun", sales: 2390, orders: 380 },
  { name: "Jul", sales: 3490, orders: 430 },
]

const orderStatusData = [
  { name: "Pending", value: 30, fill: "#f59e0b" },
  { name: "Shipped", value: 45, fill: "#10b981" },
  { name: "Delivered", value: 20, fill: "#3b82f6" },
  { name: "Failed", value: 5, fill: "#ef4444" },
]

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
  shipped: {
    label: "Shipped",
    color: "#10b981",
  },
  delivered: {
    label: "Delivered",
    color: "#3b82f6",
  },
  failed: {
    label: "Failed",
    color: "#ef4444",
  },
}

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly sales and order trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} name="Sales ($)" />
              <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} name="Orders" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Current order status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="flex justify-center gap-4 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-sm">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
