"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
    try {
      const res = await fetch(`/api/notifications`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (err) {
      console.error("Fetch notifications failed", err)
    }
  }

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error(err)
    }
  }

  const removeNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
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
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 border-b last:border-b-0 hover:bg-accent/50 cursor-pointer ${
                  !notification.isRead ? "bg-accent/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${getTypeColor(notification.type)}`}>{notification.title}</p>
                      {!notification.isRead && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => markAsRead(notification._id, e)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => removeNotification(notification._id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
          <Button variant="ghost" size="sm" className="w-full">
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
