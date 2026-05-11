"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Loader2, Zap, Ticket, CheckCircle } from "lucide-react"
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

  const { items = [], addToCart, appliedCoupon, applyCoupon, removeCoupon } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

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
      } catch (err) { console.error("Failed to fetch product:", err) }
      finally { setIsLoading(false) }
    }
    if (productSlug) fetchProduct()
  }, [productSlug])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#002147] opacity-40">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Product Not Found</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">The item you are looking for is currently unavailable.</p>
        <Link href="/products" className="btn-primary py-4 px-10">
          Browse Products
        </Link>
      </div>
    )
  }

  const getVariantPrice = (): number => {
    if (!product.variants || product.variants.length === 0) return product.price
    const exactMatch = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize && v.price !== null)
    if (exactMatch && exactMatch.price !== null) return exactMatch.price
    const colorMatch = product.variants.find((v) => v.color === selectedColor && v.price !== null)
    if (colorMatch && colorMatch.price !== null) return colorMatch.price
    return product.price
  }

  const getAvailableStock = (): number => {
    const totalVariantStock = (() => {
      if (!product || !product.variants || product.variants.length === 0) return product?.totalStock ?? 0
      const exactMatch = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
      if (exactMatch && exactMatch.stock) return exactMatch.stock.quantity
      const colorMatch = product.variants.find((v) => v.color === selectedColor)
      if (colorMatch && colorMatch.stock) return colorMatch.stock.quantity
      return product.totalStock ?? 0
    })()
    const inCartQuantity = items.find(item => item.product.id === product?.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize)?.quantity || 0
    return Math.max(0, totalVariantStock - inCartQuantity)
  }

  const handleAddToCart = () => {
    if (!product) return
    addToCart(
      product,
      quantity,
      selectedColor,
      selectedSize
    )
  }

  const handleWishlistToggle = () => {
    if (!product) return
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const activePrice = getVariantPrice()
  const availableStock = getAvailableStock()
  const savingsPercentage = (product.originalPrice && product.originalPrice > activePrice) ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100) : 0

  return (
    <div className="bg-[#f8f9fa]">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Images Section */}
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-[#eb9a05]/10">
              <Image src={getImageUrl(product.images[selectedImage])} alt={product.name} fill className="object-cover" />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {savingsPercentage > 0 && (
                  <span className="bg-[#ff4d4d] text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl">
                    {savingsPercentage}% Off
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-[#eb9a05] text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl">
                    Featured Product
                  </span>
                )}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all transform hover:scale-105 ${selectedImage === index ? "border-[#eb9a05] shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={getImageUrl(image)} alt={product.name} width={100} height={100} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-8 bg-[#eb9a05]"></div>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">{product.category}</p>
              </div>
              <h1 className="text-5xl font-playfair font-black leading-tight mb-4" style={{ color: 'var(--primary)' }}>{product.name}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-[#eb9a05] text-[#eb9a05]" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                  {product.rating > 0 ? `${product.rating.toFixed(1)} Rating` : "No Rating"} • {reviewCount} Reviews
                </span>
              </div>
            </div>

            <div className="mb-10 flex items-baseline gap-6">
              <span className="text-5xl font-black" style={{ color: 'var(--primary)' }}>${activePrice.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > activePrice && (
                <span className="text-2xl opacity-20 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="space-y-10 mb-12">
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 opacity-40">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 rounded-xl border-2 font-bold text-xs tracking-widest uppercase transition-all ${selectedColor === color ? "border-[#002147] bg-[#002147] text-white shadow-xl scale-105" : "border-gray-100 bg-white hover:border-[#eb9a05]"}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 opacity-40">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[60px] h-12 flex items-center justify-center rounded-xl border-2 font-bold text-xs tracking-widest uppercase transition-all ${selectedSize === size ? "border-[#002147] bg-[#002147] text-white shadow-xl scale-105" : "border-gray-100 bg-white hover:border-[#eb9a05]"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Stock */}
              <div className="flex items-center gap-10">
                <div className="flex items-center p-1 rounded-2xl border-2 bg-white" style={{ borderColor: 'var(--secondary)' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-gray-50 rounded-xl" disabled={quantity <= 1}>
                    <Minus className={`w-4 h-4 ${quantity <= 1 ? "opacity-20" : ""}`} />
                  </button>
                  <span className="w-12 text-center font-black text-xl">{quantity}</span>
                  <button onClick={() => { if (quantity < availableStock) setQuantity(quantity + 1) }} className="p-4 hover:bg-gray-50 rounded-xl" disabled={quantity >= availableStock}>
                    <Plus className={`w-4 h-4 ${quantity >= availableStock ? "opacity-20" : ""}`} />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${availableStock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {availableStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <span className="text-xs opacity-40 font-medium">{availableStock} units available</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className="flex-1 btn-primary py-6 flex items-center justify-center gap-4 group"
              >
                <ShoppingCart className="w-6 h-6 transition-transform group-hover:-translate-y-1" />
                <span className="text-sm font-black tracking-[0.2em] uppercase">Add to Cart</span>
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${isInWishlist(product.id) ? "bg-red-50 border-red-200 text-red-600 shadow-xl" : "border-gray-100 bg-white hover:border-[#eb9a05] text-[#002147]"}`}
              >
                <Heart className="w-6 h-6" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-3">
                <Truck className="w-6 h-6 text-[#eb9a05]" />
                <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Global Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Shield className="w-6 h-6 text-[#eb9a05]" />
                <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Certified Secure</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <RotateCcw className="w-6 h-6 text-[#eb9a05]" />
                <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Additional Info */}
        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl mb-24 border border-[#eb9a05]/10">
          <div className="flex flex-wrap justify-center gap-12 mb-16 border-b border-gray-50 pb-8">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-black tracking-[0.3em] uppercase transition-all pb-4 border-b-2 ${activeTab === tab ? "border-[#eb9a05] text-[#002147]" : "border-transparent opacity-30 hover:opacity-100"}`}
              >
                {tab} {tab === "reviews" && reviewCount > 0 && `(${reviewCount})`}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === "description" && (
              <div className="animate-fade-in-up">
                <h3 className="text-3xl font-playfair font-bold mb-8" style={{ color: 'var(--primary)' }}>Description</h3>
                <p className="text-lg text-gray-600 leading-relaxed italic mb-8">{product.description || "No description available."}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {product.tags.map((tag) => (
                      <span key={tag} className="bg-[#f8f9fa] text-[#002147] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "features" && (
              <div className="animate-fade-in-up">
                <h3 className="text-3xl font-playfair font-bold mb-8" style={{ color: 'var(--primary)' }}>Features</h3>
                {product.features && product.features.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8f9fa] border border-gray-50">
                        <div className="w-2 h-2 rounded-full bg-[#eb9a05]" />
                        <span className="font-medium text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No features listed.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && <ProductReviews productId={product.id} />}
          </div>
        </div>

        {/* Coupons Section */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <Ticket className="w-8 h-8 text-[#eb9a05]" />
            <h3 className="text-4xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Exclusive Offers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CouponOffersSection />
            <div className="bg-[#002147] p-10 rounded-[2.5rem] flex flex-col justify-center text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <h4 className="text-2xl font-playfair font-bold mb-4">Coupon Code</h4>
              <p className="text-sm opacity-60 mb-8">If you have a coupon code, apply it below.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODE"
                  className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#eb9a05] outline-none uppercase font-mono font-bold tracking-widest transition-all"
                  id="manual-coupon-input"
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById("manual-coupon-input") as HTMLInputElement
                    if (input.value) applyCoupon(input.value)
                  }}
                  className="btn-secondary py-4 px-6 text-[10px] font-black uppercase tracking-widest"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts currentProduct={product} /> 
      </div>
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
        if (success && Array.isArray(data)) setCoupons(data)
      } catch (err) { console.error("Failed to fetch public coupons:", err) }
      finally { setLoading(false) }
    }
    fetchCoupons()
  }, [])

  if (loading) return <div className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-[#eb9a05]/10 shadow-xl" />
  if (coupons.length === 0) return null

  return (
    <>
      {coupons.map((coupon) => (
        <div key={coupon.id} className="relative bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-[#eb9a05]/30 flex flex-col items-center justify-center text-center group hover:border-[#eb9a05] hover:shadow-2xl transition-all duration-500">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05] mb-4">Special Offer</span>
          <div className="text-5xl font-playfair font-black mb-2" style={{ color: 'var(--primary)' }}>
            {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} <span className="text-xl opacity-20">Off</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">Min. Purchase: ${coupon.minPurchase}</p>
          <div className="flex items-center gap-3 w-full">
             <div className="flex-1 bg-[#f8f9fa] px-4 py-4 rounded-xl font-mono font-bold text-[#002147] border border-gray-100 tracking-widest text-lg uppercase">
               {coupon.code}
             </div>
             <button 
                onClick={() => applyCoupon(coupon.code)}
                disabled={appliedCoupon?.code === coupon.code}
                className={`p-4 rounded-xl transition-all shadow-xl ${appliedCoupon?.code === coupon.code ? "bg-green-500 text-white" : "btn-primary hover:scale-105 active:scale-95"}`}
             >
               {appliedCoupon?.code === coupon.code ? <CheckCircle className="w-6 h-6" /> : "Apply"}
             </button>
          </div>
        </div>
      ))}
    </>
  )
}