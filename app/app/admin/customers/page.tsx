"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomersTable } from "@/components/customers-table"
import { CustomerFilters } from "@/components/customer-filters"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { Plus, Download } from "lucide-react"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    provider: "all",
    status: "all",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshFn, setRefreshFn] = useState<(() => Promise<void>) | null>(null)
  const [filteredData, setFilteredData] = useState<any[]>([])

  const handleExportCustomers = () => {
    if (filteredData.length === 0) {
      alert("No data to export")
      return
    }

    const headers = ["Full Name", "Email", "Provider", "Status", "Created At"]
    const rows = filteredData.map(c => {
      // Robust date formatting
      let formattedDate = "N/A"
      try {
        if (c.createdAt) {
          const date = new Date(c.createdAt)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString('en-GB') // DD/MM/YYYY format
          }
        }
      } catch (e) {
        console.error("Date formatting error:", e)
      }

      return [
        c.fullName || "N/A",
        c.email || "N/A",
        c.provider || "local",
        c.isDeleted ? "Deleted" : c.isVerified ? "Active" : "Unverified",
        formattedDate
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `customers-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships and authentication</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportCustomers} 
            className="w-full sm:w-auto bg-transparent border-gray-200"
            disabled={filteredData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredData.length})
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-200"
          />
        </div>
        <CustomerFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <CustomersTable 
        searchQuery={searchQuery} 
        filters={filters} 
        onRefresh={(fn) => setRefreshFn(() => fn)}
        onDataChange={setFilteredData}
      />

      <AddCustomerDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={() => refreshFn?.()}
      />
    </div>
  )
}
