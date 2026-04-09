"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "order",
    user: "John Doe",
    action: "placed a new order",
    amount: "$299.99",
    time: "2 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    type: "signup",
    user: "Jane Smith",
    action: "signed up",
    time: "5 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    type: "order",
    user: "Mike Johnson",
    action: "completed order",
    amount: "$149.50",
    time: "10 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    type: "return",
    user: "Sarah Wilson",
    action: "requested return",
    amount: "$89.99",
    time: "15 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 5,
    type: "signup",
    user: "Tom Brown",
    action: "signed up",
    time: "20 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest customer activities and orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                  {activity.amount && <span className="font-medium text-green-600 ml-1">{activity.amount}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge
                variant={
                  activity.type === "order" ? "default" : activity.type === "signup" ? "secondary" : "destructive"
                }
              >
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
