"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react"

const revenueMetrics = [
  {
    title: "Total Revenue",
    value: "$124,563.89",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    progress: 75,
  },
  {
    title: "Average Order Value",
    value: "$89.32",
    change: "+5.2%",
    trend: "up",
    icon: TrendingUp,
    progress: 60,
  },
  {
    title: "Payment Success Rate",
    value: "98.7%",
    change: "-0.3%",
    trend: "down",
    icon: CreditCard,
    progress: 98,
  },
  {
    title: "Refund Rate",
    value: "2.1%",
    change: "-0.8%",
    trend: "down",
    icon: Wallet,
    progress: 21,
  },
]

interface RevenueMetricsProps {
  dateRange: string
}

export function RevenueMetrics({ dateRange }: RevenueMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {revenueMetrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground flex items-center">
                {metric.trend === "up" ? (
                  <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
              </p>
            </div>
            <Progress value={metric.progress} className="mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
