"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ProductAnalyticsProps {
  topProducts: {
    name: string
    sales: number
    revenue: number
    growth: number
  }[]
  categoryPerformance: {
    category: string
    sales: number
    target: number
    performance: number
  }[]
}

export function ProductAnalytics({ topProducts, categoryPerformance }: ProductAnalyticsProps) {
  const products = topProducts.length > 0 ? topProducts : []
  const categories = categoryPerformance.length > 0 ? categoryPerformance : []

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
                {products.map((product) => (
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
          {categories.map((category) => (
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
