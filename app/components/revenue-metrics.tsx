"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, CreditCard, Wallet, LucideIcon } from "lucide-react"

interface RevenueMetricsProps {
  data: {
    title: string
    value: string
    change: string
    trend: string
    progress: number
  }[]
}

const iconMap: Record<string, LucideIcon> = {
  "Total Revenue": DollarSign,
  "Average Order Value": TrendingUp,
  "Payment Success Rate": CreditCard,
  "Refund Rate": Wallet,
}

export function RevenueMetrics({ data }: RevenueMetricsProps) {
  const metrics = data.length > 0 ? data : []

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.title] || DollarSign;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
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
                  <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {metric.change}
                  </span>
                </p>
              </div>
              <Progress value={metric.progress} className="mt-3" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
