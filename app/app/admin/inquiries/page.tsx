"use client"

import { useState } from "react"
import { InquiriesTable } from "@/components/inquiries-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Search, Filter } from "lucide-react"

export default function InquiriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-500" />
            Inquiries
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage and respond to customer messages from the contact form.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or subject..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-11 border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="read">Read Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-1">
        <InquiriesTable searchQuery={searchQuery} filterStatus={filterStatus} />
      </div>
    </div>
  )
}
