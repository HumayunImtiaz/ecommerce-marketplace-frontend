"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Mail, MailOpen, Eye, Trash2 } from "lucide-react"
import { InquiryDetailModal } from "@/components/inquiry-detail-modal"

export interface Inquiry {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  category: string
  orderNumber?: string
  isRead: boolean
  createdAt: string
}

interface InquiriesTableProps {
  searchQuery: string
  filterStatus: string
}

export function InquiriesTable({ searchQuery, filterStatus }: InquiriesTableProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contact")
      const result = await response.json()
      if (result.success) {
        setInquiries(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const handleToggleRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead }),
      })
      if (response.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, isRead } : inq))
        )
      }
    } catch (error) {
      console.error("Failed to update inquiry status:", error)
    }
  }

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterStatus === "unread") return matchesSearch && !inq.isRead
    if (filterStatus === "read") return matchesSearch && inq.isRead
    return matchesSearch
  })

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setIsModalOpen(true)
    if (!inquiry.isRead) {
      handleToggleRead(inquiry._id, true)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading inquiries...</div>
  }

  return (
    <div className="rounded-md border bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No inquiries found.
              </TableCell>
            </TableRow>
          ) : (
            filteredInquiries.map((inq) => (
              <TableRow 
                key={inq._id} 
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!inq.isRead ? "font-semibold bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                onClick={() => openInquiry(inq)}
              >
                <TableCell>
                  {!inq.isRead ? (
                    <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400 border-gray-300">Read</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(inq.createdAt), "MMM d, h:mm a")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{inq.name}</span>
                    <span className="text-xs text-muted-foreground">{inq.email}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {inq.subject}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {inq.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openInquiry(inq)}
                      title="View Message"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleToggleRead(inq._id, !inq.isRead)}
                      title={inq.isRead ? "Mark as Unread" : "Mark as Read"}
                    >
                      {inq.isRead ? <Mail className="h-4 w-4 text-gray-400" /> : <MailOpen className="h-4 w-4 text-blue-500" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <InquiryDetailModal 
        inquiry={selectedInquiry} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
