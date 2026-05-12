"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  Box,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  X
} from "lucide-react"
import Link from "next/link"
import { productApi, vendorApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ProductFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    comparePrice: initialData?.comparePrice || "",
    category: initialData?.category?.id || initialData?.categoryId || "",
    totalStock: initialData?.totalStock || "10",
    images: initialData?.images || [] as string[],
    variants: initialData?.variants || [] as any[]
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, success } = await productApi.getCategories()
      if (success) setCategories(data || [])
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setIsLoading(true)
      const file = files[0]
      
      // 1. Get Presigned URL
      const res = await fetch("/api/vendor/products/upload-url", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      })
      const { data, success } = await res.json()
      
      if (!success) throw new Error("Failed to get upload URL")

      // 2. Upload to S3
      await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      })

      // 3. Update State
      setFormData(prev => ({ ...prev, images: [...prev.images, data.fileUrl] }))
      toast.success("Image uploaded successfully")
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: "", size: "", quantity: 0 }]
    }))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) return toast.error("Please select a category")
    
    try {
      setIsLoading(true)
      const payload = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice.toString()) : undefined,
        totalStock: parseInt(formData.totalStock.toString())
      }

      const res = await fetch(isEditing ? `/api/vendor/products/${initialData.id}` : "/api/vendor/products", {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      })
      
      const result = await res.json()
      if (result.success) {
        toast.success(isEditing ? "Product updated" : "Product created")
        router.push("/vendor/products")
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-white shadow-sm border">
            <Link href="/vendor/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-playfair font-black text-[#002147]">{isEditing ? "Edit Product" : "New Product"}</h1>
            <p className="text-slate-500 mt-1">{isEditing ? `Editing ${initialData.name}` : "List a new masterpiece in your collection."}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()} className="rounded-xl font-bold border-slate-200">Cancel</Button>
          <Button disabled={isLoading} className="bg-[#002147] text-white hover:bg-[#003366] rounded-xl font-black uppercase tracking-widest text-xs px-8 py-6 shadow-lg shadow-blue-900/10">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? "Save Changes" : "Publish Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ── Basic Info ── */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">General Information</CardTitle>
                  <CardDescription>Start with the essential details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Product Title</Label>
                <Input 
                  required
                  placeholder="e.g. Signature Velvet Tuxedo"
                  className="h-14 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Description</Label>
                <Textarea 
                  required
                  rows={6}
                  placeholder="Tell the story of this product..."
                  className="bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium resize-none p-6"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Variants ── */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Options & Variants</CardTitle>
                  <CardDescription>Size and color combinations</CardDescription>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-lg border-slate-200 font-bold">
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              {formData.variants.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-3xl border-slate-100">
                  <p className="text-sm text-slate-400 font-medium italic">No variants added yet. Optional for single-type products.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.variants.map((variant, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-4 items-end p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Color</Label>
                        <Input 
                          placeholder="Black" 
                          className="rounded-xl h-11 bg-white" 
                          value={variant.color}
                          onChange={e => updateVariant(idx, "color", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Size</Label>
                        <Input 
                          placeholder="XL" 
                          className="rounded-xl h-11 bg-white" 
                          value={variant.size}
                          onChange={e => updateVariant(idx, "size", e.target.value)}
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Stock</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="rounded-xl h-11 bg-white" 
                          value={variant.quantity}
                          onChange={e => updateVariant(idx, "quantity", parseInt(e.target.value))}
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* ── Categorization ── */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden p-8 space-y-6">
            <h3 className="font-bold text-[#002147] flex items-center gap-3">
              <Tag className="h-5 w-5 text-[#eb9a05]" />
              Categorization
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Category</Label>
                <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-transparent">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Inventory (Total Stock)</Label>
                <Input 
                  type="number" 
                  className="h-12 rounded-xl bg-slate-50/50 border-transparent" 
                  value={formData.totalStock}
                  onChange={e => setFormData({...formData, totalStock: e.target.value})}
                />
              </div>
            </div>
          </Card>

          {/* ── Pricing ── */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden p-8 space-y-6">
            <h3 className="font-bold text-[#002147] flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-[#eb9a05]" />
              Pricing
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Sale Price ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  className="h-12 rounded-xl bg-slate-50/50 border-transparent font-bold text-[#002147]" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Compare Price ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  className="h-12 rounded-xl bg-slate-50/50 border-transparent text-slate-400 italic" 
                  value={formData.comparePrice}
                  onChange={e => setFormData({...formData, comparePrice: e.target.value})}
                />
              </div>
            </div>
          </Card>

          {/* ── Media ── */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden p-8 space-y-6">
            <h3 className="font-bold text-[#002147] flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-[#eb9a05]" />
              Media Gallery
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl border bg-slate-50 relative group overflow-hidden">
                  <img src={img} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 h-7 w-7 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-[#eb9a05] hover:bg-white transition-all group">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#eb9a05] mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload</span>
                <Input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
              </Label>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
