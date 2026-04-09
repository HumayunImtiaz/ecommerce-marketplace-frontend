"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

const kpis = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "1,234",
    change: "+19%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-0.5%",
    trend: "down",
    icon: TrendingUp,
  },
]

export function KPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {kpi.trend === "up" ? (
                <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>{kpi.change}</span> from last
              month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
