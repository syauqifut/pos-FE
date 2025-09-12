import React, { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '../components/ui'
import { getUser, getToken, clearAuthData, hasValidToken } from '../utils/auth'
import { apiGet } from '../utils/apiClient'
import { t } from '../utils/i18n'

interface RequireAuthProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  fallback,
  redirectTo = '/login'
}) => {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const token = getToken()
        const user = getUser()
        
        // Basic validation - check if token and user exist
        if (!token || !user) {
          setIsAuth(false)
          setIsLoading(false)
          return
        }
        
        // Check token validity (including expiration)
        if (!hasValidToken()) {
          console.warn('Token validation failed - clearing auth data')
          clearAuthData()
          setIsAuth(false)
          setIsLoading(false)
          return
        }
        
        // Validate token with API call (optional - for server-side validation)
        try {
          // Call a protected endpoint to validate token
          await apiGet<{ success: boolean }>('/api/auth/verify')
          setIsAuth(true)
        } catch (error) {
          console.error('Token validation failed:', error)
          // Token is invalid, clear auth data
          clearAuthData()
          setIsAuth(false)
        }
        
      } catch (error) {
        console.error('Auth check failed:', error)
        clearAuthData()
        setIsAuth(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [location.pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
          <Loader 
            size="lg" 
            text={t('auth.checkingAuth')}
            className="py-8"
          />
        </div>
      )
    )
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuth) {
    return (
      <Navigate 
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // If authenticated, render the protected content
  return <>{children}</>
}

export default RequireAuth 