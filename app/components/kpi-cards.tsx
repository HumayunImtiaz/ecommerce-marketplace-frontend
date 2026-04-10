"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KPIData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueTrend: string
  ordersTrend: string
  customersTrend: string
}

interface KPICardsProps {
  data: KPIData | null
}

export function KPICards({ data }: KPICardsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-28 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: "Revenue",
      value: `$${data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.revenueTrend,
      trend: data.revenueTrend.startsWith("+") ? "up" : data.revenueTrend.startsWith("-") ? "down" : "neutral",
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: data.totalOrders.toLocaleString(),
      change: data.ordersTrend,
      trend: data.ordersTrend.startsWith("+") ? "up" : data.ordersTrend.startsWith("-") ? "down" : "neutral",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      value: data.totalCustomers.toLocaleString(),
      change: data.customersTrend,
      trend: data.customersTrend.startsWith("+") ? "up" : data.customersTrend.startsWith("-") ? "down" : "neutral",
      icon: Users,
    },
    {
      title: "Products",
      value: data.totalProducts.toLocaleString(),
      change: "",
      trend: "neutral",
      icon: Package,
    },
  ]

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
            {kpi.change && (
              <p className="text-xs text-muted-foreground flex items-center">
                {kpi.trend === "up" ? (
                  <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                ) : kpi.trend === "down" ? (
                  <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                ) : null}
                <span className={kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? "text-red-500" : ""}>
                  {kpi.change}
                </span>{" "}
                from last period
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
