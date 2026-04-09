"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

const customerSegmentData = [
  { segment: "New", count: 245, value: 15600, fill: "#10b981" },
  { segment: "Returning", count: 189, value: 28900, fill: "#3b82f6" },
  { segment: "VIP", count: 67, value: 45200, fill: "#8b5cf6" },
  { segment: "Inactive", count: 123, value: 5400, fill: "#f59e0b" },
]

const acquisitionData = [
  { channel: "Organic", customers: 145 },
  { channel: "Social Media", customers: 89 },
  { channel: "Email", customers: 67 },
  { channel: "Paid Ads", customers: 123 },
  { channel: "Referral", customers: 45 },
]

const chartConfig = {
  customers: {
    label: "Customers",
    color: "hsl(var(--chart-1))",
  },
  value: {
    label: "Value ($)",
    color: "hsl(var(--chart-2))",
  },
}

interface CustomerAnalyticsProps {
  dateRange: string
}

export function CustomerAnalytics({ dateRange }: CustomerAnalyticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Distribution by customer type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <PieChart>
              <Pie
                data={customerSegmentData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {customerSegmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {customerSegmentData.map((item) => (
              <div key={item.segment} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span>
                  {item.segment}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition</CardTitle>
          <CardDescription>New customers by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <BarChart data={acquisitionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="channel" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="customers" fill="var(--color-customers)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
