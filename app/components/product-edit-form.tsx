"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormik, FieldArray, FormikProvider } from "formik"
import * as Yup from "yup"
import slugify from "slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  X,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  ImageIcon,
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "sonner"
import type { ProductEditData } from "@/app/admin/products/[slug]/edit/page"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface CategoryItem {
  _id: string
  name: string
  slug: string
  isActive: boolean
  isFeatured: boolean
}

// ─── Yup Validation Schema ────────────────────────────────────────────────────
const variantSchema = Yup.object({
  size: Yup.string().trim().required("Size is required"),
  color: Yup.string().trim().required("Color is required"),
  price: Yup.string()
    .test(
      "is-valid-price",
      "Must be a valid price (0 or more)",
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0)
    )
    .optional(),
  stock: Yup.string()
    .test(
      "is-valid-stock",
      "Must be a whole number (0 or more)",
      (val) => !val || (!isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 0)
    )
    .optional(),
})

const editProductSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").required("Product name is required"),
  slug: Yup.string().trim().min(1, "Slug cannot be empty").required("Slug is required"),
  description: Yup.string().trim().optional(),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price must be 0 or more")
    .required("Price is required"),
  comparePrice: Yup.number()
    .typeError("Compare price must be a number")
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
  sku: Yup.string().trim().min(1, "SKU is required").required("SKU is required"),
  categoryId: Yup.string().trim().required("Category is required"),
  tags: Yup.array().of(Yup.string()),
  images: Yup.array().of(Yup.string()),
  features: Yup.array().of(Yup.string()),
  isActive: Yup.boolean(),
  isFeatured: Yup.boolean(),
  variants: Yup.array().of(variantSchema),
})

interface Props {
  product: ProductEditData
}

