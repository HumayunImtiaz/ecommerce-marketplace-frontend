"use client"

import { useState } from "react"
import { Bell, ShoppingBag, DollarSign, Info, CheckCircle2, Clock } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/hooks/useVendorSocket"
import { formatDistanceToNow } from "date-fns"

interface VendorNotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export function VendorNotificationBell({ 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead 
}: VendorNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border-slate-100">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="font-bold text-[#002147]">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
              className="text-[10px] uppercase tracking-widest font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-900">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-1">We&apos;ll notify you when something important happens.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors mb-1 ${
                  !notification.isRead ? "bg-blue-50/50" : "hover:bg-slate-50"
                }`}
              >
                <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  notification.type === 'order' ? 'bg-orange-100 text-orange-600' :
                  notification.type === 'payout' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notification.type === 'order' ? <ShoppingBag className="h-4 w-4" /> :
                   notification.type === 'payout' ? <DollarSign className="h-4 w-4" /> :
                   <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm leading-tight ${!notification.isRead ? "font-bold text-[#002147]" : "text-slate-600"}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    {!notification.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-100" />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
