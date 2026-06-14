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
  X,
  Sparkles,
  Info,
  Type,
  FileText,
  Percent,
  AlertCircle
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
import { cn } from "@/lib/utils"

interface ProductFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    comparePrice: initialData?.comparePrice || "",
    category: initialData?.category?.id || initialData?.categoryId || "",
    totalStock: initialData?.totalStock || "10",
    images: initialData?.images || [] as string[],
    variants: initialData?.variants || [] as any[],
    features: initialData?.features?.join("\n") || ""
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, success } = await productApi.getCategories()
      if (success) setCategories(data || [])
    }
    fetchCategories()
  }, [])

  // Clear specific field error when the user types
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setIsLoading(true)
      const fd = new FormData()
      for (let i = 0; i < files.length; i++) {
        fd.append("images", files[i])
      }
      
      const { data, success, message } = await vendorApi.uploadImages(fd)
      if (!success) throw new Error(message || "Upload failed")

      const uploadedUrls = data || []
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
      if (errors.images) setErrors(prev => { const n = { ...prev }; delete n.images; return n })
      toast.success("Image uploaded successfully")
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index)
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
    const errKey = `variant_${index}_${field}`
    if (errors[errKey]) setErrors(prev => { const n = { ...prev }; delete n[errKey]; return n })
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== index)
    }))
  }

  // ── Inline Validation ──
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Product name is required (min 2 characters)"
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = "Description is required (min 10 characters)"
    }
    if (!formData.price || parseFloat(formData.price.toString()) <= 0) {
      newErrors.price = "Please enter a valid price greater than $0"
    }
    if (formData.comparePrice && parseFloat(formData.comparePrice.toString()) <= parseFloat(formData.price.toString())) {
      newErrors.comparePrice = "Compare price must be higher than the sale price"
    }
    if (!formData.category) {
      newErrors.category = "Please select a category"
    }
    if (formData.images.length === 0) {
      newErrors.images = "Please upload at least one product image"
    }
    if (!formData.totalStock || parseInt(formData.totalStock.toString()) < 0) {
      newErrors.totalStock = "Stock must be 0 or more"
    }

    let totalVariantCount = 0;
    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i]
      if (!v.color || v.color.trim().length === 0) {
        newErrors[`variant_${i}_color`] = "Color is required"
      }
      if (!v.size || v.size.trim().length === 0) {
        newErrors[`variant_${i}_size`] = "Size is required"
      }
      totalVariantCount += parseInt(v.quantity?.toString() || "0") || 0;
    }

    if (formData.variants.length > 0 && totalVariantCount > parseInt(formData.totalStock.toString() || "0")) {
      newErrors.totalStock = `Variant sum (${totalVariantCount}) exceeds total inventory (${formData.totalStock})!`;
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    try {
      setIsLoading(true)
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice.toString()) : undefined,
        totalStock: parseInt(formData.totalStock.toString()),
        images: formData.images,
        categoryId: formData.category,
        sku: initialData?.sku || `SKU-${Date.now().toString().slice(-6)}`,
        features: formData.features.split('\n').map((f: string) => f.trim()).filter(Boolean),
        variants: formData.variants.map((v: any) => ({
          color: v.color || "Default",
          size: v.size || "Standard",
          stock: parseInt(v.quantity || "0"),
        }))
      }

      const { success, message } = isEditing 
        ? await vendorApi.updateProduct(initialData.id, payload)
        : await vendorApi.createProduct(payload)
      
      if (success) {
        toast.success(isEditing ? "Product updated successfully!" : "Product submitted for approval!")
        router.push("/products")
      } else {
        toast.error(message || "Failed to save product")
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const discountPercentage = formData.price && formData.comparePrice 
    ? Math.round(((parseFloat(formData.comparePrice.toString()) - parseFloat(formData.price.toString())) / parseFloat(formData.comparePrice.toString())) * 100)
    : 0

  // Helper: error message shown below a field
  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null
    return (
      <div className="flex items-center gap-2 mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
        <span className="text-sm font-bold text-red-500">{errors[field]}</span>
      </div>
    )
  }

  // Helper: returns red border class if field has error
  const errBorder = (field: string) => errors[field] ? "!border-red-400 !bg-red-50/30" : ""

  return (
    <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* ── Top Action Bar ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl py-6 border-b border-slate-200 -mx-6 px-6 mb-10 transition-all shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/products" 
              className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-[#eb9a05] transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-[#002147] group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#eb9a05]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#eb9a05]">Product Studio</span>
              </div>
              <h1 className="text-4xl font-playfair font-black text-[#002147]">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-red-500 mr-2 animate-pulse">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">{Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.back()} 
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Discard
            </Button>
            <Button 
              disabled={isLoading} 
              className="h-14 px-10 bg-[#002147] text-white hover:bg-[#003366] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/40 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <Save className="h-5 w-5 mr-3" />}
              {isEditing ? "Save Changes" : "Publish Listing"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Main Content (Left) ── */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: Basic Information */}
          <Card className={cn("border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden bg-white", (errors.name || errors.description) && "ring-2 ring-red-200")}>
            <CardHeader className="bg-slate-50/80 border-b px-12 py-10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-slate-100 shadow-inner flex items-center justify-center text-[#002147]">
                  <Type className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-[#002147]">Product Narrative</CardTitle>
                  <CardDescription className="text-slate-500 font-bold text-sm tracking-tight mt-1">What defines this masterpiece?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-sm uppercase font-black tracking-widest text-[#002147]">Product Title <span className="text-red-400">*</span></Label>
                  <span className={cn("text-xs font-black", formData.name.length > 50 ? "text-red-500" : "text-slate-400")}>
                    {formData.name.length} / 60
                  </span>
                </div>
                <Input 
                  maxLength={60}
                  placeholder="e.g. Handmade Italian Leather Boots"
                  className={cn("h-20 px-8 bg-slate-50 border-2 border-slate-100 focus:border-[#eb9a05] focus:bg-white transition-all rounded-[1.5rem] font-bold text-xl text-[#002147] placeholder:text-slate-300 shadow-inner", errBorder("name"))}
                  value={formData.name}
                  onChange={e => updateField("name", e.target.value)}
                />
                <FieldError field="name" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm uppercase font-black tracking-widest text-[#002147] ml-1">The Story / Description <span className="text-red-400">*</span></Label>
                <Textarea 
                  rows={8}
                  placeholder="Describe the materials, craftsmanship, and why this item is special..."
                  className={cn("bg-slate-50 border-2 border-slate-100 focus:border-[#eb9a05] focus:bg-white transition-all rounded-[2rem] font-bold text-lg p-8 text-[#002147] leading-relaxed placeholder:text-slate-300 shadow-inner resize-none", errBorder("description"))}
                  value={formData.description}
                  onChange={e => updateField("description", e.target.value)}
                />
                <FieldError field="description" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <Label className="text-sm uppercase font-black tracking-widest text-[#002147]">Highlights & Features</Label>
                  <Info className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1 mb-2">Separate each feature with a new line</p>
                <Textarea 
                  rows={5}
                  placeholder={"e.g. 100% Genuine Leather\nHand-stitched detailing\nWater-resistant coating"}
                  className="bg-slate-50 border-2 border-slate-100 focus:border-[#eb9a05] focus:bg-white transition-all rounded-[1.5rem] font-bold text-lg p-6 text-[#002147] leading-relaxed placeholder:text-slate-300 shadow-inner resize-none"
                  value={formData.features}
                  onChange={e => updateField("features", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section: Variants */}
          <Card className="border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b px-12 py-10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-slate-100 shadow-inner flex items-center justify-center text-[#eb9a05]">
                  <Layers className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-[#002147]">Dimensions & Stock</CardTitle>
                  <CardDescription className="text-slate-500 font-bold text-sm mt-1">Configure available sizes and colors</CardDescription>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addVariant} 
                className="h-14 px-8 rounded-2xl bg-[#eb9a05] text-[#002147] font-black uppercase tracking-widest text-xs hover:bg-[#eb9a05]/90 transition-all shadow-lg shadow-amber-500/20"
              >
                <Plus className="h-5 w-5 mr-2 stroke-[3]" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-12">
              {formData.variants.length === 0 ? (
                <div className="text-center py-24 border-4 border-dotted rounded-[3rem] border-slate-100 bg-slate-50/50">
                  <Layers className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                  <p className="text-lg text-slate-400 font-black uppercase tracking-[0.2em]">No Variants Active</p>
                  <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60 italic">Optional for single-type inventory</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {formData.variants.map((variant: any, idx: number) => (
                    <div key={idx} className={cn("group flex flex-col md:flex-row gap-8 items-start p-10 bg-slate-50/50 rounded-[2.5rem] border-2 border-slate-100 hover:border-[#eb9a05] hover:bg-white transition-all shadow-sm", (errors[`variant_${idx}_color`] || errors[`variant_${idx}_size`]) && "!border-red-300 !bg-red-50/20")}>
                      <div className="flex-1 space-y-2 w-full">
                        <Label className="text-xs uppercase font-black tracking-[0.2em] text-[#002147] ml-1 opacity-60">Color / Hue <span className="text-red-400">*</span></Label>
                        <Input 
                          placeholder="e.g. Royal Blue" 
                          className={cn("rounded-2xl h-16 bg-white border-2 border-slate-200 focus:border-[#eb9a05] font-black text-lg text-[#002147]", errBorder(`variant_${idx}_color`))} 
                          value={variant.color}
                          onChange={e => updateVariant(idx, "color", e.target.value)}
                        />
                        <FieldError field={`variant_${idx}_color`} />
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <Label className="text-xs uppercase font-black tracking-[0.2em] text-[#002147] ml-1 opacity-60">Size / Metric <span className="text-red-400">*</span></Label>
                        <Input 
                          placeholder="e.g. Large / 42" 
                          className={cn("rounded-2xl h-16 bg-white border-2 border-slate-200 focus:border-[#eb9a05] font-black text-lg text-[#002147]", errBorder(`variant_${idx}_size`))} 
                          value={variant.size}
                          onChange={e => updateVariant(idx, "size", e.target.value)}
                        />
                        <FieldError field={`variant_${idx}_size`} />
                      </div>
                      <div className="w-full md:w-40 space-y-2">
                        <Label className="text-xs uppercase font-black tracking-[0.2em] text-[#002147] ml-1 opacity-60">Count</Label>
                        <Input 
                          type="number" 
                          placeholder="00" 
                          className="rounded-2xl h-16 bg-white border-2 border-slate-200 focus:border-[#eb9a05] font-black text-2xl text-[#002147] text-center" 
                          value={variant.quantity}
                          onChange={e => updateVariant(idx, "quantity", parseInt(e.target.value))}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeVariant(idx)} 
                        className="h-16 w-16 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-7"
                      >
                        <Trash2 className="h-8 w-8" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Control Sidebar (Right) ── */}
        <div className="lg:col-span-4 space-y-10">
          {/* Media */}
          <Card className={cn("border-none shadow-2xl rounded-[3rem] p-12 bg-white", errors.images && "ring-2 ring-red-200")}>
            <div className="flex items-center gap-6 mb-6">
              <div className={cn("h-16 w-16 rounded-2xl text-white flex items-center justify-center shadow-2xl shadow-blue-900/30", errors.images ? "bg-red-500" : "bg-[#002147]")}>
                <ImageIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#002147]">Visual Assets <span className="text-red-400">*</span></h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">High Quality Only</p>
              </div>
            </div>

            <FieldError field="images" />

            <div className="grid grid-cols-2 gap-6 mt-4">
              {formData.images.map((img: string, i: number) => {
                const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
                const imageUrl = img.startsWith('http') ? img : `${SERVER_URL}${img}`;
                
                return (
                  <div key={i} className="aspect-square rounded-[2rem] border-4 border-slate-50 relative group overflow-hidden shadow-md">
                    <img src={imageUrl} className="h-full w-full object-cover group-hover:scale-125 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-2xl active:scale-90 transition-all font-black"
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <Label className={cn("aspect-square rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#eb9a05] hover:bg-amber-50 transition-all group relative overflow-hidden", errors.images && "!border-red-300 !bg-red-50/30")}>
                <Upload className="h-8 w-8 text-slate-300 group-hover:text-[#eb9a05] group-hover:-translate-y-2 transition-all" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">Upload</span>
                <Input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#002147] animate-spin" />
                  </div>
                )}
              </Label>
            </div>
          </Card>

          {/* Pricing */}
          <Card className={cn("border-none shadow-2xl rounded-[3rem] p-12 bg-white relative overflow-hidden group", errors.price && "ring-2 ring-red-200")}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/5 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            <div className="flex items-center gap-6 mb-10">
              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30", errors.price ? "bg-red-500 text-white" : "bg-[#eb9a05] text-[#002147]")}>
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#002147]">Pricing Matrix</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Global Market</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-black tracking-widest text-[#002147]">Current Listing Price ($) <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#eb9a05] stroke-[3]" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    className={cn("h-20 pl-16 pr-8 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white font-black text-3xl text-[#002147] shadow-inner", errBorder("price"))} 
                    value={formData.price}
                    onChange={e => updateField("price", e.target.value)}
                  />
                </div>
                <FieldError field="price" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-xs uppercase font-black tracking-widest text-slate-400">Retail Comparison (MSRP)</Label>
                  {discountPercentage > 0 && (
                    <div className="bg-green-500 text-white rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-bounce">
                      SAVE {discountPercentage}%
                    </div>
                  )}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    className={cn("h-16 pl-16 pr-8 rounded-[1.5rem] bg-slate-50/50 border-2 border-transparent focus:border-slate-200 font-black text-xl text-slate-400 italic", errBorder("comparePrice"))} 
                    value={formData.comparePrice}
                    onChange={e => updateField("comparePrice", e.target.value)}
                  />
                </div>
                <FieldError field="comparePrice" />
              </div>
            </div>
          </Card>

          {/* Organization */}
          <Card className={cn("border-none shadow-2xl rounded-[3rem] p-12 bg-white", (errors.category || errors.totalStock) && "ring-2 ring-red-200")}>
            <div className="flex items-center gap-6 mb-10">
              <div className={cn("h-16 w-16 rounded-2xl text-white flex items-center justify-center shadow-2xl shadow-blue-900/30", errors.category ? "bg-red-500" : "bg-[#002147]")}>
                <Tag className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#002147]">Organization</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Collection Sorting</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2 relative z-[60]">
                <Label className="text-xs uppercase font-black tracking-widest text-[#002147] ml-1">Assigned Collection <span className="text-red-400">*</span></Label>
                <Select value={formData.category} onValueChange={val => updateField("category", val)}>
                  <SelectTrigger className={cn("h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#eb9a05] font-black text-lg text-[#002147]", errBorder("category"))}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-slate-100 p-3 z-[100]">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-black py-4 px-6 focus:bg-[#002147] focus:text-white transition-all tracking-wider uppercase text-xs cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="category" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs uppercase font-black tracking-widest text-[#002147] ml-1">Total Available Inventory <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <Box className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <Input 
                    type="number" 
                    className={cn("h-16 pl-16 pr-8 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white font-black text-2xl text-[#002147] shadow-inner", errBorder("totalStock"))} 
                    value={formData.totalStock}
                    onChange={e => updateField("totalStock", e.target.value)}
                  />
                </div>
                <FieldError field="totalStock" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
