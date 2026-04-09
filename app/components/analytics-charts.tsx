"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, Bar, BarChart, Area, AreaChart } from "recharts"

const overviewData = [
  { date: "Jan 1", revenue: 4000, orders: 240, visitors: 1200 },
  { date: "Jan 8", revenue: 3000, orders: 139, visitors: 980 },
  { date: "Jan 15", revenue: 2000, orders: 980, visitors: 1100 },
  { date: "Jan 22", revenue: 2780, orders: 390, visitors: 1300 },
  { date: "Jan 29", revenue: 1890, orders: 480, visitors: 1050 },
  { date: "Feb 5", revenue: 2390, orders: 380, visitors: 1200 },
  { date: "Feb 12", revenue: 3490, orders: 430, visitors: 1400 },
]

const chartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-3))",
  },
}

interface AnalyticsChartsProps {
  dateRange: string
}

export function AnalyticsCharts({ dateRange }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
            <AreaChart data={overviewData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>Order volume trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <BarChart data={overviewData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill="var(--color-orders)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Traffic</CardTitle>
          <CardDescription>Visitor trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
            <LineChart data={overviewData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
