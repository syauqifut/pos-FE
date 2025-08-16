import React, { forwardRef } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  fullWidth?: boolean
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  fullWidth = false,
  required = false,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [internalType, setInternalType] = React.useState(type)

  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInternalType(showPassword ? 'text' : 'password')
    } else {
      setInternalType(type)
    }
  }, [type, showPassword, showPasswordToggle])

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const hasError = !!error
  const hasLeftIcon = !!leftIcon
  const hasRightIcon = !!rightIcon || (type === 'password' && showPasswordToggle) || hasError

  const baseInputClasses = `
    block w-full px-2 py-1.5 border rounded-md text-sm
    placeholder-gray-400 text-gray-900
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    transition-colors duration-200
  `

  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary focus:ring-primary'

  const paddingClasses = `
    ${hasLeftIcon ? 'pl-8' : 'pl-2'}
    ${hasRightIcon ? 'pr-8' : 'pr-2'}
  `

  const containerWidth = fullWidth ? 'w-full' : ''

  return (
    <div className={`${containerWidth} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-0.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <div className="text-gray-400 w-4 h-4">
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={internalType}
          disabled={disabled}
          required={required}
          className={`
            ${baseInputClasses}
            ${stateClasses}
            ${paddingClasses}
          `}
          {...props}
        />

        {/* Right Icons */}
        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <div className="flex items-center space-x-1">
              {/* Error Icon */}
              {hasError && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              
              {/* Password Toggle */}
              {type === 'password' && showPasswordToggle && (
                <button
                  type="button"
                  onClick={togglePassword}
                  disabled={disabled}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {/* Custom Right Icon */}
              {rightIcon && !hasError && (
                <div className="text-gray-400 w-4 h-4">
                  {rightIcon}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 