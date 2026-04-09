"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Trash2, UserX, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type CustomerItem = {
  id: string
  fullName: string
  email: string
  avatar: string | null
  isVerified: boolean
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  provider: "local" | "google" | "facebook"
  createdAt: string
  updatedAt: string
}

interface CustomersTableProps {
  searchQuery: string
  filters: { provider: string; status: string }
  onRefresh?: (refreshFn: () => Promise<void>) => void
  onDataChange?: (data: CustomerItem[]) => void
}

export function CustomersTable({ searchQuery, filters, onRefresh, onDataChange }: CustomersTableProps) {
  // Use Sonner toast via direct import
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  
  const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      // ── Next.js API route — token cookie se lega ──
      const response = await fetch("/api/customers")
      const result = await response.json()

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to fetch customers")
        setCustomers([])
        return
      }
      setCustomers(result.data || [])
    } catch {
      toast.error("Failed to connect to server")
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { 
    fetchCustomers() 
    if (onRefresh) onRefresh(fetchCustomers)
  }, [])

  const handleTemporaryDelete = async (userId: string) => {
    try {
      setActionLoadingId(userId)
      const response = await fetch(`/api/customers/${userId}/temporary-delete`, { method: "PATCH" })
      const result = await response.json()

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to temporarily delete user")
        return
      }

      await fetchCustomers()
      toast.success("User temporarily deleted successfully")
    } catch {
      toast.error("Failed to connect to server")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handlePermanentDelete = async (userId: string) => {
    try {
      setActionLoadingId(userId)
      const response = await fetch(`/api/customers/${userId}/permanent-delete`, { method: "DELETE" })
      const result = await response.json()

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to permanently delete user")
        return
      }

      await fetchCustomers()
      toast.success("User permanently deleted successfully")
    } catch {
      toast.error("Failed to connect to server")
    } finally {
      setActionLoadingId(null)
      setUserToDelete(null)
      setPermanentDeleteConfirmOpen(false)
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())

      const derivedStatus = customer.isDeleted ? "deleted" : customer.isVerified ? "active" : "unverified"
      const matchesStatus = !filters.status || filters.status === "all" || derivedStatus === filters.status

      const matchesProvider = !filters.provider || filters.provider === "all" || customer.provider === filters.provider

      return matchesSearch && matchesStatus && matchesProvider
    })
  }, [customers, searchQuery, filters.status, filters.provider])
 
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
 
  useEffect(() => {
    if (onDataChange) onDataChange(filteredCustomers)
  }, [filteredCustomers, onDataChange])

  const getStatusBadge = (customer: CustomerItem) => {
    const base = "shadow-sm border-transparent transition-colors cursor-default inline-flex"
    if (customer.isDeleted) return <Badge className={`${base} bg-rose-100 text-rose-700 hover:bg-rose-50`}>Deleted</Badge>
    if (customer.isVerified) return <Badge className={`${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-50`}>Active</Badge>
    return <Badge className={`${base} bg-gray-100 text-gray-700 hover:bg-gray-50`}>Unverified</Badge>
  }

  const getProviderBadgeClass = (provider: string) => {
    const base = "shadow-sm border-transparent transition-colors cursor-default"
    switch (provider) {
      case "google":    return `${base} bg-blue-100 text-blue-700 hover:bg-blue-50`
      case "facebook":  return `${base} bg-indigo-100 text-indigo-700 hover:bg-indigo-50`
      default:          return `${base} bg-gray-100 text-gray-700 hover:bg-gray-50`
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border p-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading customers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deleted At</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.length > 0 ? (
            paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {customer.fullName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Link href={`/admin/customers/${customer.id}`} className="hover:underline hover:text-blue-600 transition-colors">
                      <div className="font-semibold text-gray-900">{customer.fullName}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </Link>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={getProviderBadgeClass(customer.provider)}>
                    {customer.provider}
                  </Badge>
                </TableCell>

                <TableCell>{getStatusBadge(customer)}</TableCell>

                <TableCell>
                  {customer.deletedAt ? new Date(customer.deletedAt).toLocaleDateString() : "—"}
                </TableCell>

                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={actionLoadingId === customer.id}>
                        {actionLoadingId === customer.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <MoreHorizontal className="h-4 w-4" />
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      {!customer.isDeleted && (
                        <DropdownMenuItem onClick={() => handleTemporaryDelete(customer.id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Temporary Delete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => {
                          setUserToDelete(customer.id)
                          setPermanentDeleteConfirmOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Permanent Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                No customers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AlertDialog open={permanentDeleteConfirmOpen} onOpenChange={setPermanentDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              account and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoadingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault()
                if (userToDelete) handlePermanentDelete(userToDelete)
              }}
              disabled={!!actionLoadingId}
            >
              {actionLoadingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Customer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}