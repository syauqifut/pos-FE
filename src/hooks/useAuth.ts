import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  AuthData, 
  getAuthData, 
  setAuthData, 
  clearAuthData
} from '../utils/auth'
import { apiPost } from '../utils/apiClient'
import { t } from '../utils/i18n'

interface UseAuthReturn {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  
  // Utils
  refreshAuthState: () => void
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage
  const refreshAuthState = useCallback(() => {
    const authData = getAuthData()
    if (authData) {
      setUser(authData.user)
      setToken(authData.token)
      setIsAuthenticated(true)
    } else {
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    refreshAuthState()
  }, [refreshAuthState])

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API login call - replace with real API endpoint
      // const response = await apiPost<AuthData>('/api/auth/login', credentials)
      
      // For demo purposes, simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (credentials.username === 'admin' && credentials.password === 'password') {
        const mockAuthData: AuthData = {
          token: 'mock_jwt_token_' + Date.now(),
          user: {
            id: '1',
            username: credentials.username,
            fullName: 'John Doe',
            email: 'john.doe@company.com',
            role: 'admin'
          }
        }
        
        // Store auth data
        setAuthData(mockAuthData)
        
        // Update state
        setUser(mockAuthData.user)
        setToken(mockAuthData.token)
        setIsAuthenticated(true)
        
        return
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.loginError')
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call logout API endpoint
      try {
        await apiPost('/api/auth/logout', {})
      } catch (apiError) {
        // Log API error but don't prevent logout
        console.error('Logout API call failed:', apiError)
        // In some cases, you might want to show an error but still logout locally
        // For now, we'll proceed with local logout
      }
      
      // Clear local auth data regardless of API response
      clearAuthData()
      
      // Update state
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      
      // Redirect to login
      navigate('/login', { replace: true })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.logoutError')
      setError(errorMessage)
      console.error('Logout error:', err)
      
      // Even if logout fails, we should clear local data
      clearAuthData()
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Utils
    refreshAuthState
  }
}

export default useAuth 