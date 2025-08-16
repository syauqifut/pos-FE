export interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role?: string
}

export interface AuthData {
  token: string
  user: User
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Token management
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Error setting token:', error)
  }
}

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error removing token:', error)
  }
}

// User data management
export const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const setUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error setting user data:', error)
  }
}

export const removeUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error removing user data:', error)
  }
}

// Combined auth data management
export const setAuthData = (authData: AuthData): void => {
  setToken(authData.token)
  setUser(authData.user)
}

export const getAuthData = (): AuthData | null => {
  const token = getToken()
  const user = getUser()
  
  if (token && user) {
    return { token, user }
  }
  
  return null
}

export const clearAuthData = (): void => {
  removeToken()
  removeUser()
}

// Auth state checks
export const isAuthenticated = (): boolean => {
  const token = getToken()
  const user = getUser()
  return !!(token && user)
}

export const hasValidToken = (): boolean => {
  const token = getToken()
  if (!token) return false
  
  try {
    // Check if token exists and has valid format
    if (token.length === 0) return false
    
    // Check JWT token expiration if it's a JWT
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token has expired')
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
} 