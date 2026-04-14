import { Loader2 } from "lucide-react"

interface AdminLoaderProps {
  message?: string
  minHeight?: string
}

export function AdminLoader({ 
  message = "Loading...", 
  minHeight = "min-h-[400px]" 
}: AdminLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center w-full ${minHeight} gap-4`}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 animate-pulse" />
        <Loader2 className="h-12 w-12 animate-spin text-primary absolute inset-0" />
      </div>
      <p className="text-muted-foreground animate-pulse font-medium">{message}</p>
    </div>
  )
}
