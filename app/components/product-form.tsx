"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { VariantMatrix } from "@/components/variant-matrix"
import { toast } from "sonner"
import { Loader2, X, Plus, ArrowLeft, ArrowRight, Check } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const STEPS = [
  { id: "basic", label: "Basic Info", step: 1 },
  { id: "pricing", label: "Pricing", step: 2 },
  { id: "media", label: "Media", step: 3 },
  { id: "variants", label: "Variants", step: 4 },
] as const

interface CategoryItem {
  _id: string
  name: string
  slug: string
  isActive: boolean
}

// ─── Yup schemas per step ────────────────────────────────────────────────────
const stepSchemas = [
  // Step 0 — Basic Info
  Yup.object({
    name: Yup.string().trim().min(2, "Name must be at least 2 characters").required("Product name is required"),
    sku: Yup.string().trim().required("SKU is required"),
    categoryId: Yup.string().required("Category is required"),
  }),
  // Step 1 — Pricing
  Yup.object({
    price: Yup.number()
      .typeError("Price must be a number")
      .moreThan(0, "Price must be greater than 0")
      .required("Price is required"),
    comparePrice: Yup.number()
      .typeError("Compare price must be a number")
      .moreThan(0, "Compare price must be greater than 0")
      .required("Compare price is required")
      .test(
        "compare-gt-price",
        "Compare price must be greater than selling price",
        function (value) {
          if (!value) return true
          return value > this.parent.price
        }
      ),
  }),
  // Step 2 — Media
  Yup.object({
    images: Yup.array().min(1, "At least one image is required"),
  }),
  // Step 3 — Variants (optional)
  Yup.object({}),
]

// Full schema for final submit validation
const fullSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").required("Product name is required"),
  sku: Yup.string().trim().required("SKU is required"),
  categoryId: Yup.string().required("Category is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .moreThan(0, "Price must be greater than 0")
    .required("Price is required"),
  comparePrice: Yup.number()
    .typeError("Compare price must be a number")
    .moreThan(0, "Compare price must be greater than 0")
    .required("Compare price is required")
    .test(
      "compare-gt-price",
      "Compare price must be greater than selling price",
      function (value) {
        if (!value) return true
        return value > this.parent.price
      }
    ),
  images: Yup.array().min(1, "At least one image is required"),
})

