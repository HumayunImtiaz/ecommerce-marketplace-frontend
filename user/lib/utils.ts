import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg"
  
  // If it's already a correct external URL (like an S3 bucket or another site), return it
  if (path.startsWith("http") && !path.includes("localhost")) return path
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  
  // If the path contains localhost (from old database entries), replace it with the current baseUrl
  if (path.includes("localhost:5000")) {
    return path.replace("http://localhost:5000", baseUrl)
  }
  
  // Remove leading slash
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  
  // If it already has uploads prefix, just add baseUrl
  if (cleanPath.startsWith("uploads/")) {
    return `${baseUrl}/${cleanPath}`
  }
  
  // Otherwise add both
  return `${baseUrl}/uploads/${cleanPath}`
}
