"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface Variant {
  size: string
  color: string
  price: string
  stock: string
}

interface VariantMatrixProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
}

export function VariantMatrix({ variants, onChange }: VariantMatrixProps) {
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()])
      setNewSize("")
    }
  }

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()])
      setNewColor("")
    }
  }

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size))
    onChange(variants.filter((v) => v.size !== size))
  }

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color))
    onChange(variants.filter((v) => v.color !== color))
  }

  const updateVariant = (size: string, color: string, field: keyof Variant, value: string) => {
    const existingVariantIndex = variants.findIndex((v) => v.size === size && v.color === color)

    if (existingVariantIndex >= 0) {
      const updatedVariants = [...variants]
      updatedVariants[existingVariantIndex] = {
        ...updatedVariants[existingVariantIndex],
        [field]: value,
      }
      onChange(updatedVariants)
    } else {
      const newVariant: Variant = {
        size,
        color,
        price: "",
        stock: "",
        [field]: value,
      }
      onChange([...variants, newVariant])
    }
  }

  const getVariant = (size: string, color: string) => {
    return (
      variants.find((v) => v.size === size && v.color === color) || {
        size,
        color,
        price: "",
        stock: "",
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Sizes</Label>
          <div className="flex gap-2">
            <Input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Add size"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
            />
            <Button type="button" onClick={addSize}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Badge key={size} variant="secondary" className="flex items-center gap-1">
                {size}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeSize(size)} />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Colors</Label>
          <div className="flex gap-2">
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Add color"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
            />
            <Button type="button" onClick={addColor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Badge key={color} variant="secondary" className="flex items-center gap-1">
                {color}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {sizes.length > 0 && colors.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((size) =>
                colors.map((color) => {
                  const variant = getVariant(size, color)
                  return (
                    <TableRow key={`${size}-${color}`}>
                      <TableCell className="font-medium">{size}</TableCell>
                      <TableCell>{color}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(size, color, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(size, color, "stock", e.target.value)}
                          placeholder="0"
                          className="w-20"
                        />
                      </TableCell>
                    </TableRow>
                  )
                }),
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