export function ProductForm() {
  const router = useRouter()
  // Use Sonner toast via direct import
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [newTag, setNewTag] = useState("")
  const [newFeature, setNewFeature] = useState("")

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [newCategoryImage, setNewCategoryImage] = useState("")
  const [categoryCreating, setCategoryCreating] = useState(false)

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch(`/api/categories`)
      const result = await response.json()
      if (result?.success && Array.isArray(result.data)) {
        setCategories(result.data.filter((cat: CategoryItem) => cat.isActive))
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // ─── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      comparePrice: "",
      sku: "",
      categoryId: "",
      tags: [] as string[],
      features: [] as string[],
      images: [] as string[],
      variants: [] as Array<{ size: string; color: string; price: string; stock: string }>,
    },
    validationSchema: fullSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Auto-add any pending feature or tag
        const finalFeatures = [...values.features]
        if (newFeature.trim() && !finalFeatures.includes(newFeature.trim())) {
          finalFeatures.push(newFeature.trim())
        }

        const payload = {
          name: values.name,
          slug: values.slug,
          description: values.description || undefined,
          price: Number(values.price),
          comparePrice: values.comparePrice ? Number(values.comparePrice) : undefined,
          sku: values.sku,
          categoryId: values.categoryId,
          tags: values.tags,
          features: finalFeatures,
          images: values.images,
          isFeatured: (values as any).isFeatured ?? false,
          variants: values.variants.map((v) => ({
            size: v.size,
            color: v.color,
            price: v.price ? Number(v.price) : undefined,
            stock: v.stock ? parseInt(v.stock) : undefined,
          })),
        }

        const response = await fetch("/api/products/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (!response.ok || !result?.success) {
          toast.error(result?.message || "Failed to create product.")
          return
        }

        toast.success("Product Added Successfully", {
          description: `"${values.name}" has been created and is now in your product list.`,
        })

        router.push("/admin/products")
      } catch (error) {
        toast.error("Failed to create product. Please try again.")
      }
    },
  })

  // ─── Name → slug auto-generate ────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    formik.setFieldValue("name", name)
    formik.setFieldValue("slug", slugify(name, { lower: true, strict: true }))
  }

  // ─── Step validation using per-step Yup schema ───────────────────────────
  const validateStep = async (step: number): Promise<boolean> => {
    try {
      await stepSchemas[step].validate(formik.values, { abortEarly: false })
      return true
    } catch (err: any) {
      // Touch all failed fields so red borders show
      if (err.inner) {
        const touched: Record<string, boolean> = {}
        const fieldErrors: Record<string, string> = {}
        err.inner.forEach((e: any) => {
          touched[e.path] = true
          fieldErrors[e.path] = e.message
        })
        formik.setTouched({ ...formik.touched, ...touched })
        // Manually set field errors so formik shows them under each field
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          formik.setFieldError(field, msg)
        })
      }

      const firstMsg = err.inner?.[0]?.message || err.message
      toast.error(firstMsg || "Please fill in all required fields.")
      return false
    }
  }

  const handleNext = async () => {
    const valid = await validateStep(currentStep)
    if (valid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    formik.setTouched({})
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      formik.setTouched({})
      setCurrentStep(stepIndex)
    } else if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        const valid = await validateStep(i)
        if (!valid) {
          setCurrentStep(i)
          return
        }
      }
      setCurrentStep(stepIndex)
    }
  }

  const handleFinalSubmit = async (isDraftValue: boolean = false) => {
    // If not a draft, validate all steps
    if (!isDraftValue) {
      for (let i = 0; i < STEPS.length; i++) {
        try {
          await stepSchemas[i].validate(formik.values, { abortEarly: false })
        } catch (err: any) {
          setCurrentStep(i)
          toast.error(`Validation Error: Please fix errors in Step ${i + 1}: ${STEPS[i].label}`)
          return
        }
      }
    } else {
      // If draft, only Name is required (checked at service level too)
      if (!formik.values.name.trim()) {
        toast.error("At least a product name is required to save a draft.")
        return
      }
    }

    formik.setSubmitting(true)
    try {
      const values = formik.values

      const payload = {
        name: values.name,
        slug: values.slug,
        description: (values as any).description || undefined,
        price: values.price ? Number(values.price) : 0,
        comparePrice: values.comparePrice ? Number(values.comparePrice) : undefined,
        sku: values.sku,
        categoryId: values.categoryId || undefined,
        tags: values.tags,
        features: values.features,
        images: values.images,
        isActive: !isDraftValue, // false if saving as draft
        isFeatured: (values as any).isFeatured ?? false,
        variants: values.variants.map((v) => ({
          size: v.size,
          color: v.color,
          price: v.price ? Number(v.price) : undefined,
          stock: v.stock ? parseInt(v.stock) : undefined,
        })),
      }

      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to create product.")
        return
      }

      toast.success(isDraftValue ? "Draft Saved Successfully" : "Product Added Successfully", {
        description: isDraftValue 
          ? `"${values.name}" has been saved as a draft.` 
          : `"${values.name}" has been created and published.`,
      })

      router.push("/admin/products")
    } catch {
      toast.error("Failed to save product. Please try again.")
    } finally {
      formik.setSubmitting(false)
    }
  }

  // Auto-save draft on unmount if name exists and not currently submitting
  useEffect(() => {
    return () => {
      // Small delay to check if we are already submitting or navigating due to success
      // This is tricky in React, so we'll rely on the manual "Save as Draft" and prompt.
    }
  }, [])

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !formik.values.tags.includes(trimmed)) {
      formik.setFieldValue("tags", [...formik.values.tags, trimmed])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    formik.setFieldValue("tags", formik.values.tags.filter((t) => t !== tagToRemove))
  }

  // ─── Features ──────────────────────────────────────────────────────────────
  const addFeature = () => {
    const trimmed = newFeature.trim()
    if (trimmed && !formik.values.features.includes(trimmed)) {
      formik.setFieldValue("features", [...formik.values.features, trimmed])
    }
    setNewFeature("")
  }

  const removeFeature = (featureToRemove: string) => {
    formik.setFieldValue("features", formik.values.features.filter((f) => f !== featureToRemove))
  }

  // ─── Create Category ──────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required")
      return
    }
    try {
      setCategoryCreating(true)
      const response = await fetch(`/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: slugify(newCategoryName, { lower: true, strict: true }),
          description: newCategoryDescription.trim() || undefined,
          image: newCategoryImage || "/placeholder.svg",
        }),
      })
      const result = await response.json()
      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to create category")
        return
      }
      toast.success("Category created successfully!")
      await fetchCategories()
      formik.setFieldValue("categoryId", result.data._id)
      setNewCategoryName("")
      setNewCategoryDescription("")
      setNewCategoryImage("")
      setIsCategoryDialogOpen(false)
    } catch {
      toast.error("Failed to create category")
    } finally {
      setCategoryCreating(false)
    }
  }

  const isLastStep = currentStep === STEPS.length - 1

 
  const fieldError = (field: string) => {
    const touched = (formik.touched as any)[field]
    const error = (formik.errors as any)[field]
    return touched && error ? error : null
  }

  return (
    <>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : step.step}
              </button>
              <span
                className={`ml-2 text-sm font-medium hidden sm:inline ${
                  index === currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded ${
                    index < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Basic Info ── */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formik.values.name}
                    onChange={handleNameChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter product name"
                    className={fieldError("name") ? "border-red-500" : ""}
                  />
                  {fieldError("name") && <p className="text-sm text-red-500">{fieldError("name")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formik.values.slug}
                    onChange={(e) => formik.setFieldValue("slug", e.target.value)}
                    placeholder="product-slug"
                  />
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formik.values.sku}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter SKU"
                    className={fieldError("sku") ? "border-red-500" : ""}
                  />
                  {fieldError("sku") && <p className="text-sm text-red-500">{fieldError("sku")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formik.values.categoryId}
                      onValueChange={(value) => formik.setFieldValue("categoryId", value)}
                    >
                      <SelectTrigger className={fieldError("categoryId") ? "border-red-500" : ""}>
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>No categories found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCategoryDialogOpen(true)}
                      title="Add new category"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {fieldError("categoryId") && <p className="text-sm text-red-500">{fieldError("categoryId")}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formik.values.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g. Wireless, Waterproof)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formik.values.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                      {feature}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFeature(feature)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 1: Pricing ── */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set the pricing for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="0.00"
                    className={fieldError("price") ? "border-red-500" : ""}
                  />
                  {fieldError("price") && <p className="text-sm text-red-500">{fieldError("price")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formik.values.comparePrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="0.00"
                    className={fieldError("comparePrice") ? "border-red-500" : ""}
                  />
                  {fieldError("comparePrice") && (
                    <p className="text-sm text-red-500">{fieldError("comparePrice")}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Media ── */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload images for your product</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={formik.values.images}
                onChange={(images) => formik.setFieldValue("images", images)}
                error={fieldError("images")}
              />
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Variants ── */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Create variants for different sizes, colors, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <VariantMatrix
                variants={formik.values.variants}
                onChange={(variants) => formik.setFieldValue("variants", variants)}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-2">
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (formik.values.name.trim() && !formik.isSubmitting) {
                    handleFinalSubmit(true)
                  } else {
                    router.back()
                  }
                }}
              >
                {formik.values.name.trim() ? "Save Draft & Exit" : "Cancel"}
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 && (
               <Button 
                type="button" 
                variant="secondary" 
                disabled={formik.isSubmitting} 
                onClick={() => handleFinalSubmit(true)}
              >
                {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save as Draft
              </Button>
            )}
            {!isLastStep ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" disabled={formik.isSubmitting} onClick={() => handleFinalSubmit(false)}>
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Add Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for your products.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDesc">Description</Label>
              <Input
                id="categoryDesc"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryImage">Category Image</Label>
              <ImageUpload
                images={newCategoryImage ? [newCategoryImage] : []}
                onChange={(urls) => setNewCategoryImage(urls[0] || "")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateCategory} disabled={categoryCreating}>
                {categoryCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}