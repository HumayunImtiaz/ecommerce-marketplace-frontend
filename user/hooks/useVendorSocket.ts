"use client"

import { useEffect, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"

export interface Notification {
  id: string
  message: string
  type: "order" | "payout" | "system"
  createdAt: Date
  isRead: boolean
  data?: any
}

export function useVendorSocket(vendorId: string | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!vendorId) return

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to notification server")
      newSocket.emit("join_vendor", vendorId)
    })

    const handleNewOrder = (data: any) => {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        message: data.message || "New order received!",
        type: "order",
        createdAt: new Date(),
        isRead: false,
        data: data
      }
      
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      toast.success("New Order Received!", {
        description: data.message,
      })
    }

    const handlePayoutApproved = (data: any) => {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        message: data.message || "Your payout has been approved!",
        type: "payout",
        createdAt: new Date(),
        isRead: false,
        data: data
      }
      
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      toast.success("Payout Approved!", {
        description: data.message,
      })
    }

    newSocket.on("new_order", handleNewOrder)
    newSocket.on("payout_approved", handlePayoutApproved)

    return () => {
      newSocket.disconnect()
    }
  }, [vendorId])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}
