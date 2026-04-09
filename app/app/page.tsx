import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            LuxeCart Admin Panel
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Manage your e-commerce platform with our comprehensive admin dashboard. Track sales, manage products, and
            analyze customer data all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/admin/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Get an overview of your business metrics and KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/dashboard">View Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product catalog and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/products">Manage Products</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Process and track customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
