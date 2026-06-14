"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Store, 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  Loader2, 
  Search,
  Filter,
  ArrowRight
} from "lucide-react"
import { vendorApi } from "@/lib/api"
import { mapProduct } from "@/lib/productMapper"
import type { Product } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"
import ProductCard from "@/components/ProductCard"

export default function VendorProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendor, setVendor] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setIsLoading(true)
        const { data, success } = await vendorApi.getPublicProfile(slug)
        if (success && data) {
          setVendor(data)
          const mappedProducts = (data.products || []).map((p: any) => mapProduct(p))
          setProducts(mappedProducts)
        }
      } catch (err) {
        console.error("Failed to fetch vendor:", err)
      } finally {
        setIsLoading(false)
      }
    }
    if (slug) fetchVendor()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#002147] opacity-40">Loading Marketplace...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Shop Not Found</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">The vendor you are looking for is currently unavailable or doesn't exist.</p>
        <Link href="/products" className="btn-primary py-4 px-10">
          Browse All Products
        </Link>
      </div>
    )
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      {/* ── Vendor Header ── */}
      <div className="bg-[#002147] text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#eb9a05]/5 blur-3xl rounded-full translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Logo */}
            <div className="relative w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border-4 border-white/10 overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <Image 
                src={getImageUrl(vendor.logo || "/placeholder-vendor.png")} 
                alt={vendor.businessName} 
                fill 
                className="object-cover rounded-[2.2rem]"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="h-px w-8 bg-[#eb9a05]"></div>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">Verified Partner</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-playfair font-black mb-6">{vendor.businessName}</h1>
              <p className="text-blue-100/60 max-w-2xl mb-8 leading-relaxed italic text-lg">
                {vendor.description || "Welcome to our store! We provide premium quality products for our valued customers."}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-80">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#eb9a05]" />
                  <span className="text-xs font-bold uppercase tracking-widest">{vendor._count?.products || 0} Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#eb9a05]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Joined {new Date(vendor.user?.createdAt).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#eb9a05] fill-[#eb9a05]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Top Rated Vendor</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4">
               <button className="bg-[#eb9a05] text-[#002147] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#ffb426] transition-all transform hover:-translate-y-1">
                 Follow Store
               </button>
               <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
                 Contact Vendor
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16 border-b border-gray-200 pb-10">
          <div>
            <h2 className="text-3xl font-playfair font-black text-[#002147]">Collection</h2>
            <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-bold">Showing {filteredProducts.length} results</p>
          </div>

          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative flex-1 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#eb9a05] transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search in this shop..." 
                 className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-[#eb9a05] outline-none shadow-sm transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#eb9a05] transition-all">
              <Filter className="w-5 h-5 text-[#002147]" />
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-[#002147] mb-2">No items found</h3>
             <p className="text-gray-400 max-w-xs mx-auto">Try adjusting your search to find what you are looking for.</p>
          </div>
        )}
      </div>

      {/* ── Store Perks ── */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="flex flex-col items-center text-center p-8 rounded-[3rem] bg-[#f8f9fa] border border-gray-50 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#002147] rounded-2xl flex items-center justify-center text-[#eb9a05] mb-6 group-hover:rotate-12 transition-transform shadow-xl shadow-[#002147]/20">
                  <Store className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-[#002147] uppercase tracking-widest mb-4">Original Items</h4>
                <p className="text-sm text-gray-400 leading-relaxed italic">Guaranteed authentic products sourced directly from our workshops.</p>
             </div>

             <div className="flex flex-col items-center text-center p-8 rounded-[3rem] bg-[#f8f9fa] border border-gray-50 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#eb9a05] rounded-2xl flex items-center justify-center text-[#002147] mb-6 group-hover:rotate-12 transition-transform shadow-xl shadow-[#eb9a05]/20">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h4 className="text-lg font-black text-[#002147] uppercase tracking-widest mb-4">Customer Choice</h4>
                <p className="text-sm text-gray-400 leading-relaxed italic">Highly rated by our exclusive community for quality and reliability.</p>
             </div>

             <div className="flex flex-col items-center text-center p-8 rounded-[3rem] bg-[#f8f9fa] border border-gray-50 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#002147] rounded-2xl flex items-center justify-center text-[#eb9a05] mb-6 group-hover:rotate-12 transition-transform shadow-xl shadow-[#002147]/20">
                  <Package className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-[#002147] uppercase tracking-widest mb-4">Express Care</h4>
                <p className="text-sm text-gray-400 leading-relaxed italic">Hand-packed with precision and shipped using our premium logistics.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
