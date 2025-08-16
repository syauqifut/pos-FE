import { getToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  // Get the saved token
  const token = getToken()
  
  // Prepare headers with authorization if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
    // console.log('error di req', error.message)
  }

  return res.json()
}

export const apiGet = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      return apiRequest<T>(endpoint, { method: 'GET', ...options })
}

export const apiPost = async <T = any>(endpoint: string, body: object): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export const apiPut = async <T = any>(endpoint: string, body: object): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

export const apiDelete = async <T = any>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}
