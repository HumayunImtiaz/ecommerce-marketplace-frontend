"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Loader2, Zap, Ticket } from "lucide-react"
import type { Product } from "@/lib/types"
import { mapProduct } from "@/lib/productMapper"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import ProductReviews from "@/components/ProductReviews"
import RelatedProducts from "@/components/RelatedProducts"

import { productApi, orderApi } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"

export default function ProductPage() {
  const params = useParams()
  const productSlug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [reviewCount, setReviewCount] = useState(0)

  const { items = [], addToCart, appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()


  // ── Product fetch karo ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const { data, success } = await productApi.getProductBySlug(productSlug)

        if (success && data && data.product) {
          const mapped = mapProduct(data.product)
          if (mapped) {
            setProduct(mapped)
            setSelectedColor(mapped.colors?.[0] || "")
            setSelectedSize(mapped.sizes?.[0] || "")
            setReviewCount(data.product.reviewCount ?? 0)
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (productSlug) fetchProduct()
  }, [productSlug])

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  // ── Active variant price (based on selected color + size) ──────────────────
  const getVariantPrice = (): number => {
    if (!product.variants || product.variants.length === 0) return product.price

    // 1. Exact color + size match
    const exactMatch = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize && v.price !== null
    )
    if (exactMatch && exactMatch.price !== null) return exactMatch.price

    // 2. Color-only match (when sizes don't affect price)
    const colorMatch = product.variants.find(
      (v) => v.color === selectedColor && v.price !== null
    )
    if (colorMatch && colorMatch.price !== null) return colorMatch.price

    // 3. Fall back to base product price
    return product.price
  }

  const getAvailableStock = (): number => {
    const totalVariantStock = (() => {
      if (!product || !product.variants || product.variants.length === 0) return product?.totalStock ?? 0

      // Exact color + size match
      const exactMatch = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      )
      if (exactMatch && exactMatch.stock) return exactMatch.stock.quantity

      // Color-only match
      const colorMatch = product.variants.find(
        (v) => v.color === selectedColor
      )
      if (colorMatch && colorMatch.stock) return colorMatch.stock.quantity

      return product.totalStock ?? 0
    })()

    const inCartQuantity = items.find(
      item => item.product.id === product?.id && 
              item.selectedColor === selectedColor && 
              item.selectedSize === selectedSize
    )?.quantity || 0

    return Math.max(0, totalVariantStock - inCartQuantity)
  }

  // ── Derived State ───────────────────────────────────────────────────────
  const activePrice = getVariantPrice()
  const availableStock = getAvailableStock()

  const savingsPercentage = (product.originalPrice && product.originalPrice > activePrice)
    ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    const productWithVariantPrice = { ...product, price: activePrice }
    addToCart(productWithVariantPrice, quantity, selectedColor, selectedSize)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

        {/* ── Product Images ── */}
        <div>
          <div className="mb-4 relative">
            <Image
              src={getImageUrl(product.images[selectedImage])}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
            />
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {savingsPercentage > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  -{savingsPercentage}% OFF
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md">
                  <Zap className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                <span className="text-white font-bold bg-red-500 px-4 py-2 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-blue-600" : "border-gray-200"
                    }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Details ── */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating > 0 ? product.rating.toFixed(1) : "No ratings yet"}{" "}
              {reviewCount > 0 && `(${reviewCount} reviews)`}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">${activePrice.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > activePrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {savingsPercentage > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                  {savingsPercentage}% OFF
                </span>
              )}
            </div>
            {/* Show variant price note if different from base */}
            {activePrice !== product.price && product.variants && product.variants.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">Price for selected variant</p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Color: <span className="text-blue-600">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-xl transition-colors ${selectedColor === color
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Size: <span className="text-blue-600">{selectedSize}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-xl transition-colors ${selectedSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 rounded-l-xl"
                  disabled={quantity <= 1}
                >
                  <Minus className={`w-4 h-4 ${quantity <= 1 ? "text-gray-300" : ""}`} />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity < availableStock) setQuantity(quantity + 1)
                  }}
                  className={`p-2 rounded-r-xl ${quantity >= availableStock ? "cursor-not-allowed text-gray-300" : "hover:bg-gray-100"}`}
                  disabled={quantity >= availableStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-sm font-medium ${availableStock > 0 ? "text-green-600" : "text-red-500"}`}>
                {availableStock > 0 ? `✓ In Stock (${availableStock} available)` : "Out of Stock"}
              </span>
            </div>
            {quantity >= availableStock && availableStock > 0 && (
              <p className="text-xs text-amber-600 mt-2">You have selected the maximum available quantity.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all ${availableStock > 0
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-3 border rounded-xl transition-colors ${isInWishlist(product.id)
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
                }`}
            >
              <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Truck className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Free Shipping</h4>
                <p className="text-xs text-gray-600">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Warranty</h4>
                <p className="text-xs text-gray-600">1 year guarantee</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <RotateCcw className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Easy Returns</h4>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
                {tab === "reviews" && reviewCount > 0 && ` (${reviewCount})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[200px]">
          {activeTab === "description" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description || "No description available."}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              {product.features && product.features.length > 0 ? (
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific features listed for this product.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <ProductReviews productId={product.id} />
          )}
        </div>
      </div>

      {/* ── Related Products ── */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-blue-600" />
          Available Offers & Coupons
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Coupon Display Card */}
          <CouponOffersSection />
          
          {/* Manual Apply Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <h4 className="font-bold text-slate-800 mb-2">Have a special code?</h4>
            <p className="text-sm text-slate-500 mb-4">Enter your coupon code below to apply it to your order.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO20"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                id="manual-coupon-input"
              />
              <button 
                onClick={() => {
                  const input = document.getElementById("manual-coupon-input") as HTMLInputElement
                  if (input.value) applyCoupon(input.value)
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-3 flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                <span className="text-sm font-medium text-green-700">Applied: <span className="font-bold uppercase">{appliedCoupon.code}</span></span>
                <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline font-bold">Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RelatedProducts currentProduct={product} /> 
    </div>
  )
}

function CouponOffersSection() {
  const [coupons, setCoupons] = useState<any[]>([])
  const { applyCoupon, appliedCoupon } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, success } = await orderApi.getPublicCoupons()
        if (success && Array.isArray(data)) {
          setCoupons(data)
        }
      } catch (err) {
        console.error("Failed to fetch public coupons:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCoupons()
  }, [])

  if (loading) return <div className="h-40 bg-slate-50 animate-pulse rounded-2xl border border-slate-200" />
  if (coupons.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
        <Ticket className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-500">No public offers available right now.</p>
      </div>
    )
  }

  return (
    <>
      {coupons.map((coupon) => (
        <div key={coupon.id} className="relative bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center overflow-hidden group hover:border-blue-400 transition-all">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors" />
          
          <div className="text-2xl font-black text-blue-600 mb-1">
            {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
          </div>
          <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider italic">
            Min. purchase: ${coupon.minPurchase}
          </p>
          
          <div className="flex items-center gap-3">
             <div className="bg-slate-50 px-4 py-2 rounded-lg font-mono font-bold text-slate-700 border border-slate-100">
               {coupon.code}
             </div>
             <button 
                onClick={() => applyCoupon(coupon.code)}
                disabled={appliedCoupon?.code === coupon.code}
                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
                  appliedCoupon?.code === coupon.code 
                  ? "bg-green-500 text-white cursor-default" 
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                }`}
             >
               {appliedCoupon?.code === coupon.code ? "Applied!" : "Apply Now"}
             </button>
          </div>
        </div>
      ))}
    </>
  )
}