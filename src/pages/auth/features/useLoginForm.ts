import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { setAuthData, AuthData } from '../../../utils/auth'
import { t } from '../../../utils/i18n'
import { apiPost } from '../../../utils/apiClient'

interface LoginFormData {
  username: string
  password: string
}

interface LoginFormErrors {
  username?: string
  password?: string
  general?: string
}

interface UseLoginFormOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseLoginFormReturn {
  // Form data
  formData: LoginFormData
  errors: LoginFormErrors
  
  // State
  isSubmitting: boolean
  isLoading: boolean
  
  // Actions
  setUsername: (value: string) => void
  setPassword: (value: string) => void
  clearError: (field: keyof LoginFormErrors) => void
  clearAllErrors: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  
  // Validation
  validateForm: () => boolean
}

export const useLoginForm = (options: UseLoginFormOptions = {}): UseLoginFormReturn => {
  const { onSuccess, onError } = options
  const navigate = useNavigate()
  const location = useLocation()
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })
  
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = t('auth.usernameRequired')
    }

    if (!formData.password.trim()) {
      newErrors.password = t('auth.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const setUsername = (value: string) => {
    setFormData(prev => ({ ...prev, username: value }))
    
    // Clear username error when user starts typing
    if (errors.username) {
      clearError('username')
    }
    
    // Clear general error when user modifies form
    if (errors.general) {
      clearError('general')
    }
  }

  const setPassword = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }))
    
    // Clear password error when user starts typing
    if (errors.password) {
      clearError('password')
    }
    
    // Clear general error when user modifies form
    if (errors.general) {
      clearError('general')
    }
  }

  const clearError = (field: keyof LoginFormErrors) => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }))
  }

  const clearAllErrors = () => {
    setErrors({})
  }

  const loginWithApi = async (credentials: LoginFormData): Promise<AuthData> => {
    try {
      const response = await apiPost('/api/auth/login', credentials)

      return {
        token: response.token,
        user: {
          id: response.user.id.toString(), // Convert number to string for our User interface
          username: response.user.username,
          fullName: response.user.name, // Map 'name' to 'fullName'
          role: response.user.role
        }
      }
    } catch (error: any) {
      const message = error?.message || error || 'Something went wrong'
      console.error('Login failed:', message)

      throw new Error(message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, general: undefined }))

    try {
      // Call the API
      const authData = await loginWithApi(formData)
      
      // Store authentication data
      setAuthData(authData)
      
      // Success callback
      onSuccess?.()
      
      // Get redirect URL from location state or default to dashboard
      const from = (location.state as any)?.from || '/dashboard'
      navigate(from, { replace: true })
      
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof Error) {
        console.log('error.message', error.message)
      } else {
        console.log('error', error)
      }
      const errorMessage =
      error instanceof Error && error.message
        ? error.message
        : t('auth.loginError')
      
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    // Form data
    formData,
    errors,
    
    // State
    isSubmitting,
    isLoading,
    
    // Actions
    setUsername,
    setPassword,
    clearError,
    clearAllErrors,
    handleSubmit,
    
    // Validation
    validateForm
  }
}

export default useLoginForm 