import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg"
  
  if (path.startsWith("http") && !path.includes("localhost")) return path
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  
  if (path.includes("localhost:5000")) {
    return path.replace("http://localhost:5000", baseUrl)
  }
  
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  
  if (cleanPath.startsWith("uploads/")) {
    return `${baseUrl}/${cleanPath}`
  }
  
  return `${baseUrl}/uploads/${cleanPath}`
}
