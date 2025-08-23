// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // If on production domain kanbanpm.com, use api.kanbanpm.com
  if (window.location.hostname === 'kanbanpm.com') {
    return 'https://api.kanbanpm.com'
  }
  
  // If in production (other deployed domains), use the current domain with /api
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}/api`
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api'
}

const API_BASE_URL = getApiBaseUrl()

// Debug log the API base URL
console.log('API_BASE_URL:', API_BASE_URL)
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Current hostname:', window.location.hostname)

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Debug logging
  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    API_BASE_URL,
    endpoint
  })
  
  // Get access token from localStorage
  const accessToken = localStorage.getItem('accessToken')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0, { originalError: error })
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) => 
    request<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  patch: <T>(endpoint: string, data?: any) => 
    request<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  put: <T>(endpoint: string, data?: any) => 
    request<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}