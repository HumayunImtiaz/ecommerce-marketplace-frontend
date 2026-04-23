"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  error?: string | null
}

export function ImageUpload({ images, onChange, error }: ImageUploadProps) {
  // Use Sonner toast via direct import
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [images]
  )

  const handleFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      setUploadError("Only image files are allowed (jpg, png, webp etc.)")
      return
    }

    const formData = new FormData()
    imageFiles.forEach((file) => formData.append("images", file))

    try {
      setUploading(true)
      setUploadError(null)

      // ── Next.js API route pe call — server pe cookie se token lega ──
      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result?.success) {
        const msg = result?.message || "Failed to upload images"
        setUploadError(msg)
        toast.error(`Upload Failed: ${msg}`)
        return
      }

      onChange([...images, ...result.data])
      toast.success(`${result.data.length} image(s) uploaded successfully.`)
    } catch {
      const msg = "Failed to connect to server. Please try again."
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const openFilePicker = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = "image/*"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) handleFiles(files)
    }
    input.click()
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${error || uploadError ? "border-red-500" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {images.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-muted rounded-full">
              {uploading
                ? <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                : <Upload className="h-8 w-8 text-muted-foreground" />
              }
            </div>
            <div>
              <p className="text-lg font-medium">
                {uploading ? "Uploading images..." : "Drop images here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploading ? "Please wait..." : "or click to browse files"}
              </p>
            </div>
            <Button type="button" variant="outline" disabled={uploading} onClick={openFilePicker}>
              {uploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                : "Browse Files"
              }
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={getImageUrl(image)}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {uploading
                  ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  : <ImageIcon className="h-5 w-5 text-muted-foreground" />
                }
                <span className="text-xs text-muted-foreground">
                  {uploading ? "..." : "Add more"}
                </span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {images.length} image(s) • Hover to remove • First image is main
            </p>
          </div>
        )}
      </div>

      {/* ── Errors screen pe show karo ── */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {error && !uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}