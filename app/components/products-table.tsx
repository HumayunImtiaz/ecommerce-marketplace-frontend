"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { AdminLoader } from "./admin-loader"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Image from "next/image"
import Link from "next/link"


interface ProductVariant {
  id: string
  size: string
  color: string
  price: number | null
  stock: {
    quantity: number
    status: string
  } | null
}

interface ProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string
  category: {
    _id: string
    name: string
    slug: string
  } | null
  tags: string[]
  images: string[]
  isActive: boolean
  totalStock: number
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

interface ProductsTableProps {
  searchQuery: string
  filters: {
    categorySlug: string
    status: string
    priceRange: number[]
  }
  onProductsLoaded?: (products: ProductItem[]) => void
}

export function ProductsTable({ searchQuery, filters, onProductsLoaded }: ProductsTableProps) {
  // Use Sonner toast directly via import
  const [products, setProducts] = useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    try {
      setIsBulkUpdating(true)
      const response = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts, isActive }),
      })

      const result = await response.json()
      if (result?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            selectedProducts.includes(p.id) ? { ...p, isActive } : p
          )
        )
        setSelectedProducts([])
        toast.success(`Successfully ${isActive ? "published" : "unpublished"} products`)
      } else {
        toast.error(result?.message || "Failed to update products")
      }
    } catch (error) {
      console.error("Bulk status update search error:", error)
      toast.error("Failed to update products. Please try again.")
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return
    }

    try {
      setIsBulkUpdating(true)
      const response = await fetch("/api/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts }),
      })

      const result = await response.json()
      if (result?.success) {
        setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)))
        setSelectedProducts([])
        toast.success("Products deleted successfully")
      } else {
        toast.error(result?.message || "Failed to delete products")
      }
    } catch (error) {
      console.error("Bulk delete error:", error)
      toast.error("Failed to delete products. Please try again.")
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (filters.categorySlug && filters.categorySlug !== "all") params.append("category", filters.categorySlug)
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.priceRange && filters.priceRange.length === 2) {
        params.append("minPrice", filters.priceRange[0].toString())
        params.append("maxPrice", filters.priceRange[1].toString())
      }
      params.append("page", currentPage.toString())
      params.append("limit", pageSize.toString())

      const queryString = params.toString()
      const response = await fetch(`/api/products${queryString ? `?${queryString}` : ""}`)
      const result = await response.json()

      if (result?.success && Array.isArray(result.data)) {
        setProducts(result.data)
        setTotalPages(result.metaDetails?.totalPages || 1)
        setTotalCount(result.metaDetails?.totalCount || 0)
        if (onProductsLoaded) onProductsLoaded(result.data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, filters, currentPage, pageSize])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const handleDelete = async (productId: string) => {
    try {
      setDeletingId(productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        toast.success("Product deleted successfully")
      } else {
        toast.error(result?.message || "Failed to delete product")
      }
    } catch (error) {
      console.error("Delete product error:", error)
      toast.error("Failed to delete product. Please try again.")
    } finally {
      setDeletingId(null)
      setProductToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const getStockBadge = (totalStock: number) => {
    if (totalStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (totalStock <= 5) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
  }

  if (isLoading) {
    return <AdminLoader message="Loading products..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-4">
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm">{selectedProducts.length} product(s) selected</span>
          <Button 
            size="sm" 
            onClick={() => handleBulkStatusUpdate(true)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleBulkStatusUpdate(false)}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Unpublish
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleBulkDelete}
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    products.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          product.images.length > 0
                            ? product.images[0]
                            : "/placeholder.svg"
                        }
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <div className="font-medium truncate max-w-[200px]">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.variants.length} variant(s)
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.totalStock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        !product.isActive
                          ? "secondary"
                          : product.totalStock <= 0
                            ? "destructive"
                            : "default"
                      }
                    >
                      {!product.isActive
                        ? "Draft"
                        : product.totalStock <= 0
                          ? "Out of Stock"
                          : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.slug}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            setProductToDelete(product.id)
                            setDeleteConfirmOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault()
                if (productToDelete) handleDelete(productToDelete)
              }}
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-6">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> products
          </p>
          <div className="order-1 sm:order-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1) }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(page) }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <PaginationEllipsis key={page} />
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1) }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}