import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg"
  
  // If it's already a correct external URL (like an S3 bucket or another site), return it
  if (path.startsWith("http") && !path.includes("localhost")) return path
  
  let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  
  // The backend serves uploads at the root domain, not under /api
  const staticBaseUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl
  
  // If the path contains localhost (from old database entries), replace it with the current staticBaseUrl
  if (path.includes("localhost:5000") || path.includes("localhost:5001")) {
    return path.replace(/http:\/\/localhost:500[01](\/api)?/, staticBaseUrl)
  }
  
  // If it's a static frontend asset (e.g., /hero.jpg, /logo.png), return as is
  if (path.startsWith("/") && !path.startsWith("/uploads")) {
    return path
  }
  
  // Remove leading slash
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  
  // If it already has uploads prefix, just add staticBaseUrl
  if (cleanPath.startsWith("uploads/")) {
    return `${staticBaseUrl}/${cleanPath}`
  }
  
  // Otherwise add both
  return `${staticBaseUrl}/uploads/${cleanPath}`
}