export default function ProductEditForm({ product }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [newTag, setNewTag] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories`)
        const result = await response.json()
        if (result?.success && Array.isArray(result.data)) {
          setCategories(result.data.filter((c: CategoryItem) => c.isActive))
        }
      } catch {
        console.error("Failed to fetch categories")
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const formik = useFormik({
    initialValues: {
      name: product.name ?? "",
      slug: product.slug ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : "",
      sku: product.sku ?? "",
      categoryId: product.category?._id ?? "",
      tags: product.tags ?? [],
      features: (product as any).features ?? [],
      images: product.images ?? [],
      isActive: product.isActive ?? true,
      isFeatured: (product as any).isFeatured ?? false,
      variants: product.variants.map((v) => ({
        size: v.size,
        color: v.color,
        price: v.price != null ? String(v.price) : "",
        stock: v.stock?.quantity != null ? String(v.stock.quantity) : "0",
      })),
    },
    validationSchema: editProductSchema,
    onSubmit: async (values) => {
      setSubmitError(null)
      setSubmitSuccess(false)

      try {
        // Auto-add any pending feature or tag
        const finalFeatures = [...values.features]
        if (newFeature.trim() && !finalFeatures.includes(newFeature.trim())) {
          finalFeatures.push(newFeature.trim())
        }

        const payload = {
          name: values.name,
          slug: values.slug,
          description: values.description || null,
          price: Number(values.price),
          comparePrice: values.comparePrice ? Number(values.comparePrice) : null,
          sku: values.sku,
          categoryId: values.categoryId,
          tags: values.tags,
          features: finalFeatures,
          images: values.images,
          isActive: values.isActive,
          isFeatured: values.isFeatured,
          variants: values.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            price: v.price ? Number(v.price) : null,
            stock: v.stock ? Number(v.stock) : 0,
          })),
        }

        const response = await fetch(
          `/api/products/${product.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        )

        const result = await response.json()

        if (result?.success) {
          setSubmitSuccess(true)
          setTimeout(() => router.push("/admin/products"), 1200)
        } else {
          setSubmitError(result?.message || "Failed to update product")
        }
      } catch {
        setSubmitError("Failed to connect to server")
      }
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    formik.setFieldValue("name", name)
    if (name) {
      formik.setFieldValue("slug", slugify(name, { lower: true, strict: true }))
    }
  }

  // Tag handlers
  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase()
    if (trimmed && !formik.values.tags.includes(trimmed)) {
      formik.setFieldValue("tags", [...formik.values.tags, trimmed])
    }
    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    formik.setFieldValue(
      "tags",
      formik.values.tags.filter((t) => t !== tag)
    )
  }

  const handleAddFeature = () => {
    const trimmed = newFeature.trim()
    if (trimmed && !formik.values.features.includes(trimmed)) {
      formik.setFieldValue("features", [...formik.values.features, trimmed])
    }
    setNewFeature("")
  }

  const handleRemoveFeature = (feature: string) => {
    formik.setFieldValue(
      "features",
      formik.values.features.filter((f: string) => f !== feature)
    )
  }

  const getFieldError = (field: string) => {
    const touched = (formik.touched as any)[field]
    const error = (formik.errors as any)[field]
    return touched && error ? (error as string) : null
  }

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* ─── Basic Info ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Core product details and categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Classic Cotton T-Shirt"
                  {...formik.getFieldProps("name")}
                  onChange={handleNameChange}
                  className={getFieldError("name") ? "border-destructive" : ""}
                />
                {getFieldError("name") && (
                  <p className="text-xs text-destructive">{getFieldError("name")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  {...formik.getFieldProps("slug")}
                  className={`font-mono text-sm ${getFieldError("slug") ? "border-destructive" : ""}`}
                />
                {getFieldError("slug") && (
                  <p className="text-xs text-destructive">{getFieldError("slug")}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the product..."
                rows={4}
                {...formik.getFieldProps("description")}
              />
            </div>

            {/* Category & SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.categoryId}
                  onValueChange={(val) => formik.setFieldValue("categoryId", val)}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className={getFieldError("categoryId") ? "border-destructive" : ""}>
                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("categoryId") && (
                  <p className="text-xs text-destructive">{getFieldError("categoryId")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sku"
                  placeholder="e.g. TSHIRT-BLK-M"
                  className={`font-mono text-sm ${getFieldError("sku") ? "border-destructive" : ""}`}
                  {...formik.getFieldProps("sku")}
                />
                {getFieldError("sku") && (
                  <p className="text-xs text-destructive">{getFieldError("sku")}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Switch
                id="isActive"
                checked={formik.values.isActive}
                onCheckedChange={(val) => formik.setFieldValue("isActive", val)}
              />
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  {formik.values.isActive ? "Active" : "Draft"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formik.values.isActive
                    ? "Product is visible to customers"
                    : "Product is hidden from storefront"}
                </p>
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Switch
                id="isFeatured"
                checked={formik.values.isFeatured}
                onCheckedChange={(val) => formik.setFieldValue("isFeatured", val)}
              />
              <div>
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  {formik.values.isFeatured ? "⭐ Featured" : "Not Featured"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formik.values.isFeatured
                    ? "Product will show Featured badge on store"
                    : "Enable to highlight this product on store"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Product Images ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Images</CardTitle>
            <CardDescription>Upload and manage product photos</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formik.values.images}
              onChange={(images) => formik.setFieldValue("images", images)}
              error={getFieldError("images")}
            />
          </CardContent>
        </Card>

        {/* ─── Pricing ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
            <CardDescription>Set the selling and compare price</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">
                Price ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...formik.getFieldProps("price")}
                className={getFieldError("price") ? "border-destructive" : ""}
              />
              {getFieldError("price") && (
                <p className="text-xs text-destructive">{getFieldError("price")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comparePrice">Compare Price ($)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (optional)"
                {...formik.getFieldProps("comparePrice")}
                className={getFieldError("comparePrice") ? "border-destructive" : ""}
              />
              {getFieldError("comparePrice") && (
                <p className="text-xs text-destructive">{getFieldError("comparePrice")}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Set higher than price to show a discount
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Tags ───────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
            <CardDescription>Help customers find your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formik.values.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formik.values.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1.5 pr-1.5">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Features ─────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
            <CardDescription>List product features shown to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature (e.g. Wireless, 4K Display)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddFeature()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formik.values.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formik.values.features.map((feature: string) => (
                  <Badge key={feature} variant="outline" className="gap-1.5 pr-1.5 bg-blue-50 text-blue-700 border-blue-200">
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Variants ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Variants</CardTitle>
              <CardDescription>Size, color and stock for each variant</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                formik.setFieldValue("variants", [
                  ...formik.values.variants,
                  { size: "", color: "", price: "", stock: "0" },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent>
            {formik.values.variants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No variants added. Click "Add Variant" to add size/color combinations.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Price ($)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formik.values.variants.map((variant, index) => {
                    const variantErrors =
                      (formik.errors.variants as any)?.[index] ?? {}
                    const variantTouched =
                      (formik.touched.variants as any)?.[index] ?? {}

                    return (
                      <TableRow key={index}>
                        <TableCell className="py-2">
                          <Input
                            placeholder="e.g. M, L, XL"
                            value={variant.size}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `variants[${index}].size`,
                                e.target.value
                              )
                            }
                            className={
                              variantTouched.size && variantErrors.size
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {variantTouched.size && variantErrors.size && (
                            <p className="text-xs text-destructive mt-1">
                              {variantErrors.size}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            placeholder="e.g. Black, Red"
                            value={variant.color}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `variants[${index}].color`,
                                e.target.value
                              )
                            }
                            className={
                              variantTouched.color && variantErrors.color
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {variantTouched.color && variantErrors.color && (
                            <p className="text-xs text-destructive mt-1">
                              {variantErrors.color}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Optional"
                            value={variant.price}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `variants[${index}].price`,
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={variant.stock}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `variants[${index}].stock`,
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              const updated = formik.values.variants.filter(
                                (_, i) => i !== index
                              )
                              formik.setFieldValue("variants", updated)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ─── Submit ─────────────────────────────────────────────────────── */}
        {submitError && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            <X className="h-4 w-4 flex-shrink-0" />
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Product updated successfully! Redirecting...
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => formik.resetForm()}
            disabled={formik.isSubmitting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="min-w-[120px]"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </FormikProvider>
  )
}