const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface AdminLoginPayload {
  email: string
  password: string
}

export interface AdminData {
  id: string
  fullName: string
  email: string
  bio: string | null        
  lastLogin: string | null  
}

export interface AdminLoginResponse {
  success: boolean
  message: string
  data: {
    admin: AdminData
    token: string
  }
}

class AdminAuthApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "AdminAuthApiError"
    this.status = status
  }
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json()
    return errorData?.message || "Request failed"
  } catch {
    return "Request failed"
  }
}

const validateApiBaseUrl = (): string => {
  if (!API_BASE_URL) {
    throw new AdminAuthApiError("NEXT_PUBLIC_API_BASE_URL is not configured")
  }
  return API_BASE_URL
}

export const loginAdmin = async (
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> => {
  try {
    const baseUrl = validateApiBaseUrl()

    const response = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new AdminAuthApiError(errorMessage, response.status)
    }

    const data: AdminLoginResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof AdminAuthApiError) {
      throw error
    }
    throw new AdminAuthApiError("Unable to connect to the server")
  }
}

export const forgotAdminPassword = async (payload: { email: string }) => {
  const baseUrl = validateApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/admin/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new AdminAuthApiError(errorMessage, response.status)
  }
  return response.json()
}

export const resetAdminPassword = async (payload: {
  token: string
  newPassword: string
  confirmPassword: string
}) => {
  const baseUrl = validateApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/admin/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new AdminAuthApiError(errorMessage, response.status)
  }
  return response.json()
}