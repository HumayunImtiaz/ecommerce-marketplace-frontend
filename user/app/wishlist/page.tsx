"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/contexts/WishlistContext"
import ProductCard from "@/components/ProductCard"

export default function WishlistPage() {
  const { items, clearWishlist, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your wishlist...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">Save items you love to your wishlist and shop them later.</p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">{items.length} items saved</p>
        </div>
        <button onClick={clearWishlist} className="text-red-600 hover:text-red-800 text-sm">
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
