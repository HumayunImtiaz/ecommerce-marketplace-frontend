"use client"

import { useToast } from "@/contexts/ToastContext"
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-xl border shadow-lg max-w-sm ${getBackgroundColor(toast.type)} animate-in slide-in-from-right duration-300`}
        >
          {getIcon(toast.type)}
          <span className="ml-3 text-sm font-medium text-gray-800 flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
