"use client"

import { useState, useEffect } from "react"
import { Bell, Trash2, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"

interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: string
  relatedId?: string
  relatedModel?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"
    const newSocket = io(backendUrl)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      newSocket.emit("join_admin")
    })

    newSocket.on("new_notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (err) {
      console.error("Fetch notifications failed", err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error(err)
    }
  }

  const removeNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n._id)
    if (n.relatedModel === "Order" && n.relatedId) {
      router.push(`/admin/orders/${n.relatedId}`)
    } else if (n.relatedModel === "Contact") {
      router.push(`/admin/inbox`)
    } else if (n.relatedModel === "User" && n.relatedId) {
      router.push(`/admin/customers/${n.relatedId}`)
    } else if (n.relatedModel === "Product" && n.relatedId) {
      router.push(`/admin/products/${n.relatedId}`)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTypeTextColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    // Apply status filter
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.isRead)
    } else if (filter === "read") {
      filtered = filtered.filter((n) => n.isRead)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            All Notifications
          </h1>
          <p className="text-muted-foreground">
            {notifications.length} total notifications ({unreadCount} unread)
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm">
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="text-xs"
            >
              Unread
            </Button>
            <Button
              variant={filter === "read" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("read")}
              className="text-xs"
            >
              Read
            </Button>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Loading notifications...
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">
                  {searchQuery ? "Try a different search term" : "Come back later for updates"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`cursor-pointer transition-all border-l-4 ${
                getTypeColor(notification.type)
              } ${!notification.isRead ? "font-medium" : ""}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-base font-semibold ${getTypeTextColor(notification.type)}`}>
                        {notification.title}
                      </h3>
                      <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
                  </div>

                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification._id)
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification._id)
                      }}
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
