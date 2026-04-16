"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Mail, User, Tag, Calendar, FileText, Send, X, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Inquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  category: string
  orderNumber?: string
  isRead: boolean
  createdAt: string
}

interface InquiryDetailModalProps {
  inquiry: Inquiry | null
  isOpen: boolean
  onClose: () => void
}

export function InquiryDetailModal({ inquiry, isOpen, onClose }: InquiryDetailModalProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  if (!inquiry) return null

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message to send.")
      return
    }

    try {
      setIsSending(true)
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: inquiry.id,
          message: replyMessage,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Reply sent successfully to the customer!")
        setReplyMessage("")
        setIsReplying(false)
        onClose()
      } else {
        toast.error(result.message || "Failed to send reply.")
      }
    } catch (error) {
      toast.error("A network error occurred. Please try again.")
      console.error("Reply Error:", error)
    } finally {
      setIsSending(false)
    }
  }

  const resetAndClose = () => {
    setIsReplying(false)
    setReplyMessage("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                {isReplying ? "Compose Reply" : "Inquiry Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                {isReplying ? `Replying to: ${inquiry.subject}` : inquiry.subject}
              </p>
            </div>
            <Badge variant={inquiry.isRead ? "outline" : "default"} className={!inquiry.isRead ? "bg-blue-500 hover:bg-blue-600" : "text-gray-400 border-gray-300"}>
              {inquiry.isRead ? "Read" : "New"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold italic">Customer</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{inquiry.name}</span>
                <span className="text-xs text-blue-500 truncate">{inquiry.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold italic">Received</span>
                <span className="text-sm font-semibold">{format(new Date(inquiry.createdAt), "MMM d, yyyy")}</span>
                <span className="text-xs text-muted-foreground">at {format(new Date(inquiry.createdAt), "h:mm a")}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold italic">Department</span>
                <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider py-0 px-2 mt-1 bg-amber-100 text-amber-800 border-none">
                  {inquiry.category}
                </Badge>
              </div>
            </div>

            {inquiry.orderNumber && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold italic">Reference</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">#{inquiry.orderNumber}</span>
                </div>
              </div>
            )}
          </div>

          {!isReplying ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                <FileText className="h-4 w-4" />
                Original Message
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 min-h-[120px] shadow-inner">
                {inquiry.message}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  <Send className="h-4 w-4" />
                  Your Response
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="text-muted-foreground h-7 hover:text-red-500">
                  <X className="h-3 w-3 mr-1" />
                  Discard
                </Button>
              </div>
              <Textarea 
                placeholder="Type your reply to the customer here..."
                className="min-h-[220px] focus-visible:ring-blue-500 border-2 rounded-xl text-md p-4"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground text-center italic">
                The customer will receive this message via email from LuxeCarts Support.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-gray-50/30 dark:bg-gray-900/10 flex items-center justify-between sm:justify-between">
          {!isReplying ? (
            <>
              <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-semibold">
                Close
              </Button>
              <Button onClick={() => setIsReplying(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-md shadow-blue-200 dark:shadow-none font-bold">
                <Send className="h-4 w-4 mr-2" />
                Reply to Inquiry
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsReplying(false)} className="rounded-xl px-4 text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Message
              </Button>
              <Button 
                onClick={handleSendReply} 
                disabled={isSending || !replyMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-200 dark:shadow-none font-bold min-w-[140px]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
