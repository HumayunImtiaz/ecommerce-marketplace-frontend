"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const topProducts = [
  { name: "Wireless Headphones", sales: 245, revenue: 24500, growth: 12.5 },
  { name: "Smart Watch", sales: 189, revenue: 56700, growth: 8.3 },
  { name: "Laptop Stand", sales: 156, revenue: 12480, growth: -2.1 },
  { name: "Coffee Mug", sales: 134, revenue: 2680, growth: 15.7 },
  { name: "Phone Case", sales: 98, revenue: 2940, growth: 5.2 },
]

const categoryPerformance = [
  { category: "Electronics", sales: 1245, target: 1500, performance: 83 },
  { category: "Home & Garden", sales: 890, target: 1000, performance: 89 },
  { category: "Fashion", sales: 567, target: 800, performance: 71 },
  { category: "Sports", sales: 345, target: 400, performance: 86 },
]

interface ProductAnalyticsProps {
  dateRange: string
}

export function ProductAnalytics({ dateRange }: ProductAnalyticsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Best selling products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.sales}</TableCell>
                    <TableCell className="text-right">${product.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.growth > 0 ? "default" : "destructive"}>
                        {product.growth > 0 ? "+" : ""}
                        {product.growth}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Sales performance vs targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryPerformance.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.category}</span>
                <span className="text-sm text-muted-foreground">
                  {category.sales} / {category.target}
                </span>
              </div>
              <Progress value={category.performance} />
              <div className="text-xs text-muted-foreground">{category.performance}% of target achieved</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
